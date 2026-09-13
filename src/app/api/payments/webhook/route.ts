import { NextRequest, NextResponse } from 'next/server';
import { dbStore } from '@/lib/db/client';
import { verifyWebhookSignature } from '@/lib/payments/razorpay';
import { createEntitlementForOrder, revokeEntitlementsForOrder } from '@/lib/payments/entitlements';
import { Payment } from '@/lib/db/types';

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-razorpay-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing x-razorpay-signature header' }, { status: 400 });
    }

    // Cryptographic webhook signature check
    const isValid = verifyWebhookSignature({ rawBody, signature });
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;
    const eventData = payload.payload;

    if (event === 'payment.captured' || event === 'order.paid') {
      const paymentEntity = eventData?.payment?.entity;
      const orderEntity = eventData?.order?.entity;

      const gatewayOrderId = paymentEntity?.order_id || orderEntity?.id;
      const gatewayPaymentId = paymentEntity?.id;
      const receiptId = orderEntity?.receipt;

      const order = dbStore.orders.find(
        (o) => o.gateway_order_id === gatewayOrderId || (receiptId && o.id === receiptId)
      );

      if (order) {
        const user = dbStore.users.find((u) => u.id === order.user_id);
        if (user) {
          // Idempotent order update
          if (order.status !== 'PAID') {
            order.status = 'PAID';
            order.updated_at = new Date().toISOString();

            // Record payment if not already logged
            const existingPayment = dbStore.payments.find(
              (p) => p.order_id === order.id && p.status === 'SUCCESS'
            );
            if (!existingPayment) {
              const paymentRecord: Payment = {
                id: `pay-${Date.now()}`,
                order_id: order.id,
                user_id: user.id,
                amount_inr: order.amount_inr,
                gateway_payment_id: gatewayPaymentId || `pay_wh_${Date.now()}`,
                gateway_signature: signature,
                payment_method: paymentEntity?.method || 'RAZORPAY_WEBHOOK',
                status: 'SUCCESS',
                created_at: new Date().toISOString(),
              };
              dbStore.payments.push(paymentRecord);
            }

            // Idempotent entitlement creation
            createEntitlementForOrder(order, user);
          }
        }
      }
    } else if (event === 'payment.failed') {
      const paymentEntity = eventData?.payment?.entity;
      const gatewayOrderId = paymentEntity?.order_id;
      const order = dbStore.orders.find((o) => o.gateway_order_id === gatewayOrderId);

      if (order) {
        const failedRecord: Payment = {
          id: `pay-${Date.now()}`,
          order_id: order.id,
          user_id: order.user_id,
          amount_inr: order.amount_inr,
          gateway_payment_id: paymentEntity?.id || null,
          gateway_signature: signature,
          status: 'FAILED',
          failure_reason: paymentEntity?.error_description || 'Payment failed at gateway',
          created_at: new Date().toISOString(),
        };
        dbStore.payments.push(failedRecord);
      }
    } else if (event === 'refund.processed' || event === 'refund.created') {
      const refundEntity = eventData?.refund?.entity;
      const paymentId = refundEntity?.payment_id;

      const payment = dbStore.payments.find((p) => p.gateway_payment_id === paymentId);
      if (payment) {
        const order = dbStore.orders.find((o) => o.id === payment.order_id);
        if (order) {
          order.status = 'REFUNDED';
          order.updated_at = new Date().toISOString();

          payment.refund_id = refundEntity?.id || `rfnd-${Date.now()}`;
          payment.refund_amount = (refundEntity?.amount ? refundEntity.amount / 100 : order.amount_inr);

          // Revoke active entitlements
          revokeEntitlementsForOrder(order.id);
        }
      }
    }

    return NextResponse.json({ received: true, event }, { status: 200 });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: 'Webhook processing failed', details: err instanceof Error ? err.message : undefined },
      { status: 500 }
    );
  }
}
