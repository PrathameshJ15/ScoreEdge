import { NextRequest } from 'next/server';
import { dbStore } from '@/lib/db/client';
import { apiSuccess, apiError } from '@/lib/api/response';
import { getAuthUser } from '@/lib/api/auth';
import { revokeEntitlementsForOrder } from '@/lib/payments/entitlements';
import { z } from 'zod';

const RefundRequestSchema = z.object({
  order_id: z.string().min(1, 'Order ID is required'),
  reason: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user) {
      return apiError('UNAUTHORIZED', 'Authentication required to process refunds', 401);
    }

    const json = await request.json().catch(() => null);
    const parseResult = RefundRequestSchema.safeParse(json);

    if (!parseResult.success) {
      return apiError('VALIDATION_ERROR', 'Invalid refund payload', 400, parseResult.error.format());
    }

    const { order_id, reason } = parseResult.data;

    // Security: Only Administrators have clearance to authorize financial refunds
    if (user.role !== 'ADMIN') {
      return apiError('FORBIDDEN', 'Administrator clearance required to authorize refunds', 403);
    }

    const order = dbStore.orders.find((o) => o.id === order_id);
    if (!order) {
      return apiError('NOT_FOUND', 'Order not found', 404);
    }

    if (order.status !== 'PAID') {
      return apiError('BAD_REQUEST', `Cannot refund order in '${order.status}' status`, 400);
    }

    // Transition order to REFUNDED
    order.status = 'REFUNDED';
    order.updated_at = new Date().toISOString();

    // Revoke corresponding active entitlements immediately
    const revokedCount = revokeEntitlementsForOrder(order.id);

    // Update payment record
    const payment = dbStore.payments.find((p) => p.order_id === order.id);
    if (payment) {
      payment.refund_id = `rfnd-${Date.now()}`;
      payment.refund_amount = order.amount_inr;
      payment.failure_reason = reason || 'Customer requested academic refund / reversal';
    }

    return apiSuccess({
      message: 'Order refunded successfully and digital entitlements revoked.',
      order_id: order.id,
      status: order.status,
      revoked_entitlements_count: revokedCount,
      refund_amount_inr: order.amount_inr,
      refund_id: payment?.refund_id,
    });
  } catch (err: unknown) {
    return apiError('INTERNAL_ERROR', 'Failed to process refund', 500, err instanceof Error ? err.message : undefined);
  }
}
