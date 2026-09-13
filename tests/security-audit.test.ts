import { describe, it, expect, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { dbStore } from '../src/lib/db/client';
import {
  createAuthToken,
  verifyAuthToken,
  hashPassword,
  verifyPassword,
} from '../src/lib/api/auth';
import {
  verifyPaymentSignature,
  verifyWebhookSignature,
  generateTestPaymentSignature,
  generateTestWebhookSignature,
} from '../src/lib/payments/razorpay';
import { validateAIBoundary, sanitizeLogContent } from '../src/lib/ai/guardrails';
import { executeUnifiedSearch } from '../src/lib/search/searchEngine';

// API Handlers
import { GET as getAdminStatsHandler } from '../src/app/api/admin/route';
import { GET as getAdminAuditHandler } from '../src/app/api/admin/audit/route';
import { POST as postAdminVerifyHandler } from '../src/app/api/admin/verify/route';
import { GET as getAdminClustersHandler } from '../src/app/api/admin/clusters/route';
import { DELETE as deleteSubjectHandler } from '../src/app/api/subjects/route';
import { DELETE as deleteQuestionHandler } from '../src/app/api/questions/route';
import { POST as registerHandler } from '../src/app/api/auth/register/route';
import { POST as loginHandler } from '../src/app/api/auth/login/route';
import { POST as forgotPasswordHandler } from '../src/app/api/auth/forgot-password/route';
import { GET as oauthCallbackHandler } from '../src/app/api/auth/oauth/callback/route';
import { POST as refundHandler } from '../src/app/api/payments/refund/route';
import { GET as getQuestionDetailHandler } from '../src/app/api/questions/[id]/route';
import { GET as getNotesHandler } from '../src/app/api/notes/route';
import { GET as getAnswersHandler } from '../src/app/api/answers/route';
import { GET as getProgressHandler, POST as postProgressHandler } from '../src/app/api/progress/route';
import { GET as getOrdersHandler } from '../src/app/api/orders/route';

describe('ScoreEdge Comprehensive Production Security Audit Suite', () => {
  const studentToken = createAuthToken({
    id: 'usr-student-1',
    email: 'student@sppu.ac.in',
    role: 'STUDENT',
  });

  const otherStudentToken = createAuthToken({
    id: 'usr-student-2',
    email: 'student2@sppu.ac.in',
    role: 'STUDENT',
  });

  const adminToken = createAuthToken({
    id: 'usr-admin-1',
    email: 'admin@scoreedge.in',
    role: 'ADMIN',
  });

  beforeEach(() => {
    dbStore.reset();
  });

  describe('1. Authentication & JWT Cryptographic Security', () => {
    it('rejects tampered or forged JWT tokens with timing-safe comparison', () => {
      // 1. Generate valid token
      const validToken = createAuthToken({
        id: 'usr-student-1',
        email: 'student@sppu.ac.in',
        role: 'STUDENT',
      });
      const [payload] = validToken.split('.');

      // 2. Attacker crafts invalid signature of matching length
      const fakeSig = 'a'.repeat(43);
      const forgedToken = `${payload}.${fakeSig}`;

      expect(verifyAuthToken(forgedToken)).toBeNull();
    });

    it('rejects tokens where payload has been altered to claim ADMIN role', () => {
      // Attacker modifies the payload to role ADMIN but leaves student signature
      const tamperedPayload = Buffer.from(
        JSON.stringify({
          id: 'usr-student-1',
          email: 'student@sppu.ac.in',
          role: 'ADMIN',
          exp: Date.now() + 100000,
        })
      ).toString('base64url');

      const legitToken = createAuthToken({
        id: 'usr-student-1',
        email: 'student@sppu.ac.in',
        role: 'STUDENT',
      });
      const [, signature] = legitToken.split('.');

      const forgedAdminToken = `${tamperedPayload}.${signature}`;
      expect(verifyAuthToken(forgedAdminToken)).toBeNull();
    });

    it('produces distinct salt-separated scrypt hashes and verifies correctly', () => {
      const hash1 = hashPassword('MySecurePassword@2026');
      const hash2 = hashPassword('MySecurePassword@2026');

      // Random salts must make hashes distinct even for identical passwords
      expect(hash1).not.toBe(hash2);
      expect(hash1).toContain(':');

      expect(verifyPassword('MySecurePassword@2026', hash1)).toBe(true);
      expect(verifyPassword('WrongPassword', hash1)).toBe(false);
    });

    it('login route strictly verifies password and rejects invalid credentials', async () => {
      const req = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@scoreedge.in',
          password: 'IncorrectPassword',
        }),
      });

      const res = await loginHandler(req);
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.error.code).toBe('INVALID_CREDENTIALS');
    });
  });

  describe('2. Privilege Escalation Prevention', () => {
    it('strictly forbids self-registration as ADMIN or REVIEWER by unauthenticated callers', async () => {
      const req = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'hacker@attacker.com',
          password: 'Password@2026',
          full_name: 'Malicious Actor',
          role: 'ADMIN',
        }),
      });

      const res = await registerHandler(req);
      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.error.code).toBe('FORBIDDEN');
      expect(json.error.message).toContain('Self-registration as administrator or reviewer is forbidden');

      // Confirm account was NOT created
      const found = dbStore.users.find((u) => u.email === 'hacker@attacker.com');
      expect(found).toBeUndefined();
    });

    it('allows authenticated ADMIN to provision an elevated user', async () => {
      const req = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'new.reviewer@scoreedge.in',
          password: 'Password@2026',
          full_name: 'Academic Reviewer',
          role: 'REVIEWER',
        }),
      });

      const res = await registerHandler(req);
      expect(res.status).toBe(201);
      const json = await res.json();
      expect(json.data.user.role).toBe('REVIEWER');
    });
  });

  describe('3. Open Redirect Prevention & Reset Token Protection', () => {
    it('sanitizes OAuth redirect target and prevents open redirect to external domains', async () => {
      // Attacker attempts protocol-relative open redirect //evil.com
      const req = new NextRequest('http://localhost:3000/api/auth/oauth/callback?redirect=//evil.com');
      const res = await oauthCallbackHandler(req);

      const location = res.headers.get('location');
      expect(location).toBeDefined();
      expect(location).not.toContain('evil.com');
      expect(location).toContain('/dashboard');
    });

    it('omits resetToken from forgot-password response in production environment', async () => {
      const originalEnv = process.env.NODE_ENV;
      try {
        (process.env as any).NODE_ENV = 'production';

        const req = new NextRequest('http://localhost:3000/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'student@sppu.ac.in' }),
        });

        const res = await forgotPasswordHandler(req);
        expect(res.status).toBe(200);
        const json = await res.json();
        // In production, resetToken MUST NOT be returned
        expect(json.data.resetToken).toBeUndefined();
        expect(json.data.message).toContain('If an account exists');
      } finally {
        (process.env as any).NODE_ENV = originalEnv;
      }
    });
  });

  describe('4. RBAC Defense-in-Depth & Admin Route Protection', () => {
    it('blocks student token from accessing /api/admin with 403', async () => {
      const req = new NextRequest('http://localhost:3000/api/admin', {
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      const res = await getAdminStatsHandler(req);
      expect(res.status).toBe(403);
    });

    it('blocks student token from accessing /api/admin/audit with 403', async () => {
      const req = new NextRequest('http://localhost:3000/api/admin/audit', {
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      const res = await getAdminAuditHandler(req);
      expect(res.status).toBe(403);
    });

    it('blocks student token from performing verification actions via /api/admin/verify with 403', async () => {
      const req = new NextRequest('http://localhost:3000/api/admin/verify', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${studentToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          entity_type: 'QUESTION',
          entity_id: 'q-dbms-acid',
          status: 'PUBLISHED',
        }),
      });
      const res = await postAdminVerifyHandler(req);
      expect(res.status).toBe(403);
    });

    it('blocks student from deleting subjects via DELETE /api/subjects with 403', async () => {
      const req = new NextRequest('http://localhost:3000/api/subjects?id=sub-dbms', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      const res = await deleteSubjectHandler(req);
      expect(res.status).toBe(403);
    });

    it('blocks student from deleting questions via DELETE /api/questions with 403', async () => {
      const req = new NextRequest('http://localhost:3000/api/questions?id=q-dbms-acid', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      const res = await deleteQuestionHandler(req);
      expect(res.status).toBe(403);
    });

    it('blocks student from initiating payment refunds via POST /api/payments/refund with 403', async () => {
      const req = new NextRequest('http://localhost:3000/api/payments/refund', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${studentToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          order_id: 'ord-1234',
          reason: 'Student unauthorized refund attempt',
        }),
      });
      const res = await refundHandler(req);
      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.error.code).toBe('FORBIDDEN');
    });
  });

  describe('5. Premium Content Masking & Paywall Integrity', () => {
    beforeEach(() => {
      dbStore.entitlements = [];
    });

    it('masks premium answers when retrieved via GET /api/questions/[id]', async () => {
      // Question q-dbms-3nf-bcnf has seeded ans-1 (free) and ans-2 (premium 10 marks)
      const questionId = 'q-dbms-3nf-bcnf';

      // Student calls /api/questions/[id] WITHOUT entitlement
      const req = new NextRequest(`http://localhost:3000/api/questions/${questionId}`, {
        headers: { Authorization: `Bearer ${studentToken}` },
      });

      const res = await getQuestionDetailHandler(req, { params: { id: questionId } });
      expect(res.status).toBe(200);
      const json = await res.json();

      const freeAnswer = json.data.answers.find((a: any) => a.id === 'ans-1');
      expect(freeAnswer).toBeDefined();
      expect(freeAnswer.is_locked).toBe(false);
      expect(freeAnswer.key_points).toBeDefined();

      const premiumAnswer = json.data.answers.find((a: any) => a.id === 'ans-2');
      expect(premiumAnswer).toBeDefined();
      expect(premiumAnswer.is_locked).toBe(true);

      // Sensitive educational solution content MUST be stripped on the server!
      expect(premiumAnswer.key_points).toBeUndefined();
      expect(premiumAnswer.diagram_description).toBeUndefined();
      expect(premiumAnswer.example_text).toBeUndefined();
      expect(premiumAnswer.evaluator_tips).toBeUndefined();
      expect(premiumAnswer.message).toContain('Upgrade to Single Subject Pass');
    });

    it('unlocks premium answers on GET /api/questions/[id] when user has active pass', async () => {
      const questionId = 'q-dbms-3nf-bcnf';

      // Grant student Single Subject pass for DBMS
      dbStore.entitlements.push({
        id: 'ent-audit-valid',
        user_id: 'usr-student-1',
        product_id: 'prod-sub-dbms',
        subject_id: 'sub-dbms',
        access_scope: 'SINGLE_SUBJECT',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      const req = new NextRequest(`http://localhost:3000/api/questions/${questionId}`, {
        headers: { Authorization: `Bearer ${studentToken}` },
      });

      const res = await getQuestionDetailHandler(req, { params: { id: questionId } });
      expect(res.status).toBe(200);
      const json = await res.json();

      const premiumAnswer = json.data.answers.find((a: any) => a.id === 'ans-2');
      expect(premiumAnswer).toBeDefined();
      expect(premiumAnswer.is_locked).toBe(false);
      expect(premiumAnswer.key_points).toBeDefined();
      expect(premiumAnswer.evaluator_tips).toBeDefined();
    });

    it('masks premium notes in GET /api/notes for unentitled users', async () => {
      const req = new NextRequest('http://localhost:3000/api/notes', {
        headers: { Authorization: `Bearer ${studentToken}` },
      });

      const res = await getNotesHandler(req);
      const json = await res.json();

      const premiumNotes = json.data.filter((n: any) => n.is_premium && !n.is_free_preview);
      for (const note of premiumNotes) {
        expect(note.is_locked).toBe(true);
        expect(note.content_body).toBeUndefined();
      }
    });
  });

  describe('6. Cryptographic Payment & Webhook Verification', () => {
    it('verifies valid HMAC-SHA256 signature and rejects fraudulent signatures', () => {
      const orderId = 'order_valid_12345';
      const paymentId = 'pay_valid_998877';
      const validSignature = generateTestPaymentSignature(orderId, paymentId);

      // Valid check
      expect(verifyPaymentSignature({ orderId, paymentId, signature: validSignature })).toBe(true);

      // Tampered orderId check
      expect(verifyPaymentSignature({ orderId: 'order_tampered_999', paymentId, signature: validSignature })).toBe(false);

      // Fraudulent signature check
      expect(verifyPaymentSignature({ orderId, paymentId, signature: 'fraudulent_random_hex_signature' })).toBe(false);
    });

    it('verifies valid Webhook HMAC signature and rejects invalid webhook payloads', () => {
      const payload = JSON.stringify({ event: 'payment.captured', data: { id: 123 } });
      const validSig = generateTestWebhookSignature(payload);

      expect(verifyWebhookSignature({ rawBody: payload, signature: validSig })).toBe(true);
      expect(verifyWebhookSignature({ rawBody: payload + 'tampered', signature: validSig })).toBe(false);
      expect(verifyWebhookSignature({ rawBody: payload, signature: 'tampered_sig' })).toBe(false);
    });
  });

  describe('7. User Data Isolation & Cross-Student Privacy', () => {
    it('forbids Student 1 from reading Student 2 progress', async () => {
      const req = new NextRequest('http://localhost:3000/api/progress?user_id=usr-student-2', {
        headers: { Authorization: `Bearer ${studentToken}` },
      });

      const res = await getProgressHandler(req);
      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.error.code).toBe('ACCESS_DENIED');
    });

    it('forbids Student 1 from modifying Student 2 progress', async () => {
      const req = new NextRequest('http://localhost:3000/api/progress', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${studentToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: 'usr-student-2',
          subject_id: 'sub-dbms',
          item_type: 'TOPIC',
          item_id: 'topic-dbms-1',
          is_completed: true,
        }),
      });

      const res = await postProgressHandler(req);
      expect(res.status).toBe(403);
    });

    it('forbids Student 1 from querying Student 2 orders', async () => {
      // Seed an order for Student 2
      dbStore.orders.push({
        id: 'ord-student-2-private',
        user_id: 'usr-student-2',
        product_id: 'prod-sub-dbms',
        amount_inr: 49,
        currency: 'INR',
        gateway: 'RAZORPAY',
        gateway_order_id: 'order_test_st2',
        idempotency_key: null,
        status: 'PAID',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      const req = new NextRequest('http://localhost:3000/api/orders?user_id=usr-student-2', {
        headers: { Authorization: `Bearer ${studentToken}` },
      });

      const res = await getOrdersHandler(req);
      const json = await res.json();

      // Student 1 must not see Student 2's order
      const hasStudent2Order = json.data.some((o: any) => o.id === 'ord-student-2-private');
      expect(hasStudent2Order).toBe(false);
    });
  });

  describe('8. Search Engine ReDoS & Injection Protection', () => {
    it('handles special regex metacharacters in search queries without crashing or throwing SyntaxError', () => {
      // Queries with regex metacharacters that previously caused SyntaxError in new RegExp(`\\b${token}`)
      const maliciousQueries = [
        'C++',
        'O(n)',
        '(a+b)*',
        '[8 Marks]',
        '\\d+.*',
        'normalize{1,2}',
        'sql?|select',
      ];

      for (const q of maliciousQueries) {
        expect(() => {
          const results = executeUnifiedSearch(q);
          expect(results).toBeDefined();
          expect(Array.isArray(results.results.topics)).toBe(true);
        }).not.toThrow();
      }
    });
  });

  describe('9. AI Negative Constraints & Log Sanitization', () => {
    it('enforces AI boundaries and strictly rejects prohibited system operations', () => {
      expect(validateAIBoundary('login').allowed).toBe(false);
      expect(validateAIBoundary('create_order').allowed).toBe(false);
      expect(validateAIBoundary('delete_question').allowed).toBe(false);
      expect(validateAIBoundary('browse_syllabus_tree').allowed).toBe(false);
      expect(validateAIBoundary('calculate_countdown').allowed).toBe(false);

      // Permitted academic study assistant operations
      expect(validateAIBoundary('explain_concept').allowed).toBe(true);
      expect(validateAIBoundary('generate_exam_rubric').allowed).toBe(true);
    });

    it('sanitizes logs to redact secrets, passwords, Bearer tokens, and API keys', () => {
      const dirtyLog = {
        user: 'student@sppu.ac.in',
        password: 'SuperSecretPassword123',
        authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.fake_sig',
        razorpay_key_secret: 'rzp_live_secret_key_123',
        openai_api_key: 'sk-proj-abc123secretkey',
        normal_field: 'safe_study_data',
      };

      const clean = sanitizeLogContent(dirtyLog);
      expect(clean.password).toBe('[REDACTED_SENSITIVE]');
      expect(clean.authorization).toBe('[REDACTED_SENSITIVE]');
      expect(clean.razorpay_key_secret).toBe('[REDACTED_SENSITIVE]');
      expect(clean.openai_api_key).toBe('[REDACTED_SENSITIVE]');
      expect(clean.normal_field).toBe('safe_study_data');
    });
  });
});
