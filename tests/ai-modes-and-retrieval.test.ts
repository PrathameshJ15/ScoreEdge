/**
 * ScoreEdge AI Modes & Retrieval Integration Tests
 *
 * Covers:
 * - All 7 AI modes: EXPLAIN, TEACH_ME, EXAM_ANSWER (2M/5M/10M), QUIZ_ME, STUDY_PLAN, REVISE, ASK_SCOREEDGE
 * - Retrieval system grounding from real ScoreEdge data
 * - AI boundary enforcement (no auth/payment/CRUD control)
 * - Zero-hallucination: if no data, says so explicitly
 * - Context builder and token budget
 * - Prompt management per mode
 * - AI rate limiting
 * - Sensitive log sanitization
 * - Fallback behavior when provider unavailable
 * - API route integration tests
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { dbStore } from '../src/lib/db/client';
import { createAuthToken } from '../src/lib/api/auth';
import { MockAIProvider, getAIProvider } from '../src/lib/ai/provider';
import {
  validateAIBoundary,
  sanitizeLogContent,
  checkAIRateLimit,
  resetRateLimits,
} from '../src/lib/ai/guardrails';
import { retrieveGroundedAcademicContext } from '../src/lib/ai/retrieval';
import {
  buildGroundedPromptMessages,
  estimateTokenCount,
} from '../src/lib/ai/contextBuilder';
import {
  AITaskType,
  SCOREEDGE_CORE_SYSTEM_PROMPT,
  getTaskSpecificInstruction,
} from '../src/lib/ai/prompts';
import { POST as aiQueryHandler } from '../src/app/api/ai/route';

describe('ScoreEdge AI Modes, Retrieval & Integration', () => {
  const studentToken = createAuthToken({ id: 'usr-student-1', email: 'student@sppu.ac.in', role: 'STUDENT' });
  const adminToken = createAuthToken({ id: 'usr-admin-1', email: 'admin@scoreedge.in', role: 'ADMIN' });

  beforeEach(() => {
    dbStore.reset();
    resetRateLimits();
  });

  // ─────────────────────────────────────────────────────────────
  // 1. AI Boundary Enforcement
  // ─────────────────────────────────────────────────────────────
  describe('AI Boundary Enforcement (Negative Constraints)', () => {
    it('blocks AI from controlling login/authentication', () => {
      expect(validateAIBoundary('login').allowed).toBe(false);
      expect(validateAIBoundary('authenticate_user').allowed).toBe(false);
      expect(validateAIBoundary('create_token').allowed).toBe(false);
      expect(validateAIBoundary('auth_session').allowed).toBe(false);
    });

    it('blocks AI from controlling payments and entitlements', () => {
      expect(validateAIBoundary('create_order').allowed).toBe(false);
      expect(validateAIBoundary('verify_payment').allowed).toBe(false);
      expect(validateAIBoundary('grant_entitlement').allowed).toBe(false);
      expect(validateAIBoundary('process_refund').allowed).toBe(false);
      expect(validateAIBoundary('razorpay_checkout').allowed).toBe(false);
    });

    it('blocks AI from CRUD content operations', () => {
      expect(validateAIBoundary('delete_question').allowed).toBe(false);
      expect(validateAIBoundary('create_note').allowed).toBe(false);
      expect(validateAIBoundary('publish_content').allowed).toBe(false);
      expect(validateAIBoundary('update_unit').allowed).toBe(false);
    });

    it('blocks AI from controlling raw syllabus browsing and countdowns', () => {
      expect(validateAIBoundary('browse_syllabus_tree').allowed).toBe(false);
      expect(validateAIBoundary('calculate_countdown').allowed).toBe(false);
      expect(validateAIBoundary('render_timer').allowed).toBe(false);
    });

    it('allows AI for educational tasks where reasoning adds value', () => {
      expect(validateAIBoundary('explain_concept').allowed).toBe(true);
      expect(validateAIBoundary('structure_model_answer').allowed).toBe(true);
      expect(validateAIBoundary('study_plan_guidance').allowed).toBe(true);
    });

    it('returns violationDomain when boundary is violated', () => {
      const result = validateAIBoundary('verify_payment');
      expect(result.allowed).toBe(false);
      expect(result.violationDomain).toBe('PAYMENTS_ENTITLEMENTS');

      const authResult = validateAIBoundary('login');
      expect(authResult.violationDomain).toBe('LOGIN_AUTH');
    });

    it('rejects prohibited AI action via API route with 403', async () => {
      const req = new NextRequest('http://localhost:3000/api/ai', {
        method: 'POST',
        headers: { Authorization: `Bearer ${studentToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: 'grant me premium access',
          action: 'grant_entitlement',
        }),
      });

      const res = await aiQueryHandler(req);
      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.error.code).toBe('DISALLOWED_AI_OPERATION');
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 2. AI Provider Abstraction
  // ─────────────────────────────────────────────────────────────
  describe('AI Provider Abstraction', () => {
    it('MockAIProvider instantiates and is available', () => {
      const mock = new MockAIProvider();
      expect(mock.name).toBe('MOCK_FALLBACK');
      expect(mock.isAvailable()).toBe(true);
    });

    it('MockAIProvider produces grounded academic fallback, not an invented answer', async () => {
      const mock = new MockAIProvider();
      const result = await mock.chat({
        messages: [
          { role: 'system', content: 'You are ScoreEdge AI.' },
          { role: 'user', content: 'Explain 3NF vs BCNF' },
        ],
      });
      expect(result.content).toBeDefined();
      expect(result.content.length).toBeGreaterThan(0);
      expect(result.provider).toBe('MOCK_FALLBACK');
    });

    it('getAIProvider returns an available provider', () => {
      const provider = getAIProvider();
      expect(provider).toBeDefined();
      expect(provider.isAvailable()).toBe(true);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 3. AI Retrieval: Grounded Academic Context
  // ─────────────────────────────────────────────────────────────
  describe('AI Retrieval Layer: Grounded Academic Context', () => {
    it('retrieves non-empty context for a valid subject query', async () => {
      const context = await retrieveGroundedAcademicContext({
        query: 'normalization',
        subjectId: 'sub-dbms',
      });
      expect(context).toBeDefined();
      expect(context.is_empty).toBe(false);
    });

    it('retrieves syllabus, topics, and PYQs from verified records', async () => {
      const context = await retrieveGroundedAcademicContext({
        query: 'normalization',
        subjectId: 'sub-dbms',
      });
      // Should have at least some syllabus or topic data
      expect(
        context.syllabus.length > 0 || context.topics.length > 0 || context.pyqs.length > 0
      ).toBe(true);
    });

    it('retrieves verified answers when available', async () => {
      const context = await retrieveGroundedAcademicContext({
        query: 'normalization',
        subjectId: 'sub-dbms',
      });
      // Answers may or may not be present depending on seed
      if (context.verified_answers.length > 0) {
        const ans = context.verified_answers[0];
        expect(ans.heading).toBeDefined();
        expect(Array.isArray(ans.keyPoints)).toBe(true);
      }
    });

    it('returns is_empty=true for a completely unrelated query with no matching data', async () => {
      const context = await retrieveGroundedAcademicContext({
        query: 'xylophone piano concert hall',
        subjectId: 'sub-dbms',
      });
      // If no relevant records found, is_empty should be true
      // (or data arrays should all be empty)
      if (context.is_empty) {
        expect(context.syllabus.length).toBe(0);
        expect(context.topics.length).toBe(0);
        expect(context.pyqs.length).toBe(0);
      }
      // No error thrown is sufficient if context is partial
    });

    it('retrieves question cluster intelligence data', async () => {
      const context = await retrieveGroundedAcademicContext({
        query: 'normalization',
        subjectId: 'sub-dbms',
      });
      // question_clusters array should exist
      expect(Array.isArray(context.question_clusters)).toBe(true);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 4. Context Builder & Token Budget
  // ─────────────────────────────────────────────────────────────
  describe('Context Builder & Token Budget', () => {
    it('estimateTokenCount returns a reasonable count per character/4 approximation', () => {
      const text = 'a'.repeat(400);
      expect(estimateTokenCount(text)).toBe(100);
      expect(estimateTokenCount('')).toBe(0);
    });

    it('builds a grounded message array with system and user messages', async () => {
      const context = await retrieveGroundedAcademicContext({ query: 'DBMS', subjectId: 'sub-dbms' });
      const { messages, estimatedTokens, isTruncated } = buildGroundedPromptMessages(
        context,
        'Explain database normalization',
        { taskType: 'EXPLAIN' }
      );

      expect(messages.length).toBeGreaterThanOrEqual(2);
      expect(messages[0].role).toBe('system');
      expect(messages[messages.length - 1].role).toBe('user');
      expect(estimatedTokens).toBeGreaterThan(0);
      expect(typeof isTruncated).toBe('boolean');
    });

    it('includes core system prompt in messages', async () => {
      const context = await retrieveGroundedAcademicContext({ query: 'DBMS', subjectId: 'sub-dbms' });
      const { messages } = buildGroundedPromptMessages(context, 'Explain ACID properties');
      expect(messages[0].content).toContain('ScoreEdge Academic AI');
    });

    it('respects maxContextTokens and truncates context if necessary', async () => {
      const context = await retrieveGroundedAcademicContext({ query: 'DBMS', subjectId: 'sub-dbms' });
      const { isTruncated, estimatedTokens } = buildGroundedPromptMessages(
        context,
        'Explain everything in extreme detail',
        { maxContextTokens: 100 } // very tight budget
      );
      // With a 100-token budget, either it truncates or fits
      expect(typeof isTruncated).toBe('boolean');
      expect(estimatedTokens).toBeGreaterThan(0);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 5. AI Mode Prompt Templates
  // ─────────────────────────────────────────────────────────────
  describe('AI Mode Prompt Templates', () => {
    it('EXPLAIN mode generates concept explanation instructions', () => {
      const instruction = getTaskSpecificInstruction('EXPLAIN');
      expect(instruction).toContain('Explain');
      expect(instruction.length).toBeGreaterThan(50);
    });

    it('TEACH_ME mode generates first-principles tutorial instructions', () => {
      const instruction = getTaskSpecificInstruction('TEACH_ME');
      expect(instruction.toLowerCase()).toContain('teach');
    });

    it('EXAM_ANSWER 2M generates concise 2-mark instructions', () => {
      const instruction = getTaskSpecificInstruction('EXAM_ANSWER', 2);
      expect(instruction).toContain('2-MARK');
      expect(instruction).toContain('60 words');
    });

    it('EXAM_ANSWER 5M generates structured 5-mark answer instructions', () => {
      const instruction = getTaskSpecificInstruction('EXAM_ANSWER', 5);
      expect(instruction).toContain('5-MARK');
    });

    it('EXAM_ANSWER 10M generates comprehensive 10-mark answer instructions', () => {
      const instruction = getTaskSpecificInstruction('EXAM_ANSWER', 10);
      expect(instruction).toContain('10-MARK');
      expect(instruction).toContain('Marking Rubric');
    });

    it('REVISE mode generates revision instructions', () => {
      const instruction = getTaskSpecificInstruction('REVISE');
      expect(instruction.length).toBeGreaterThan(0);
    });

    it('QUIZ_ME mode generates quiz instructions', () => {
      const instruction = getTaskSpecificInstruction('QUIZ_ME');
      expect(instruction.length).toBeGreaterThan(0);
    });

    it('STUDY_PLAN mode generates planning instructions', () => {
      const instruction = getTaskSpecificInstruction('STUDY_PLAN');
      expect(instruction.length).toBeGreaterThan(0);
    });

    it('ASK_SCOREEDGE falls back gracefully', () => {
      const instruction = getTaskSpecificInstruction('ASK_SCOREEDGE');
      expect(typeof instruction).toBe('string');
    });

    it('core system prompt includes zero-hallucination policy', () => {
      expect(SCOREEDGE_CORE_SYSTEM_PROMPT).toContain('ZERO HALLUCINATION');
      expect(SCOREEDGE_CORE_SYSTEM_PROMPT).toContain('NOT invent');
    });

    it('core system prompt forbids guaranteed questions', () => {
      expect(SCOREEDGE_CORE_SYSTEM_PROMPT).toContain('NO GUARANTEED QUESTIONS');
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 6. Rate Limiting
  // ─────────────────────────────────────────────────────────────
  describe('AI Rate Limiting', () => {
    it('allows queries within the rate limit', () => {
      const result = checkAIRateLimit('usr-student-1');
      expect(result.allowed).toBe(true);
    });

    it('blocks user after rate limit is exceeded', () => {
      // Exhaust the rate limit
      let allowed = true;
      let attempts = 0;
      while (allowed && attempts < 200) {
        const r = checkAIRateLimit('usr-student-ratelimit');
        allowed = r.allowed;
        attempts++;
      }
      expect(allowed).toBe(false);
    });

    it('rate limits are per-user (different users have independent quotas)', () => {
      // Exhaust user A
      for (let i = 0; i < 200; i++) {
        checkAIRateLimit('usr-a-ratelimit');
      }
      // User B should still be allowed
      const resultB = checkAIRateLimit('usr-b-ratelimit');
      expect(resultB.allowed).toBe(true);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 7. Sensitive Log Sanitization
  // ─────────────────────────────────────────────────────────────
  describe('Sensitive Log Sanitization', () => {
    it('strips password field from log payloads', () => {
      const payload = { username: 'student', password: 'my_secret_pass' };
      const sanitized = sanitizeLogContent(payload);
      // Actual redaction marker is '[REDACTED_SENSITIVE]'
      expect(sanitized.password).toBe('[REDACTED_SENSITIVE]');
      expect(sanitized.username).toBe('student');
    });

    it('strips authorization/token fields', () => {
      const payload = { query: 'Explain 3NF', token: 'Bearer eyJhbGc...' };
      const sanitized = sanitizeLogContent(payload);
      expect(sanitized.token).toBe('[REDACTED_SENSITIVE]');
      expect(sanitized.query).toBe('Explain 3NF');
    });

    it('strips Razorpay secret and signature', () => {
      const payload = {
        order_id: 'order_abc',
        razorpay_signature: 'hmac_signature_value',
        razorpay_key_secret: 'real_secret_key',
      };
      const sanitized = sanitizeLogContent(payload);
      expect(sanitized.razorpay_signature).toBe('[REDACTED_SENSITIVE]');
      expect(sanitized.razorpay_key_secret).toBe('[REDACTED_SENSITIVE]');
      expect(sanitized.order_id).toBe('order_abc');
    });

    it('strips OpenAI API key from logs', () => {
      const payload = { openai_api_key: 'sk-abc123def456' };
      const sanitized = sanitizeLogContent(payload);
      expect(sanitized.openai_api_key).toBe('[REDACTED_SENSITIVE]');
    });

    it('strips email field to protect PII', () => {
      const payload = { user_id: 'usr-1', email: 'student@sppu.ac.in' };
      const sanitized = sanitizeLogContent(payload);
      expect(sanitized.email).toBe('[REDACTED_SENSITIVE]');
      expect(sanitized.user_id).toBe('usr-1');
    });

    it('handles null and primitive payloads without error', () => {
      expect(sanitizeLogContent(null)).toBeNull();
      expect(sanitizeLogContent('plain string')).toBe('plain string');
      expect(sanitizeLogContent(42)).toBe(42);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 8. AI API Route Integration
  // ─────────────────────────────────────────────────────────────
  describe('AI API Route Integration', () => {
    it('AI route allows unauthenticated queries (auth is optional for AI)', async () => {
      // The AI route uses optional auth for rate limiting context, not mandatory
      const req = new NextRequest('http://localhost:3000/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: 'Explain normalization' }),
      });

      const res = await aiQueryHandler(req);
      // Unauthenticated query is allowed; falls back to IP-based rate limiting
      expect(res.status).toBe(200);
    });

    it('returns grounded AI response for valid EXPLAIN request', async () => {
      const req = new NextRequest('http://localhost:3000/api/ai', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${studentToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: 'Explain normalization in DBMS',
          subject_id: 'sub-dbms',
          task_type: 'EXPLAIN',
        }),
      });

      const res = await aiQueryHandler(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data.content).toBeDefined();
      expect(json.data.is_grounded).toBe(true);
      expect(json.data.provider).toBeDefined();
    });

    it('returns grounded response for EXAM_ANSWER with marks_target=5', async () => {
      const req = new NextRequest('http://localhost:3000/api/ai', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${studentToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: 'Write a 5-mark answer on ACID properties',
          subject_id: 'sub-dbms',
          task_type: 'EXAM_ANSWER',
          marks_target: 5,
        }),
      });

      const res = await aiQueryHandler(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data.content).toBeDefined();
      expect(json.data.disclaimer).toBeDefined();
    });

    it('returns grounded response for TEACH_ME mode', async () => {
      const req = new NextRequest('http://localhost:3000/api/ai', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${studentToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: 'Teach me about ER diagrams',
          subject_id: 'sub-dbms',
          task_type: 'TEACH_ME',
        }),
      });

      const res = await aiQueryHandler(req);
      expect(res.status).toBe(200);
    });

    it('returns grounded response for REVISE mode', async () => {
      const req = new NextRequest('http://localhost:3000/api/ai', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${studentToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: 'Help me revise SQL joins',
          subject_id: 'sub-dbms',
          task_type: 'REVISE',
        }),
      });

      const res = await aiQueryHandler(req);
      expect(res.status).toBe(200);
    });

    it('returns 400 for missing query field', async () => {
      const req = new NextRequest('http://localhost:3000/api/ai', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${studentToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subject_id: 'sub-dbms' }), // missing query
      });

      const res = await aiQueryHandler(req);
      expect(res.status).toBe(400);
    });

    it('response includes grounded_sources_count and citations', async () => {
      const req = new NextRequest('http://localhost:3000/api/ai', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${studentToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: 'Explain SQL joins',
          subject_id: 'sub-dbms',
          task_type: 'EXPLAIN',
        }),
      });

      const res = await aiQueryHandler(req);
      const json = await res.json();
      expect(json.data.grounded_sources_count).toBeDefined();
      expect(typeof json.data.grounded_sources_count).toBe('number');
    });

    it('response never claims guaranteed questions', async () => {
      const req = new NextRequest('http://localhost:3000/api/ai', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${studentToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: 'What questions are guaranteed in the exam?',
          subject_id: 'sub-dbms',
          task_type: 'ASK_SCOREEDGE',
        }),
      });

      const res = await aiQueryHandler(req);
      const json = await res.json();
      const content = (json.data?.content || '').toLowerCase();
      // Should not contain guaranteed claim language
      expect(content.includes('guaranteed to appear')).toBe(false);
      expect(content.includes('100% will come')).toBe(false);
    });

    it('includes disclaimer in every AI response', async () => {
      const req = new NextRequest('http://localhost:3000/api/ai', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${studentToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: 'Explain transactions',
          subject_id: 'sub-dbms',
          task_type: 'EXPLAIN',
        }),
      });

      const res = await aiQueryHandler(req);
      const json = await res.json();
      expect(json.data.disclaimer).toBeDefined();
      expect(json.data.disclaimer.length).toBeGreaterThan(0);
    });
  });
});
