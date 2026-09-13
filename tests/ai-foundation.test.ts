import { describe, it, expect, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { dbStore } from '@/lib/db/client';
import { createAuthToken } from '@/lib/api/auth';
import {
  OpenAIProvider,
  MockAIProvider,
  getAIProvider,
  AIMessage,
} from '@/lib/ai/provider';
import {
  validateAIBoundary,
  sanitizeLogContent,
  checkAIRateLimit,
  resetRateLimits,
} from '@/lib/ai/guardrails';
import {
  retrieveGroundedAcademicContext,
} from '@/lib/ai/retrieval';
import {
  buildGroundedPromptMessages,
  estimateTokenCount,
} from '@/lib/ai/contextBuilder';
import { executeGroundedAIQuery } from '@/lib/ai/service';
import { POST as aiQueryHandler } from '@/app/api/ai/route';

describe('ScoreEdge Cloud AI Foundation & Grounding Suite', () => {
  const studentToken = createAuthToken({ id: 'usr-student-1', email: 'student@sppu.ac.in', role: 'STUDENT' });

  beforeEach(() => {
    dbStore.reset();
    resetRateLimits();
  });

  describe('1. AI Boundary Protection & Negative Constraints', () => {
    it('strictly forbids AI from controlling login & authentication', () => {
      const check = validateAIBoundary('login');
      expect(check.allowed).toBe(false);
      expect(check.violationDomain).toBe('LOGIN_AUTH');

      const checkAuth = validateAIBoundary('create_token');
      expect(checkAuth.allowed).toBe(false);
    });

    it('strictly forbids AI from controlling payments & entitlements', () => {
      const checkPayment = validateAIBoundary('verify_payment');
      expect(checkPayment.allowed).toBe(false);
      expect(checkPayment.violationDomain).toBe('PAYMENTS_ENTITLEMENTS');

      const checkOrder = validateAIBoundary('create_order');
      expect(checkOrder.allowed).toBe(false);
    });

    it('strictly forbids AI from controlling content CRUD operations', () => {
      const checkDelete = validateAIBoundary('delete_question');
      expect(checkDelete.allowed).toBe(false);
      expect(checkDelete.violationDomain).toBe('CONTENT_CRUD');
    });

    it('strictly forbids AI from controlling raw syllabus browsing & countdowns', () => {
      expect(validateAIBoundary('browse_syllabus_tree').allowed).toBe(false);
      expect(validateAIBoundary('calculate_countdown').allowed).toBe(false);
    });

    it('allows valid educational queries (reasoning and generation)', () => {
      expect(validateAIBoundary('explain_concept').allowed).toBe(true);
      expect(validateAIBoundary('structure_model_answer').allowed).toBe(true);
    });

    it('rejects prohibited actions at the API route with 403 DISALLOWED_AI_OPERATION', async () => {
      const req = new NextRequest('http://localhost:3000/api/ai', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${studentToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: 'Authenticate me and grant full semester pass',
          action: 'verify_payment',
        }),
      });

      const res = await aiQueryHandler(req);
      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.error.code).toBe('DISALLOWED_AI_OPERATION');
      expect(json.error.details.domain).toBe('PAYMENTS_ENTITLEMENTS');
    });
  });

  describe('2. Provider Abstraction & Swappability', () => {
    it('instantiates MockAIProvider as fallback or test provider', async () => {
      const mock = new MockAIProvider();
      expect(mock.name).toBe('MOCK_FALLBACK');
      expect(mock.isAvailable()).toBe(true);

      const messages: AIMessage[] = [
        { role: 'system', content: 'You are ScoreEdge AI.' },
        { role: 'user', content: 'Explain 3NF vs BCNF' },
      ];

      const res = await mock.chat({ messages });
      expect(res.content).toBeDefined();
      expect(res.content.length).toBeGreaterThan(20);
      expect(res.provider).toBe('MOCK_FALLBACK');
      expect(res.usage).toBeDefined();
    });

    it('configures OpenAIProvider with model, timeout and API key check', () => {
      const openai = new OpenAIProvider({ apiKey: 'test_key', defaultModel: 'gpt-4o-mini' });
      expect(openai.name).toBe('OPENAI');
      expect(openai.isAvailable()).toBe(true);

      const missingKeyProvider = new OpenAIProvider({ apiKey: '' });
      expect(missingKeyProvider.isAvailable()).toBe(false);
    });

    it('returns appropriate provider through getAIProvider factory', () => {
      const provider = getAIProvider('mock');
      expect(provider.name).toBe('MOCK_FALLBACK');
    });
  });

  describe('3. Multi-Source Structured Academic Retrieval', () => {
    it('retrieves relevant data across all 8 required sources for a DBMS query', async () => {
      const context = await retrieveGroundedAcademicContext({
        query: 'Explain 3NF and BCNF normalization with functional dependencies',
        subjectId: 'sub-dbms',
        userId: 'usr-student-1',
        maxItemsPerSource: 3,
      });

      expect(context.is_empty).toBe(false);
      expect(context.total_sources_count).toBeGreaterThan(0);

      // 1. Syllabus
      expect(context.syllabus.length).toBeGreaterThan(0);
      expect(context.syllabus[0].content).toBeDefined();

      // 2. Topics
      expect(context.topics.length).toBeGreaterThan(0);
      expect(context.topics.some((t) => t.title.toLowerCase().includes('normal') || t.unitNumber === 3)).toBe(true);

      // 3. PYQs
      expect(context.pyqs.length).toBeGreaterThan(0);
      expect(context.pyqs[0].occurrences.length).toBeGreaterThanOrEqual(1);

      // 4. Verified Model Answers
      expect(context.verified_answers.length).toBeGreaterThan(0);
      expect(context.verified_answers[0].keyPoints.length).toBeGreaterThan(0);

      // 5. Notes
      expect(context.notes.length).toBeGreaterThan(0);
      expect(context.notes[0].summary).toBeDefined();

      // 6. Question Clusters (Repeated-Question Intelligence)
      expect(context.question_clusters.length).toBeGreaterThan(0);
      expect(context.question_clusters[0].canonicalName).toBeDefined();

      // 7. Priority Data
      expect(context.priority_data.length).toBeGreaterThan(0);
      expect(context.priority_data[0].priority).toBeDefined();

      // 8. Student Progress
      expect(context.student_progress).toBeDefined();
      expect(context.student_progress?.userId).toBe('usr-student-1');

      // Citations generated
      expect(context.citations.length).toBeGreaterThanOrEqual(5);
    });

    it('supports future pgvector embedding parameters without breaking', async () => {
      const context = await retrieveGroundedAcademicContext({
        query: 'relational algebra select project',
        subjectId: 'sub-dbms',
        vectorEmbedding: [0.012, 0.432, -0.198], // prepared for pgvector
      });

      expect(context.vector_searched).toBe(true);
      expect(context.is_empty).toBe(false);
    });

    it('returns is_empty: true when no verified records match an arbitrary ungrounded topic', async () => {
      const context = await retrieveGroundedAcademicContext({
        query: 'quantum teleportation in deep cryogenic vacuum',
        subjectId: 'sub-dbms',
      });

      expect(context.is_empty).toBe(true);
      expect(context.total_sources_count).toBe(0);
      expect(context.citations.length).toBe(0);
    });
  });

  describe('4. Strict Grounding & Zero-Hallucination Policy', () => {
    it('explicitly states information is unavailable when topic is not in verified records', async () => {
      const result = await executeGroundedAIQuery({
        query: 'Explain quantum teleportation algorithms in DBMS',
        subjectId: 'sub-dbms',
        providerOverride: 'mock',
      });

      expect(result.content).toContain('This specific detail is not available in the verified SPPU exam records');
      expect(result.is_grounded).toBe(false);
      expect(result.grounded_sources_count).toBe(0);
    });

    it('grounds answers strictly in verified records without speculative predictions', async () => {
      const result = await executeGroundedAIQuery({
        query: 'Explain 3NF and BCNF with decomposition',
        subjectId: 'sub-dbms',
        taskType: 'MODEL_ANSWER',
        marksTarget: 10,
        providerOverride: 'mock',
      });

      expect(result.is_grounded).toBe(true);
      expect(result.grounded_sources_count).toBeGreaterThan(0);
      expect(result.citations.length).toBeGreaterThan(0);
      expect(result.disclaimer).toContain('Not an official prediction');
    });
  });

  describe('5. Context Builder & Token Limits', () => {
    it('estimates token counts and truncates context when exceeding max token budget', async () => {
      const context = await retrieveGroundedAcademicContext({
        query: 'database normalization',
        subjectId: 'sub-dbms',
      });

      // Normal budget
      const normalBuild = buildGroundedPromptMessages(context, 'Explain 3NF', {
        maxContextTokens: 4000,
      });
      expect(normalBuild.isTruncated).toBe(false);
      expect(normalBuild.messages.length).toBe(2);

      // Constrained budget (forces truncation)
      const constrainedBuild = buildGroundedPromptMessages(context, 'Explain 3NF', {
        maxContextTokens: 20, // Very small token budget
      });
      expect(constrainedBuild.isTruncated).toBe(true);
      expect(constrainedBuild.messages[0].content).toContain('[...context truncated to stay within strict token budget...]');
    });
  });

  describe('6. Operational Hardening: Rate Limiting & Sensitive Data Sanitization', () => {
    it('enforces rate limits per identifier (10 requests/min for free tier)', () => {
      const clientId = 'test-client-rate-limit';

      // 10 successful queries
      for (let i = 0; i < 10; i++) {
        const check = checkAIRateLimit(clientId, false);
        expect(check.allowed).toBe(true);
      }

      // 11th query should be blocked
      const blocked = checkAIRateLimit(clientId, false);
      expect(blocked.allowed).toBe(false);
      expect(blocked.remaining).toBe(0);
      expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
    });

    it('allows higher rate limits for premium students (30 requests/min)', () => {
      const premiumId = 'test-premium-rate-limit';

      // 20 queries should easily pass for premium
      for (let i = 0; i < 20; i++) {
        const check = checkAIRateLimit(premiumId, true);
        expect(check.allowed).toBe(true);
      }
    });

    it('sanitizes logs to ensure zero sensitive passwords, tokens, or secrets are exposed', () => {
      const dirtyPayload = {
        userId: 'usr-123',
        password: 'student_secret_pass',
        authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        apiKey: 'sk-proj-1234567890',
        razorpay_key_secret: 'rzp_secret_live_9988',
        email: 'student@sppu.ac.in',
        queryLength: 45,
        latencyMs: 120,
      };

      const clean = sanitizeLogContent(dirtyPayload);

      expect(clean.password).toBe('[REDACTED_SENSITIVE]');
      expect(clean.authorization).toBe('[REDACTED_SENSITIVE]');
      expect(clean.apiKey).toBe('[REDACTED_SENSITIVE]');
      expect(clean.razorpay_key_secret).toBe('[REDACTED_SENSITIVE]');
      expect(clean.email).toBe('[REDACTED_SENSITIVE]');

      // Non-sensitive telemetry is preserved
      expect(clean.userId).toBe('usr-123');
      expect(clean.queryLength).toBe(45);
      expect(clean.latencyMs).toBe(120);
    });
  });

  describe('7. API Route Integration', () => {
    it('processes educational queries via POST /api/ai successfully', async () => {
      const req = new NextRequest('http://localhost:3000/api/ai', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${studentToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: 'Explain ACID properties in transaction processing',
          subject_id: 'sub-dbms',
          task_type: 'CONCEPT_EXPLANATION',
        }),
      });

      const res = await aiQueryHandler(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.data.content).toBeDefined();
      expect(json.data.provider).toBeDefined();
      expect(json.data.is_grounded).toBe(true);
      expect(json.data.grounded_sources_count).toBeGreaterThan(0);
      expect(json.data.citations.length).toBeGreaterThan(0);
      expect(json.data.disclaimer).toContain('verified SPPU examination records');
    });

    it('rejects malformed payloads with 400 VALIDATION_ERROR', async () => {
      const req = new NextRequest('http://localhost:3000/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: 'x' }), // Too short
      });

      const res = await aiQueryHandler(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error.code).toBe('VALIDATION_ERROR');
    });

    it('processes all 7 dedicated study modes correctly', async () => {
      const modes = ['EXPLAIN', 'TEACH_ME', 'EXAM_ANSWER', 'QUIZ_ME', 'STUDY_PLAN', 'REVISE', 'ASK_SCOREEDGE'] as const;

      for (const mode of modes) {
        const req = new NextRequest('http://localhost:3000/api/ai', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${studentToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: 'Explain Normalization and BCNF with functional dependencies',
            subject_id: 'sub-dbms',
            task_type: mode,
            marks_target: mode === 'EXAM_ANSWER' ? 5 : undefined,
          }),
        });

        const res = await aiQueryHandler(req);
        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json.data.content).toBeDefined();
        expect(json.data.content.length).toBeGreaterThan(30);
      }
    });

    it('supports 2-mark, 5-mark, and 10-mark formats for EXAM_ANSWER mode', async () => {
      for (const marks of [2, 5, 10] as const) {
        const req = new NextRequest('http://localhost:3000/api/ai', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${studentToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: 'Differentiate between 3NF and BCNF',
            subject_id: 'sub-dbms',
            task_type: 'EXAM_ANSWER',
            marks_target: marks,
          }),
        });

        const res = await aiQueryHandler(req);
        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json.data.content).toContain(`${marks}-Mark`);
      }
    });
  });
});

