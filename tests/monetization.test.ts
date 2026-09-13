import { describe, it, expect, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { dbStore } from '../src/lib/db/client';
import { createAuthToken } from '../src/lib/api/auth';
import {
  generateTestPaymentSignature,
  generateTestWebhookSignature,
  verifyPaymentSignature,
  verifyWebhookSignature,
} from '../src/lib/payments/razorpay';
import { checkUserEntitlement } from '../src/lib/payments/entitlements';
import { BUSINESS_CONFIG, formatWhatsAppPurchaseUrl } from '../src/lib/config/business';

// API Handlers
import { GET as getOrdersHandler, POST as createOrderHandler } from '../src/app/api/orders/route';
import { POST as verifyPaymentHandler } from '../src/app/api/payments/verify/route';
import { POST as webhookHandler } from '../src/app/api/payments/webhook/route';
import { POST as refundHandler } from '../src/app/api/payments/refund/route';
import { GET as getEntitlementsHandler } from '../src/app/api/entitlements/route';
import { GET as getNotesHandler } from '../src/app/api/notes/route';
import { GET as getAnswersHandler } from '../src/app/api/answers/route';
import { GET as getQuizDetailHandler } from '../src/app/api/quizzes/[id]/route';
import { POST as createStudyPlanHandler } from '../src/app/api/study-plans/route';
import { GET as getClustersHandler } from '../src/app/api/pyqs/clusters/route';

describe('ScoreEdge Premium Monetization & Payment Security Suite', () => {
  const studentToken = createAuthToken({ id: 'usr-student-1', email: 'student@sppu.ac.in', role: 'STUDENT' });
  const adminToken = createAuthToken({ id: 'usr-admin-1', email: 'admin@scoreedge.in', role: 'ADMIN' });
  const otherStudentToken = createAuthToken({ id: 'usr-student-2', email: 'student2@sppu.ac.in', role: 'STUDENT' });

  beforeEach(() => {
    dbStore.reset();
  });

  describe('Server-Side Order Creation & Security', () => {
    it('creates an order on the server and returns gateway details without exposing secrets', async () => {
      const req = new NextRequest('http://localhost:3000/api/orders', {
        method: 'POST',
        headers: { Authorization: `Bearer ${studentToken}` },
        body: JSON.stringify({
          product_id: 'prod-sub-dbms',
        }),
      });

      const res = await createOrderHandler(req);
      expect(res.status).toBe(201);
      const json = await res.json();

      expect(json.data.order).toBeDefined();
      expect(json.data.order.status).toBe('CREATED');
      expect(json.data.order.amount_inr).toBe(49);
      expect(json.data.order.gateway).toBe('RAZORPAY');
      expect(json.data.order.gateway_order_id).toBeDefined();
      expect(json.data.razorpay_key_id).toBeDefined();

      // Ensure secrets are NEVER exposed in client response
      const rawResponseStr = JSON.stringify(json);
      expect(rawResponseStr.includes('rzp_mock_secret_key')).toBe(false);
      expect(rawResponseStr.includes('rzp_mock_webhook_secret')).toBe(false);
    });

    it('rejects order creation for unauthenticated guests', async () => {
      const req = new NextRequest('http://localhost:3000/api/orders', {
        method: 'POST',
        body: JSON.stringify({ product_id: 'prod-sub-dbms' }),
      });

      const res = await createOrderHandler(req);
      expect(res.status).toBe(401);
    });

    it('returns 404 if product does not exist or is inactive', async () => {
      const req = new NextRequest('http://localhost:3000/api/orders', {
        method: 'POST',
        headers: { Authorization: `Bearer ${studentToken}` },
        body: JSON.stringify({ product_id: 'prod-non-existent' }),
      });

      const res = await createOrderHandler(req);
      expect(res.status).toBe(404);
    });

    it('enforces idempotency on order creation with the same idempotency_key', async () => {
      const idempotencyKey = 'idemp-session-123456';

      // First order attempt
      const req1 = new NextRequest('http://localhost:3000/api/orders', {
        method: 'POST',
        headers: { Authorization: `Bearer ${studentToken}` },
        body: JSON.stringify({ product_id: 'prod-sub-dbms', idempotency_key: idempotencyKey }),
      });
      const res1 = await createOrderHandler(req1);
      const json1 = await res1.json();
      expect(res1.status).toBe(201);

      // Replayed second order attempt
      const req2 = new NextRequest('http://localhost:3000/api/orders', {
        method: 'POST',
        headers: { Authorization: `Bearer ${studentToken}` },
        body: JSON.stringify({ product_id: 'prod-sub-dbms', idempotency_key: idempotencyKey }),
      });
      const res2 = await createOrderHandler(req2);
      const json2 = await res2.json();
      expect(res2.status).toBe(200);
      expect(json2.data.is_idempotent_replay).toBe(true);
      expect(json2.data.order.id).toBe(json1.data.order.id);
    });
  });

  describe('Server-Side Payment Verification & Access Protection', () => {
    it('NEVER unlocks access with invalid cryptographic signature', async () => {
      // 1. Create order
      const orderReq = new NextRequest('http://localhost:3000/api/orders', {
        method: 'POST',
        headers: { Authorization: `Bearer ${studentToken}` },
        body: JSON.stringify({ product_id: 'prod-sub-dbms' }),
      });
      const orderRes = await createOrderHandler(orderReq);
      const order = (await orderRes.json()).data.order;

      // 2. Attacker sends spoofed signature
      const verifyReq = new NextRequest('http://localhost:3000/api/payments/verify', {
        method: 'POST',
        headers: { Authorization: `Bearer ${studentToken}` },
        body: JSON.stringify({
          order_id: order.id,
          razorpay_order_id: order.gateway_order_id,
          razorpay_payment_id: 'pay_spoofed_123',
          razorpay_signature: 'invalid_fraudulent_signature_hash',
        }),
      });

      const verifyRes = await verifyPaymentHandler(verifyReq);
      expect(verifyRes.status).toBe(400);
      const verifyJson = await verifyRes.json();
      expect(verifyJson.error.code).toBe('PAYMENT_VERIFICATION_FAILED');

      // Check that order remains UNPAID
      const checkedOrder = dbStore.orders.find((o) => o.id === order.id);
      expect(checkedOrder?.status).toBe('CREATED');

      // Check failed payment record logged
      const failedPayment = dbStore.payments.find((p) => p.order_id === order.id);
      expect(failedPayment?.status).toBe('FAILED');

      // Confirm student did NOT get entitlement
      const entitlement = dbStore.entitlements.find((e) => e.order_id === order.id);
      expect(entitlement).toBeUndefined();
    });

    it('unlocks entitlement upon valid cryptographic HMAC-SHA256 signature', async () => {
      // 1. Create order
      const orderReq = new NextRequest('http://localhost:3000/api/orders', {
        method: 'POST',
        headers: { Authorization: `Bearer ${studentToken}` },
        body: JSON.stringify({ product_id: 'prod-sub-dbms' }),
      });
      const orderRes = await createOrderHandler(orderReq);
      const order = (await orderRes.json()).data.order;

      const paymentId = 'pay_legit_998877';
      const validSignature = generateTestPaymentSignature(order.gateway_order_id, paymentId);

      // Verify signature validator directly
      expect(
        verifyPaymentSignature({
          orderId: order.gateway_order_id,
          paymentId,
          signature: validSignature,
        })
      ).toBe(true);

      // 2. Send verification request
      const verifyReq = new NextRequest('http://localhost:3000/api/payments/verify', {
        method: 'POST',
        headers: { Authorization: `Bearer ${studentToken}` },
        body: JSON.stringify({
          order_id: order.id,
          razorpay_order_id: order.gateway_order_id,
          razorpay_payment_id: paymentId,
          razorpay_signature: validSignature,
        }),
      });

      const verifyRes = await verifyPaymentHandler(verifyReq);
      expect(verifyRes.status).toBe(200);
      const verifyJson = await verifyRes.json();

      expect(verifyJson.data.order.status).toBe('PAID');
      expect(verifyJson.data.payment.status).toBe('SUCCESS');
      expect(verifyJson.data.entitlement).toBeDefined();
      expect(verifyJson.data.entitlement.access_scope).toBe('SINGLE_SUBJECT');
      expect(verifyJson.data.entitlement.subject_id).toBe('sub-dbms');

      // 3. Idempotent replay: sending same verify payload returns success without duplicate entitlement
      const replayReq = new NextRequest('http://localhost:3000/api/payments/verify', {
        method: 'POST',
        headers: { Authorization: `Bearer ${studentToken}` },
        body: JSON.stringify({
          order_id: order.id,
          razorpay_order_id: order.gateway_order_id,
          razorpay_payment_id: paymentId,
          razorpay_signature: validSignature,
        }),
      });
      const replayRes = await verifyPaymentHandler(replayReq);
      expect(replayRes.status).toBe(200);
      const replayJson = await replayRes.json();
      expect(replayJson.data.is_idempotent).toBe(true);

      const matchingEntitlements = dbStore.entitlements.filter((e) => e.order_id === order.id);
      expect(matchingEntitlements.length).toBe(1);
    });
  });

  describe('Webhook Cryptographic Verification & Event Processing', () => {
    it('rejects webhooks with invalid or missing x-razorpay-signature', async () => {
      const req = new NextRequest('http://localhost:3000/api/payments/webhook', {
        method: 'POST',
        headers: { 'x-razorpay-signature': 'invalid_webhook_sig' },
        body: JSON.stringify({ event: 'payment.captured' }),
      });

      const res = await webhookHandler(req);
      expect(res.status).toBe(400);
    });

    it('processes payment.captured event and creates entitlement', async () => {
      // Create order
      const orderReq = new NextRequest('http://localhost:3000/api/orders', {
        method: 'POST',
        headers: { Authorization: `Bearer ${studentToken}` },
        body: JSON.stringify({ product_id: 'prod-sem-comp' }),
      });
      const order = (await (await createOrderHandler(orderReq)).json()).data.order;

      const webhookPayload = JSON.stringify({
        event: 'payment.captured',
        payload: {
          payment: {
            entity: {
              id: 'pay_wh_12345',
              order_id: order.gateway_order_id,
              amount: 19900,
              method: 'upi',
            },
          },
          order: {
            entity: {
              id: order.gateway_order_id,
              receipt: order.id,
            },
          },
        },
      });

      const validSig = generateTestWebhookSignature(webhookPayload);
      expect(verifyWebhookSignature({ rawBody: webhookPayload, signature: validSig })).toBe(true);

      const req = new NextRequest('http://localhost:3000/api/payments/webhook', {
        method: 'POST',
        headers: {
          'x-razorpay-signature': validSig,
        },
        body: webhookPayload,
      });

      const res = await webhookHandler(req);
      expect(res.status).toBe(200);

      const updatedOrder = dbStore.orders.find((o) => o.id === order.id);
      expect(updatedOrder?.status).toBe('PAID');

      const entitlement = dbStore.entitlements.find((e) => e.order_id === order.id);
      expect(entitlement).toBeDefined();
      expect(entitlement?.access_scope).toBe('SEMESTER_ALL');
    });

    it('processes refund.processed webhook event and revokes active entitlements', async () => {
      // First create and pay order
      const orderReq = new NextRequest('http://localhost:3000/api/orders', {
        method: 'POST',
        headers: { Authorization: `Bearer ${studentToken}` },
        body: JSON.stringify({ product_id: 'prod-sub-dbms' }),
      });
      const order = (await (await createOrderHandler(orderReq)).json()).data.order;

      const paymentId = 'pay_to_refund_1122';
      const sig = generateTestPaymentSignature(order.gateway_order_id, paymentId);
      await verifyPaymentHandler(
        new NextRequest('http://localhost:3000/api/payments/verify', {
          method: 'POST',
          headers: { Authorization: `Bearer ${studentToken}` },
          body: JSON.stringify({
            order_id: order.id,
            razorpay_order_id: order.gateway_order_id,
            razorpay_payment_id: paymentId,
            razorpay_signature: sig,
          }),
        })
      );

      // Entitlement is active
      const ent = dbStore.entitlements.find((e) => e.order_id === order.id);
      expect(ent?.is_active).toBe(true);

      // Now send refund.processed webhook
      const refundPayload = JSON.stringify({
        event: 'refund.processed',
        payload: {
          refund: {
            entity: {
              id: 'rfnd_9988',
              payment_id: paymentId,
              amount: 4900,
            },
          },
        },
      });

      const refundSig = generateTestWebhookSignature(refundPayload);
      const req = new NextRequest('http://localhost:3000/api/payments/webhook', {
        method: 'POST',
        headers: { 'x-razorpay-signature': refundSig },
        body: refundPayload,
      });

      const res = await webhookHandler(req);
      expect(res.status).toBe(200);

      // Order is marked REFUNDED and entitlement is revoked
      const refundedOrder = dbStore.orders.find((o) => o.id === order.id);
      expect(refundedOrder?.status).toBe('REFUNDED');
      expect(ent?.is_active).toBe(false);
    });
  });

  describe('Refund Endpoint & Reversals', () => {
    it('allows admin to issue refund and revoke entitlements', async () => {
      // 1. Create & verify order
      const orderReq = new NextRequest('http://localhost:3000/api/orders', {
        method: 'POST',
        headers: { Authorization: `Bearer ${studentToken}` },
        body: JSON.stringify({ product_id: 'prod-sub-dbms' }),
      });
      const order = (await (await createOrderHandler(orderReq)).json()).data.order;
      const paymentId = 'pay_admin_refund';
      const sig = generateTestPaymentSignature(order.gateway_order_id, paymentId);
      await verifyPaymentHandler(
        new NextRequest('http://localhost:3000/api/payments/verify', {
          method: 'POST',
          headers: { Authorization: `Bearer ${studentToken}` },
          body: JSON.stringify({
            order_id: order.id,
            razorpay_order_id: order.gateway_order_id,
            razorpay_payment_id: paymentId,
            razorpay_signature: sig,
          }),
        })
      );

      // 2. Admin issues refund
      const refundReq = new NextRequest('http://localhost:3000/api/payments/refund', {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({
          order_id: order.id,
          reason: 'Student purchased wrong branch by mistake',
        }),
      });

      const refundRes = await refundHandler(refundReq);
      expect(refundRes.status).toBe(200);
      const refundJson = await refundRes.json();
      expect(refundJson.data.status).toBe('REFUNDED');
      expect(refundJson.data.revoked_entitlements_count).toBeGreaterThan(0);

      // Entitlement revoked
      const ent = dbStore.entitlements.find((e) => e.order_id === order.id);
      expect(ent?.is_active).toBe(false);
    });
  });

  describe('Entitlement Checking Across Premium Features', () => {
    it('enforces subject-level entitlement on chapter notes', async () => {
      // Clear entitlements for usr-student-1
      dbStore.entitlements = [];

      // Ensure test note exists
      if (!dbStore.notes.some((n) => n.slug === 'dbms-normalization-3nf-bcnf')) {
        dbStore.notes.push({
          id: 'note-test-dbms-1',
          subject_id: 'sub-dbms',
          unit_id: 'unit-dbms-3',
          topic_id: 'topic-dbms-11',
          title: 'DBMS Normalization Complete Guide',
          slug: 'dbms-normalization-3nf-bcnf',
          summary: 'Deep dive into 1NF, 2NF, 3NF, and BCNF',
          content_body: '# Normalization Guide\n\nFull mathematical proofs and decomposition algorithms.',
          read_time_minutes: 15,
          content_status: 'PUBLISHED',
          is_free_preview: false,
          is_premium: true,
          author_id: 'usr-admin-1',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }

      // Note without entitlement -> locked
      const reqLocked = new NextRequest('http://localhost:3000/api/notes?slug=dbms-normalization-3nf-bcnf', {
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      const resLocked = await getNotesHandler(reqLocked);
      const jsonLocked = await resLocked.json();
      expect(jsonLocked.data[0].is_locked).toBe(true);

      // Add DBMS single subject entitlement
      dbStore.entitlements.push({
        id: 'ent-test-dbms',
        user_id: 'usr-student-1',
        product_id: 'prod-sub-dbms',
        subject_id: 'sub-dbms',
        access_scope: 'SINGLE_SUBJECT',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      // Same note with entitlement -> unlocked
      const reqUnlocked = new NextRequest('http://localhost:3000/api/notes?slug=dbms-normalization-3nf-bcnf', {
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      const resUnlocked = await getNotesHandler(reqUnlocked);
      const jsonUnlocked = await resUnlocked.json();
      expect(jsonUnlocked.data[0].is_locked).toBe(false);
      expect(jsonUnlocked.data[0].content_body).toBeDefined();
    });

    it('enforces entitlement on 10-mark solved answers', async () => {
      dbStore.entitlements = [];

      const reqLocked = new NextRequest('http://localhost:3000/api/answers?marks=10', {
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      const resLocked = await getAnswersHandler(reqLocked);
      const jsonLocked = await resLocked.json();
      expect(jsonLocked.data[0].is_locked).toBe(true);

      // Add Semester Pass -> Unlocks all subjects
      dbStore.entitlements.push({
        id: 'ent-test-sem',
        user_id: 'usr-student-1',
        product_id: 'prod-sem-comp',
        access_scope: 'SEMESTER_ALL',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      const reqUnlocked = new NextRequest('http://localhost:3000/api/answers?marks=10', {
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      const resUnlocked = await getAnswersHandler(reqUnlocked);
      const jsonUnlocked = await resUnlocked.json();
      expect(jsonUnlocked.data[0].is_locked).toBe(false);
      expect(jsonUnlocked.data[0].key_points).toBeDefined();
    });

    it('enforces entitlement on Emergency 5-Hour Exam Mode crash plan generation', async () => {
      dbStore.entitlements = [];

      // Without entitlement -> 403 UPGRADE_REQUIRED
      const reqLocked = new NextRequest('http://localhost:3000/api/study-plans', {
        method: 'POST',
        headers: { Authorization: `Bearer ${studentToken}` },
        body: JSON.stringify({
          subject_id: 'sub-dbms',
          duration_type: '5h',
          available_hours: 5.0,
        }),
      });

      const resLocked = await createStudyPlanHandler(reqLocked);
      expect(resLocked.status).toBe(403);
      expect((await resLocked.json()).error.code).toBe('UPGRADE_REQUIRED');

      // Add entitlement -> 201 Created
      dbStore.entitlements.push({
        id: 'ent-test-dbms',
        user_id: 'usr-student-1',
        product_id: 'prod-sub-dbms',
        subject_id: 'sub-dbms',
        access_scope: 'SINGLE_SUBJECT',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      const reqUnlocked = new NextRequest('http://localhost:3000/api/study-plans', {
        method: 'POST',
        headers: { Authorization: `Bearer ${studentToken}` },
        body: JSON.stringify({
          subject_id: 'sub-dbms',
          duration_type: '5h',
          available_hours: 5.0,
        }),
      });

      const resUnlocked = await createStudyPlanHandler(reqUnlocked);
      expect(resUnlocked.status).toBe(201);
    });

    it('enforces entitlement on repeated-question clusters while keeping basic preview free', async () => {
      dbStore.entitlements = [];

      const req = new NextRequest('http://localhost:3000/api/pyqs/clusters?subject_id=sub-dbms', {
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      const res = await getClustersHandler(req);
      const json = await res.json();

      // Top 2 clusters are free preview (not all educational content is hidden!)
      expect(json.data[0].is_locked).toBe(false);
      expect(json.data[1].is_locked).toBe(false);
      // Clusters beyond top 2 are locked
      if (json.data.length > 2) {
        expect(json.data[2].is_locked).toBe(true);
      }
    });
  });

  describe('Centralized WhatsApp Purchase Path', () => {
    it('generates dynamic prefilled WhatsApp URL using centralized configuration', () => {
      const url = formatWhatsAppPurchaseUrl({
        productName: 'DBMS Single Subject Pass',
        productCode: 'prod-sub-dbms',
        priceInr: 49,
        selectedPlan: 'Single Subject Pass',
        subjectName: 'Database Management Systems',
        subjectCode: '210241',
        customerIntent: 'Direct UPI Activation',
        userName: 'Prathamesh Jadhav',
        userEmail: 'student@sppu.ac.in',
      });

      expect(url).toContain('wa.me/');
      expect(url).toContain(BUSINESS_CONFIG.whatsappNumber.replace(/[^0-9]/g, ''));
      expect(url).toContain(encodeURIComponent('DBMS Single Subject Pass'));
      expect(url).toContain(encodeURIComponent('Database Management Systems'));
      expect(url).toContain(encodeURIComponent('student@sppu.ac.in'));
      expect(url).toContain(encodeURIComponent('Direct UPI Activation'));
    });
  });
});
