import { describe, it, expect, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { dbStore } from '../src/lib/db/client';
import { createAuthToken } from '../src/lib/api/auth';
import { POST as registerHandler } from '../src/app/api/auth/register/route';
import { POST as loginHandler } from '../src/app/api/auth/login/route';
import { GET as getSubjectsHandler } from '../src/app/api/subjects/route';
import { GET as getSubjectDetailHandler } from '../src/app/api/subjects/[id]/route';
import { GET as getPYQsHandler } from '../src/app/api/pyqs/route';
import { GET as getClustersHandler } from '../src/app/api/pyqs/clusters/route';
import { POST as submitQuizHandler } from '../src/app/api/quizzes/[id]/route';
import { POST as toggleProgressHandler } from '../src/app/api/progress/route';
import { GET as getAdminStatsHandler } from '../src/app/api/admin/route';
import { POST as aiQueryHandler } from '../src/app/api/ai/route';

describe('API Routes Integration', () => {
  beforeEach(() => {
    dbStore.reset();
  });

  describe('Authentication API', () => {
    it('registers a new student successfully', async () => {
      const req = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: 'newstudent@sppu.ac.in',
          password: 'Password@123',
          full_name: 'Rahul Sharma',
          role: 'STUDENT',
        }),
      });

      const res = await registerHandler(req);
      expect(res.status).toBe(201);

      const json = await res.json();
      expect(json.data.user.email).toBe('newstudent@sppu.ac.in');
      expect(json.data.token).toBeDefined();
    });

    it('rejects duplicate email registrations with 409', async () => {
      const req = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: 'student@sppu.ac.in', // already exists in seed
          password: 'Password@123',
          full_name: 'Duplicate Student',
        }),
      });

      const res = await registerHandler(req);
      expect(res.status).toBe(409);
      const json = await res.json();
      expect(json.error.code).toBe('USER_EXISTS');
    });

    it('authenticates user and returns JWT token', async () => {
      const req = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'student@sppu.ac.in',
          password: 'Student@1234',
        }),
      });

      const res = await loginHandler(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data.user.email).toBe('student@sppu.ac.in');
      expect(json.data.token).toBeDefined();
    });
  });

  describe('Academic & Subject APIs', () => {
    it('returns subjects with pagination metadata', async () => {
      const req = new NextRequest('http://localhost:3000/api/subjects?branch_id=branch-comp&page=1&limit=2');
      const res = await getSubjectsHandler(req);

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data.length).toBe(2);
      expect(json.meta.total).toBe(10);
      expect(json.meta.totalPages).toBe(5);
    });

    it('returns detailed subject hub with units and stats', async () => {
      const req = new NextRequest('http://localhost:3000/api/subjects/sub-dbms');
      const res = await getSubjectDetailHandler(req, { params: { id: 'sub-dbms' } });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data.subject.short_name).toBe('DBMS');
      expect(json.data.units.length).toBe(6);
      expect(json.data.stats.total_pyqs).toBeGreaterThan(0);
    });
  });

  describe('PYQ & Question APIs', () => {
    it('retrieves PYQ questions and occurrences', async () => {
      const req = new NextRequest('http://localhost:3000/api/pyqs?subject_id=sub-dbms');
      const res = await getPYQsHandler(req);

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data.length).toBeGreaterThan(0);
      expect(json.data[0].occurrences).toBeDefined();
    });

    it('retrieves question clusters with frequency and variations', async () => {
      const req = new NextRequest('http://localhost:3000/api/pyqs/clusters?subject_id=sub-dbms');
      const res = await getClustersHandler(req);

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data.length).toBeGreaterThan(0);
      expect(json.data[0].canonical_name).toContain('Normalization');
      expect(json.data[0].variations).toBeDefined();
    });
  });

  describe('Quiz & Progress APIs', () => {
    it('evaluates quiz attempts and records score', async () => {
      const req = new NextRequest('http://localhost:3000/api/quizzes/quiz-dbms-norm', {
        method: 'POST',
        body: JSON.stringify({
          quiz_id: 'quiz-dbms-norm',
          answers: { 'qq-1': 2, 'qq-2': 0 }, // Both correct
          time_taken_seconds: 45,
        }),
      });

      const res = await submitQuizHandler(req, { params: { id: 'quiz-dbms-norm' } });
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data.score).toBe(2);
      expect(json.data.percentage).toBe(100);
      expect(json.data.passed).toBe(true);
    });

    it('toggles student progress accurately', async () => {
      const req = new NextRequest('http://localhost:3000/api/progress', {
        method: 'POST',
        body: JSON.stringify({
          subject_id: 'sub-dbms',
          unit_id: 'unit-dbms-4',
          topic_id: 'topic-trans-acid',
          item_type: 'TOPIC',
          item_id: 'topic-trans-acid',
          is_completed: true,
        }),
      });

      const res = await toggleProgressHandler(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data.is_completed).toBe(true);
    });
  });

  describe('Admin Security & AI Grounding', () => {
    it('blocks unauthenticated access to admin stats with 403', async () => {
      const req = new NextRequest('http://localhost:3000/api/admin');
      const res = await getAdminStatsHandler(req);

      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.error.code).toBe('FORBIDDEN');
    });

    it('allows admin with valid token to retrieve admin metrics', async () => {
      const adminToken = createAuthToken({ id: 'usr-admin-1', email: 'admin@scoreedge.in', role: 'ADMIN' });
      const req = new NextRequest('http://localhost:3000/api/admin', {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });

      const res = await getAdminStatsHandler(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data.stats.total_subjects).toBe(dbStore.subjects.filter((s) => s.is_active && !s.deleted_at).length);
      expect(json.data.stats.total_users).toBe(dbStore.users.length);
    });

    it('validates AI queries against grounded database content', async () => {
      const req = new NextRequest('http://localhost:3000/api/ai', {
        method: 'POST',
        body: JSON.stringify({
          query: 'normalization',
          subject_id: 'sub-dbms',
        }),
      });

      const res = await aiQueryHandler(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data.grounding.is_grounded).toBe(true);
      expect(json.data.grounding.matched_verified_sources).toBeGreaterThan(0);
    });
  });
});
