/**
 * ScoreEdge Quiz System Tests
 *
 * Covers:
 * - Quiz listing (public/admin visibility)
 * - Premium quiz access enforcement
 * - Quiz submission and scoring
 * - Correct answer evaluation
 * - Progress update on quiz completion
 * - Admin CRUD operations on quizzes
 * - Unauthorized student access to admin endpoints
 * - Failure cases: missing body, wrong ID, invalid submission
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { dbStore } from '../src/lib/db/client';
import { createAuthToken } from '../src/lib/api/auth';
import {
  GET as getQuizzesHandler,
  POST as createQuizHandler,
  PUT as updateQuizHandler,
  DELETE as deleteQuizHandler,
} from '../src/app/api/quizzes/route';
import {
  GET as getQuizDetailHandler,
  POST as submitQuizHandler,
} from '../src/app/api/quizzes/[id]/route';

/** Helper: ensure quiz has questions in dbStore for submission tests */
function ensureQuizHasQuestions(quizId: string): void {
  const hasQuestions = dbStore.quizQuestions.some(qq => qq.quiz_id === quizId);
  if (!hasQuestions) {
    dbStore.quizQuestions.push(
      {
        id: `qq-test-${quizId}-1`,
        quiz_id: quizId,
        question_text: 'What does DBMS stand for?',
        options: ['Database Management System', 'Data Binding Module System', 'Dynamic Base Module Set', 'Direct Base Management System'],
        correct_option_index: 0,
        explanation: 'DBMS = Database Management System',
        marks: 1,
        order_index: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: `qq-test-${quizId}-2`,
        quiz_id: quizId,
        question_text: 'Which of the following is a DDL command?',
        options: ['SELECT', 'INSERT', 'CREATE', 'UPDATE'],
        correct_option_index: 2,
        explanation: 'CREATE is a DDL (Data Definition Language) command',
        marks: 1,
        order_index: 2,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    );
  }
}

describe('ScoreEdge Quiz System', () => {
  const studentToken = createAuthToken({ id: 'usr-student-1', email: 'student@sppu.ac.in', role: 'STUDENT' });
  const adminToken = createAuthToken({ id: 'usr-admin-1', email: 'admin@scoreedge.in', role: 'ADMIN' });

  beforeEach(() => {
    dbStore.reset();
  });

  // ─────────────────────────────────────────────────────────────
  // 1. Quiz Listing
  // ─────────────────────────────────────────────────────────────
  describe('Quiz Listing & Filtering', () => {
    it('returns published quizzes to unauthenticated visitors', async () => {
      const req = new NextRequest('http://localhost:3000/api/quizzes');
      const res = await getQuizzesHandler(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data.length).toBeGreaterThan(0);
      expect(json.data.every((q: any) => q.content_status === 'PUBLISHED')).toBe(true);
    });

    it('filters quizzes by subject_id', async () => {
      const req = new NextRequest('http://localhost:3000/api/quizzes?subject_id=sub-dbms');
      const res = await getQuizzesHandler(req);
      const json = await res.json();
      expect(json.data.every((q: any) => q.subject_id === 'sub-dbms')).toBe(true);
    });

    it('filters quizzes by unit_id', async () => {
      const firstQuiz = dbStore.quizzes.find(q => q.unit_id);
      if (firstQuiz && firstQuiz.unit_id) {
        const req = new NextRequest(`http://localhost:3000/api/quizzes?unit_id=${firstQuiz.unit_id}`);
        const res = await getQuizzesHandler(req);
        const json = await res.json();
        expect(json.data.every((q: any) => q.unit_id === firstQuiz.unit_id)).toBe(true);
      }
    });

    it('admin sees draft quizzes using status filter', async () => {
      dbStore.quizzes.push({
        id: 'quiz-draft-test',
        subject_id: 'sub-dbms',
        unit_id: null,
        title: 'Draft Quiz',
        description: 'Unpublished quiz',
        duration_minutes: 30,
        total_questions: 5,
        passing_score: 60,
        difficulty: 'BASIC',
        is_premium: false,
        content_status: 'DRAFT',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      const req = new NextRequest('http://localhost:3000/api/quizzes?status=DRAFT', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const res = await getQuizzesHandler(req);
      const json = await res.json();
      expect(json.data.some((q: any) => q.content_status === 'DRAFT')).toBe(true);
    });

    it('returns meta pagination data', async () => {
      const req = new NextRequest('http://localhost:3000/api/quizzes?page=1&limit=2');
      const res = await getQuizzesHandler(req);
      const json = await res.json();
      // Pagination data is in json.meta (apiSuccess passes it as meta)
      expect(json.meta).toBeDefined();
      expect(json.meta.page).toBe(1);
      expect(json.meta.limit).toBe(2);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 2. Quiz Detail & Premium Access
  // ─────────────────────────────────────────────────────────────
  describe('Quiz Detail & Premium Access Enforcement', () => {
    it('retrieves quiz detail with questions for free quiz', async () => {
      const freeQuiz = dbStore.quizzes.find(q => !q.is_premium && q.content_status === 'PUBLISHED');
      expect(freeQuiz).toBeDefined();
      if (!freeQuiz) return;

      const req = new NextRequest(`http://localhost:3000/api/quizzes/${freeQuiz.id}`);
      const res = await getQuizDetailHandler(req, { params: { id: freeQuiz.id } });
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data.quiz.id).toBe(freeQuiz.id);
      expect(Array.isArray(json.data.questions)).toBe(true);
    });

    it('blocks unauthenticated user from premium quiz', async () => {
      const premiumQuiz = dbStore.quizzes.find(q => q.is_premium && q.content_status === 'PUBLISHED');
      if (!premiumQuiz) return;

      const req = new NextRequest(`http://localhost:3000/api/quizzes/${premiumQuiz.id}`);
      const res = await getQuizDetailHandler(req, { params: { id: premiumQuiz.id } });
      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.error.code).toBe('UPGRADE_REQUIRED');
    });

    it('allows entitled student to access premium quiz', async () => {
      const premiumQuiz = dbStore.quizzes.find(q => q.is_premium && q.content_status === 'PUBLISHED');
      if (!premiumQuiz) return;

      dbStore.entitlements.push({
        id: 'ent-quiz-test',
        user_id: 'usr-student-1',
        product_id: 'prod-sub-dbms',
        subject_id: premiumQuiz.subject_id,
        access_scope: 'SINGLE_SUBJECT',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      const req = new NextRequest(`http://localhost:3000/api/quizzes/${premiumQuiz.id}`, {
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      const res = await getQuizDetailHandler(req, { params: { id: premiumQuiz.id } });
      expect(res.status).toBe(200);
    });

    it('allows admin to access premium quiz without entitlement', async () => {
      const premiumQuiz = dbStore.quizzes.find(q => q.is_premium && q.content_status === 'PUBLISHED');
      if (!premiumQuiz) return;

      dbStore.entitlements = [];

      const req = new NextRequest(`http://localhost:3000/api/quizzes/${premiumQuiz.id}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const res = await getQuizDetailHandler(req, { params: { id: premiumQuiz.id } });
      expect(res.status).toBe(200);
    });

    it('returns 404 for a non-existent quiz id', async () => {
      const req = new NextRequest('http://localhost:3000/api/quizzes/quiz-does-not-exist');
      const res = await getQuizDetailHandler(req, { params: { id: 'quiz-does-not-exist' } });
      expect(res.status).toBe(404);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 3. Quiz Submission & Scoring
  // ─────────────────────────────────────────────────────────────
  describe('Quiz Submission & Scoring Engine', () => {
    it('correctly scores a fully correct quiz submission', async () => {
      const quiz = dbStore.quizzes.find(q => q.content_status === 'PUBLISHED');
      expect(quiz).toBeDefined();
      if (!quiz) return;

      ensureQuizHasQuestions(quiz.id);
      const questions = dbStore.quizQuestions.filter(qq => qq.quiz_id === quiz.id);
      expect(questions.length).toBeGreaterThan(0);

      // Build perfect answer set
      const answers: Record<string, number> = {};
      questions.forEach(q => { answers[q.id] = q.correct_option_index; });

      const req = new NextRequest(`http://localhost:3000/api/quizzes/${quiz.id}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${studentToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quiz_id: quiz.id, answers, time_taken_seconds: 300 }),
      });

      const res = await submitQuizHandler(req, { params: { id: quiz.id } });
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data.percentage).toBe(100);
      expect(json.data.passed).toBe(true);
      expect(json.data.results.every((r: any) => r.is_correct)).toBe(true);
    });

    it('scores a zero-correct submission and marks as failed', async () => {
      const quiz = dbStore.quizzes.find(q => q.content_status === 'PUBLISHED');
      if (!quiz) return;

      ensureQuizHasQuestions(quiz.id);
      const questions = dbStore.quizQuestions.filter(qq => qq.quiz_id === quiz.id);
      if (questions.length === 0) return;

      // Submit all wrong answers
      const answers: Record<string, number> = {};
      questions.forEach(q => {
        answers[q.id] = (q.correct_option_index + 1) % (q.options.length || 4);
      });

      const req = new NextRequest(`http://localhost:3000/api/quizzes/${quiz.id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${studentToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ quiz_id: quiz.id, answers, time_taken_seconds: 600 }),
      });

      const res = await submitQuizHandler(req, { params: { id: quiz.id } });
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data.percentage).toBe(0);
      expect(json.data.passed).toBe(false);
    });

    it('saves a quiz attempt record in dbStore after submission', async () => {
      const quiz = dbStore.quizzes.find(q => q.content_status === 'PUBLISHED');
      if (!quiz) return;

      ensureQuizHasQuestions(quiz.id);
      const questions = dbStore.quizQuestions.filter(qq => qq.quiz_id === quiz.id);
      if (questions.length === 0) return;

      const prevCount = dbStore.quizAttempts.length;

      const answers: Record<string, number> = {};
      questions.forEach(q => { answers[q.id] = q.correct_option_index; });

      const req = new NextRequest(`http://localhost:3000/api/quizzes/${quiz.id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${studentToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ quiz_id: quiz.id, answers, time_taken_seconds: 120 }),
      });

      await submitQuizHandler(req, { params: { id: quiz.id } });

      expect(dbStore.quizAttempts.length).toBe(prevCount + 1);
      const lastAttempt = dbStore.quizAttempts[dbStore.quizAttempts.length - 1];
      expect(lastAttempt.quiz_id).toBe(quiz.id);
    });

    it('updates student progress after quiz attempt', async () => {
      const quiz = dbStore.quizzes.find(q => q.content_status === 'PUBLISHED');
      if (!quiz) return;

      ensureQuizHasQuestions(quiz.id);
      const questions = dbStore.quizQuestions.filter(qq => qq.quiz_id === quiz.id);
      if (questions.length === 0) return;

      const answers: Record<string, number> = {};
      questions.forEach(q => { answers[q.id] = q.correct_option_index; });

      const req = new NextRequest(`http://localhost:3000/api/quizzes/${quiz.id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${studentToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ quiz_id: quiz.id, answers, time_taken_seconds: 200 }),
      });
      await submitQuizHandler(req, { params: { id: quiz.id } });

      const progressEntry = dbStore.studentProgress.find(
        p => p.item_type === 'QUIZ' && p.item_id === quiz.id
      );
      expect(progressEntry).toBeDefined();
      expect(progressEntry?.is_completed).toBe(true);
    });

    it('returns 400 for invalid quiz submission body (missing answers and time_taken_seconds)', async () => {
      const quiz = dbStore.quizzes.find(q => q.content_status === 'PUBLISHED');
      if (!quiz) return;

      const req = new NextRequest(`http://localhost:3000/api/quizzes/${quiz.id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${studentToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ invalid: 'no answers or time' }),
      });

      const res = await submitQuizHandler(req, { params: { id: quiz.id } });
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error.code).toBe('VALIDATION_ERROR');
    });

    it('returns each question result with explanation in submission response', async () => {
      const quiz = dbStore.quizzes.find(q => q.content_status === 'PUBLISHED');
      if (!quiz) return;

      ensureQuizHasQuestions(quiz.id);
      const questions = dbStore.quizQuestions.filter(qq => qq.quiz_id === quiz.id);
      if (questions.length === 0) return;

      const answers: Record<string, number> = {};
      questions.forEach(q => { answers[q.id] = q.correct_option_index; });

      const req = new NextRequest(`http://localhost:3000/api/quizzes/${quiz.id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${studentToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ quiz_id: quiz.id, answers, time_taken_seconds: 150 }),
      });

      const res = await submitQuizHandler(req, { params: { id: quiz.id } });
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data.results).toBeDefined();
      expect(json.data.results.length).toBe(questions.length);
      expect(json.data.results[0].explanation).toBeDefined();
      expect(json.data.results[0].correct_answer).toBeDefined();
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 4. Admin Quiz CRUD
  // ─────────────────────────────────────────────────────────────
  describe('Admin Quiz CRUD', () => {
    it('allows admin to create a new quiz', async () => {
      const req = new NextRequest('http://localhost:3000/api/quizzes', {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject_id: 'sub-dbms',
          unit_id: 'unit-dbms-1',
          title: 'Unit 1 Mastery Test',
          description: 'Comprehensive test on Unit 1 DBMS concepts',
          duration_minutes: 20,
          total_questions: 10,
          passing_score: 60,
          difficulty: 'EXAM_STANDARD',
          is_premium: false,
        }),
      });

      const res = await createQuizHandler(req);
      expect(res.status).toBe(201);
      const json = await res.json();
      expect(json.data.title).toBe('Unit 1 Mastery Test');
      expect(json.data.id).toBeDefined();
    });

    it('blocks student from creating a quiz', async () => {
      const req = new NextRequest('http://localhost:3000/api/quizzes', {
        method: 'POST',
        headers: { Authorization: `Bearer ${studentToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject_id: 'sub-dbms',
          title: 'Fake quiz by student',
          description: 'Should be blocked by RBAC',
          duration_minutes: 10,
          total_questions: 5,
          passing_score: 50,
          difficulty: 'BASIC',
          is_premium: false,
        }),
      });

      const res = await createQuizHandler(req);
      expect(res.status).toBe(403);
      expect((await res.json()).error.code).toBe('FORBIDDEN');
    });

    it('allows admin to update a quiz', async () => {
      const quiz = dbStore.quizzes.find(q => q.content_status === 'PUBLISHED');
      if (!quiz) return;

      const req = new NextRequest(`http://localhost:3000/api/quizzes?id=${quiz.id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Updated Quiz Title', id: quiz.id }),
      });

      const res = await updateQuizHandler(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data.title).toBe('Updated Quiz Title');
    });

    it('allows admin to archive (delete) a quiz', async () => {
      const quiz = dbStore.quizzes.find(q => q.content_status === 'PUBLISHED');
      if (!quiz) return;

      const req = new NextRequest(`http://localhost:3000/api/quizzes?id=${quiz.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      const res = await deleteQuizHandler(req);
      expect(res.status).toBe(200);
      const updatedQuiz = dbStore.quizzes.find(q => q.id === quiz.id);
      expect(updatedQuiz?.content_status).toBe('ARCHIVED');
    });

    it('blocks student from deleting a quiz', async () => {
      const quiz = dbStore.quizzes.find(q => q.content_status === 'PUBLISHED');
      if (!quiz) return;

      const req = new NextRequest(`http://localhost:3000/api/quizzes?id=${quiz.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${studentToken}` },
      });

      const res = await deleteQuizHandler(req);
      expect(res.status).toBe(403);
    });

    it('returns 400 when updating quiz without providing ID', async () => {
      const req = new NextRequest('http://localhost:3000/api/quizzes', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'No ID update attempt' }),
      });

      const res = await updateQuizHandler(req);
      expect(res.status).toBe(400);
    });

    it('returns 404 when trying to archive non-existent quiz', async () => {
      const req = new NextRequest('http://localhost:3000/api/quizzes?id=quiz-nonexistent', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      const res = await deleteQuizHandler(req);
      expect(res.status).toBe(404);
    });
  });
});
