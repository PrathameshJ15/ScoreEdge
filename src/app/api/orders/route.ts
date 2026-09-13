import { NextRequest } from 'next/server';
import { dbStore, paginateArray } from '@/lib/db/client';
import { apiSuccess, apiError } from '@/lib/api/response';
import { getAuthUser } from '@/lib/api/auth';
import { PaginationQuerySchema } from '@/lib/api/validators';
import { Order } from '@/lib/db/types';
import { createRazorpayOrder, getPublicRazorpayKeyId } from '@/lib/payments/razorpay';
import { trackServerEvent } from '@/lib/analytics/service';
import { z } from 'zod';

const OrderCreateSchema = z.object({
  product_id: z.string().min(1),
  idempotency_key: z.string().optional().nullable(),
});

export async function GET(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user) {
      return apiError('UNAUTHORIZED', 'Authentication required', 401);
    }

    const { searchParams } = new URL(request.url);
    const pagination = PaginationQuerySchema.parse({
      page: searchParams.get('page') || 1,
      limit: searchParams.get('limit') || 20,
    });

    // Admins can see all orders or filter by user, normal students see only their own orders
    const isAdmin = user.role === 'ADMIN';
    const filterUserId = searchParams.get('user_id');

    let orders = isAdmin && !filterUserId
      ? [...dbStore.orders]
      : dbStore.orders.filter((o) => o.user_id === (filterUserId && isAdmin ? filterUserId : user.id));

    // Sort newest orders first
    orders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const result = paginateArray(orders, pagination.page, pagination.limit);
    return apiSuccess(result.data, result.pagination);
  } catch (err: unknown) {
    return apiError('INTERNAL_ERROR', 'Failed to retrieve orders', 500, err instanceof Error ? err.message : undefined);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user) {
      return apiError('UNAUTHORIZED', 'Authentication required to place order', 401);
    }

    const json = await request.json().catch(() => null);
    const parseResult = OrderCreateSchema.safeParse(json);

    if (!parseResult.success) {
      return apiError('VALIDATION_ERROR', 'Invalid order creation payload', 400, parseResult.error.format());
    }

    const { product_id, idempotency_key } = parseResult.data;

    // Idempotency: If client supplied an idempotency key and an order already exists, return it
    if (idempotency_key) {
      const existingOrder = dbStore.orders.find(
        (o) => o.user_id === user.id && o.idempotency_key === idempotency_key
      );
      if (existingOrder) {
        const product = dbStore.products.find((p) => p.id === existingOrder.product_id);
        return apiSuccess(
          {
            order: existingOrder,
            product,
            razorpay_key_id: getPublicRazorpayKeyId(),
            is_idempotent_replay: true,
          },
          undefined,
          200
        );
      }
    }

    const product = dbStore.products.find((p) => p.id === product_id && p.is_active);
    if (!product) {
      return apiError('NOT_FOUND', 'Product not found or inactive', 404);
    }

    const orderId = `ord-${Date.now()}`;

    // Initialize order with Razorpay gateway
    const rzpOrder = await createRazorpayOrder({
      amountInr: product.price_inr,
      currency: 'INR',
      receiptId: orderId,
      notes: {
        userId: user.id,
        userEmail: user.email,
        productId: product.id,
        productCode: product.code,
      },
    });

    const newOrder: Order = {
      id: orderId,
      user_id: user.id,
      product_id: product.id,
      amount_inr: product.price_inr,
      currency: 'INR',
      gateway: 'RAZORPAY',
      gateway_order_id: rzpOrder.id,
      idempotency_key: idempotency_key || null,
      status: 'CREATED',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    dbStore.orders.push(newOrder);

    // Track checkout started in conversion funnel
    trackServerEvent('checkout started', {
      userId: user.id,
      properties: {
        product_id: product.id,
        product_type: product.product_type,
        amount_inr: product.price_inr,
      },
      headers: request.headers,
    });

    return apiSuccess(
      {
        order: newOrder,
        product,
        gateway_order: rzpOrder,
        razorpay_key_id: getPublicRazorpayKeyId(),
      },
      undefined,
      201
    );
  } catch (err: unknown) {
    return apiError('INTERNAL_ERROR', 'Failed to initialize order', 500, err instanceof Error ? err.message : undefined);
  }
}
