import { NextRequest } from 'next/server';
import { dbStore } from '@/lib/db/client';
import { apiSuccess, apiError } from '@/lib/api/response';
import { getAuthUser } from '@/lib/api/auth';
import { verifyPaymentSignature } from '@/lib/payments/razorpay';
import { createEntitlementForOrder } from '@/lib/payments/entitlements';
import { trackServerEvent } from '@/lib/analytics/service';
import { Payment } from '@/lib/db/types';
import { z } from 'zod';

const PaymentVerifySchema = z.object({
  order_id: z.string().min(1, 'Order ID is required'),
  razorpay_order_id: z.string().min(1, 'Razorpay Order ID is required'),
  razorpay_payment_id: z.string().min(1, 'Razorpay Payment ID is required'),
  razorpay_signature: z.string().min(1, 'Razorpay Signature is required'),
});

export async function POST(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user) {
      return apiError('UNAUTHORIZED', 'Authentication required to verify payment', 401);
    }

    const json = await request.json().catch(() => null);
    const parseResult = PaymentVerifySchema.safeParse(json);

    if (!parseResult.success) {
      return apiError('VALIDATION_ERROR', 'Invalid payment verification payload', 400, parseResult.error.format());
    }

    const { order_id, razorpay_order_id, razorpay_payment_id, razorpay_signature } = parseResult.data;

    const order = dbStore.orders.find((o) => o.id === order_id);
    if (!order) {
      return apiError('NOT_FOUND', 'Order not found', 404);
    }

    // Security check: Ensure order belongs to current user
    if (order.user_id !== user.id && user.role !== 'ADMIN') {
      return apiError('FORBIDDEN', 'Access denied to this order', 403);
    }

    // Idempotency: If already verified and paid, return existing success state
    if (order.status === 'PAID') {
      const existingEntitlement = dbStore.entitlements.find((e) => e.order_id === order.id);
      const existingPayment = dbStore.payments.find((p) => p.order_id === order.id && p.status === 'SUCCESS');

      return apiSuccess({
        message: 'Payment already verified and active',
        is_idempotent: true,
        order,
        payment: existingPayment,
        entitlement: existingEntitlement,
      });
    }

    // Cryptographic server-side verification using HMAC-SHA256
    // NEVER unlock access without verifying signature against RAZORPAY_KEY_SECRET!
    const isValid = verifyPaymentSignature({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
    });

    if (!isValid) {
      // Record failed payment attempt for security auditing
      const failedPayment: Payment = {
        id: `pay-${Date.now()}`,
        order_id: order.id,
        user_id: user.id,
        amount_inr: order.amount_inr,
        gateway_payment_id: razorpay_payment_id,
        gateway_signature: razorpay_signature,
        status: 'FAILED',
        failure_reason: 'Cryptographic signature mismatch. Unauthorized transaction rejected.',
        created_at: new Date().toISOString(),
      };
      dbStore.payments.push(failedPayment);

      return apiError(
        'PAYMENT_VERIFICATION_FAILED',
        'Cryptographic payment verification failed. Access not granted.',
        400
      );
    }

    // Verification succeeded: Transition order to PAID
    order.status = 'PAID';
    order.updated_at = new Date().toISOString();

    // Record verified payment
    const successfulPayment: Payment = {
      id: `pay-${Date.now()}`,
      order_id: order.id,
      user_id: user.id,
      amount_inr: order.amount_inr,
      gateway_payment_id: razorpay_payment_id,
      gateway_signature: razorpay_signature,
      payment_method: 'RAZORPAY',
      status: 'SUCCESS',
      created_at: new Date().toISOString(),
    };
    dbStore.payments.push(successfulPayment);

    // Track purchase in conversion funnel
    trackServerEvent('payment completed', {
      userId: user.id,
      properties: {
        order_id: order.id,
        product_id: order.product_id,
        amount_inr: order.amount_inr,
      },
      headers: request.headers,
    });

    // Idempotently create or activate student entitlement
    const entitlement = createEntitlementForOrder(order, user);

    return apiSuccess({
      message: 'Payment verified successfully. Premium access unlocked.',
      order,
      payment: successfulPayment,
      entitlement,
    });
  } catch (err: unknown) {
    return apiError(
      'INTERNAL_ERROR',
      'Failed to process payment verification',
      500,
      err instanceof Error ? err.message : undefined
    );
  }
}
