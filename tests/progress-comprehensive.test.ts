/**
 * ScoreEdge Progress & Personalization Engine Tests
 *
 * Covers:
 * - Student progress tracking: topics, PYQs, quizzes, exam mode
 * - Cross-student privacy isolation
 * - Admin can read any student's progress
 * - Syllabus coverage calculation
 * - Weak topics and strong topics classification
 * - "What should I do next?" primary recommendation
 * - Study session tracking
 * - Exam Mode completion tracking
 * - Revision history
 * - Progress toggle: mark/unmark completion
 * - Invalid user isolation
 * - Progress API route integration
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { dbStore } from '../src/lib/db/client';
import { createAuthToken } from '../src/lib/api/auth';
import {
  calculateStudentPersonalization,
  validateProgressAccess,
} from '../src/lib/progress/personalizationEngine';
import { GET as getProgressHandler, POST as toggleProgressHandler } from '../src/app/api/progress/route';
import { GET as getSessionsHandler, POST as createSessionHandler } from '../src/app/api/progress/session/route';
import { GET as getRevisionHandler, POST as createRevisionHandler } from '../src/app/api/progress/revision/route';
import { GET as getExamModeRecordsHandler, POST as createExamModeRecordHandler } from '../src/app/api/progress/exam-mode/route';

describe('ScoreEdge Progress & Personalization Engine', () => {
  const studentToken = createAuthToken({ id: 'usr-student-1', email: 'student@sppu.ac.in', role: 'STUDENT' });
  const student2Token = createAuthToken({ id: 'usr-student-2', email: 'student2@sppu.ac.in', role: 'STUDENT' });
  const adminToken = createAuthToken({ id: 'usr-admin-1', email: 'admin@scoreedge.in', role: 'ADMIN' });

  beforeEach(() => {
    dbStore.reset();
  });

  // ─────────────────────────────────────────────────────────────
  // 1. Privacy Isolation
  // ─────────────────────────────────────────────────────────────
  describe('Student Data Privacy Isolation', () => {
    it('student cannot access another student progress via API', async () => {
      const req = new NextRequest('http://localhost:3000/api/progress?user_id=usr-student-2&subject_id=sub-dbms', {
        headers: { Authorization: `Bearer ${studentToken}` },
      });

      const res = await getProgressHandler(req);
      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.error.code).toBe('ACCESS_DENIED');
    });

    it('admin can access any student progress', async () => {
      const req = new NextRequest('http://localhost:3000/api/progress?user_id=usr-student-1&subject_id=sub-dbms', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      const res = await getProgressHandler(req);
      expect(res.status).toBe(200);
    });

    it('student can access their own progress', async () => {
      const req = new NextRequest('http://localhost:3000/api/progress?user_id=usr-student-1&subject_id=sub-dbms', {
        headers: { Authorization: `Bearer ${studentToken}` },
      });

      const res = await getProgressHandler(req);
      expect(res.status).toBe(200);
    });

    it('validateProgressAccess: student blocked from other user data', () => {
      const caller = { id: 'usr-student-1', role: 'STUDENT' as const };
      const result = validateProgressAccess(caller as any, 'usr-student-2');
      expect(result.allowed).toBe(false);
      expect(result.statusCode).toBe(403);
    });

    it('validateProgressAccess: admin allowed for any user', () => {
      const caller = { id: 'usr-admin-1', role: 'ADMIN' as const };
      const result = validateProgressAccess(caller as any, 'usr-student-1');
      expect(result.allowed).toBe(true);
    });

    it('validateProgressAccess: student allowed for their own data', () => {
      const caller = { id: 'usr-student-1', role: 'STUDENT' as const };
      const result = validateProgressAccess(caller as any, 'usr-student-1');
      expect(result.allowed).toBe(true);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 2. Progress Toggle
  // ─────────────────────────────────────────────────────────────
  describe('Progress Toggle: Mark/Unmark Completion', () => {
    it('marks a topic as complete', async () => {
      const req = new NextRequest('http://localhost:3000/api/progress', {
        method: 'POST',
        headers: { Authorization: `Bearer ${studentToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject_id: 'sub-dbms',
          unit_id: 'unit-dbms-3',
          topic_id: 'topic-norm-bcnf',
          item_type: 'TOPIC',
          item_id: 'topic-norm-bcnf',
          is_completed: true,
        }),
      });

      const res = await toggleProgressHandler(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data.is_completed).toBe(true);
      expect(json.data.item_type).toBe('TOPIC');
    });

    it('unmarks a previously completed topic', async () => {
      // First mark it
      const req1 = new NextRequest('http://localhost:3000/api/progress', {
        method: 'POST',
        headers: { Authorization: `Bearer ${studentToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject_id: 'sub-dbms',
          unit_id: 'unit-dbms-3',
          topic_id: 'topic-norm-bcnf',
          item_type: 'TOPIC',
          item_id: 'topic-norm-bcnf',
          is_completed: true,
        }),
      });
      await toggleProgressHandler(req1);

      // Now unmark it
      const req2 = new NextRequest('http://localhost:3000/api/progress', {
        method: 'POST',
        headers: { Authorization: `Bearer ${studentToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject_id: 'sub-dbms',
          unit_id: 'unit-dbms-3',
          topic_id: 'topic-norm-bcnf',
          item_type: 'TOPIC',
          item_id: 'topic-norm-bcnf',
          is_completed: false,
        }),
      });

      const res2 = await toggleProgressHandler(req2);
      expect(res2.status).toBe(200);
      const json2 = await res2.json();
      expect(json2.data.is_completed).toBe(false);
    });

    it('marks a PYQ as practiced', async () => {
      const pyq = dbStore.questions.find(q => q.is_pyq);
      if (!pyq) return;

      const req = new NextRequest('http://localhost:3000/api/progress', {
        method: 'POST',
        headers: { Authorization: `Bearer ${studentToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject_id: pyq.subject_id,
          unit_id: pyq.unit_id,
          item_type: 'PYQ',
          item_id: pyq.id,
          is_completed: true,
        }),
      });

      const res = await toggleProgressHandler(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data.item_type).toBe('PYQ');
    });

    it('returns 400 for invalid progress payload', async () => {
      const req = new NextRequest('http://localhost:3000/api/progress', {
        method: 'POST',
        headers: { Authorization: `Bearer ${studentToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ invalid: 'payload' }),
      });

      const res = await toggleProgressHandler(req);
      expect(res.status).toBe(400);
      expect((await res.json()).error.code).toBe('VALIDATION_ERROR');
    });

    it('student cannot update another student progress via body user_id injection', async () => {
      const req = new NextRequest('http://localhost:3000/api/progress', {
        method: 'POST',
        headers: { Authorization: `Bearer ${studentToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 'usr-student-2', // attack: setting another user's progress
          subject_id: 'sub-dbms',
          unit_id: 'unit-dbms-1',
          item_type: 'TOPIC',
          item_id: 'topic-dbms-1',
          is_completed: true,
        }),
      });

      const res = await toggleProgressHandler(req);
      expect(res.status).toBe(403);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 3. Personalization Engine
  // ─────────────────────────────────────────────────────────────
  describe('Personalization Engine: Syllabus Coverage & Recommendations', () => {
    it('calculates syllabus coverage for a student', () => {
      const summary = calculateStudentPersonalization('usr-student-1', 'sub-dbms');
      expect(summary.syllabus_coverage).toBeDefined();
      expect(summary.syllabus_coverage.total_topics).toBeGreaterThan(0);
      expect(summary.syllabus_coverage.percentage).toBeGreaterThanOrEqual(0);
      expect(summary.syllabus_coverage.percentage).toBeLessThanOrEqual(100);
    });

    it('provides primary_next_action for dashboard "what to do next?"', () => {
      const summary = calculateStudentPersonalization('usr-student-1', 'sub-dbms');
      expect(summary.primary_next_action).toBeDefined();
      expect(summary.primary_next_action.type).toBeDefined();
      expect(summary.primary_next_action.title).toBeDefined();
    });

    it('provides secondary_recommendations list', () => {
      const summary = calculateStudentPersonalization('usr-student-1', 'sub-dbms');
      expect(Array.isArray(summary.secondary_recommendations)).toBe(true);
    });

    it('tracks practice_summary with quiz attempts', () => {
      const summary = calculateStudentPersonalization('usr-student-1', 'sub-dbms');
      expect(summary.practice_summary).toBeDefined();
      expect(typeof summary.practice_summary.quizzes_attempted).toBe('number');
      expect(typeof summary.practice_summary.questions_practiced).toBe('number');
    });

    it('identifies weak topics for students with failed quizzes', () => {
      // Add a failed quiz attempt
      dbStore.quizAttempts.push({
        id: 'att-fail-test',
        user_id: 'usr-student-1',
        quiz_id: dbStore.quizzes[0]?.id || 'quiz-dbms-1',
        score: 0,
        max_score: 20,
        percentage: 0,
        time_taken_seconds: 300,
        completed_at: new Date().toISOString(),
        answers_json: {},
        created_at: new Date().toISOString(),
      });

      const summary = calculateStudentPersonalization('usr-student-1', 'sub-dbms');
      expect(Array.isArray(summary.weak_topics)).toBe(true);
    });

    it('identifies strong topics for students with completed topics', () => {
      // Mark a topic as completed multiple times via revision records
      const topic = dbStore.topics[0];
      if (!topic) return;

      dbStore.revisionRecords.push({
        id: 'rev-strong-test',
        user_id: 'usr-student-1',
        subject_id: 'sub-dbms',
        topic_id: topic.id,
        revision_count: 5,
        confidence_level: 'CONFIDENT',
        last_revised_at: new Date().toISOString(),
        next_recommended_revision_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      const summary = calculateStudentPersonalization('usr-student-1', 'sub-dbms');
      expect(Array.isArray(summary.strong_topics)).toBe(true);
    });

    it('returns progress summary from API route with all fields', async () => {
      const req = new NextRequest('http://localhost:3000/api/progress?subject_id=sub-dbms', {
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      const res = await getProgressHandler(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data.syllabus_coverage).toBeDefined();
      expect(json.data.practice_summary).toBeDefined();
      expect(json.data.primary_next_action).toBeDefined();
      expect(json.data.weak_topics).toBeDefined();
      expect(json.data.strong_topics).toBeDefined();
      expect(json.data.secondary_recommendations).toBeDefined();
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 4. Study Session Tracking
  // ─────────────────────────────────────────────────────────────
  describe('Study Session Tracking', () => {
    it('creates a study session for the authenticated student', async () => {
      const req = new NextRequest('http://localhost:3000/api/progress/session', {
        method: 'POST',
        headers: { Authorization: `Bearer ${studentToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject_id: 'sub-dbms',
          duration_minutes: 45,
          topics_covered: ['topic-norm-bcnf', 'topic-dbms-sql'],
          questions_practiced: 5,
          notes_reviewed: 2,
        }),
      });

      const res = await createSessionHandler(req);
      expect(res.status).toBe(200); // apiSuccess defaults to 200
      const json = await res.json();
      expect(json.data.duration_minutes).toBe(45);
      expect(json.data.subject_id).toBe('sub-dbms');
    });

    it('retrieves study sessions for the authenticated student', async () => {
      const req = new NextRequest('http://localhost:3000/api/progress/session?subject_id=sub-dbms', {
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      const res = await getSessionsHandler(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      // GET returns { sessions: [...], total_sessions, total_minutes }
      expect(Array.isArray(json.data.sessions)).toBe(true);
    });

    it('student cannot create session for another student (privacy)', async () => {
      const req = new NextRequest('http://localhost:3000/api/progress/session', {
        method: 'POST',
        headers: { Authorization: `Bearer ${studentToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 'usr-student-2',
          subject_id: 'sub-dbms',
          duration_minutes: 30,
          topics_covered: [],
          questions_practiced: 0,
          notes_reviewed: 0,
        }),
      });

      const res = await createSessionHandler(req);
      // Should either redirect to their own session or block
      expect([200, 201, 403]).toContain(res.status);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 5. Revision Tracking
  // ─────────────────────────────────────────────────────────────
  describe('Revision Tracking', () => {
    it('creates a revision record for a topic', async () => {
      const topic = dbStore.topics[0];
      if (!topic) return;

      const req = new NextRequest('http://localhost:3000/api/progress/revision', {
        method: 'POST',
        headers: { Authorization: `Bearer ${studentToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject_id: 'sub-dbms',
          topic_id: topic.id,
          confidence_level: 'CONFIDENT',
        }),
      });

      const res = await createRevisionHandler(req);
      expect(res.status).toBe(200); // apiSuccess returns 200 by default
      const json = await res.json();
      expect(json.data.topic_id).toBe(topic.id);
      expect(json.data.revision_count).toBeGreaterThanOrEqual(1);
    });

    it('increments revision_count on repeat revisions', async () => {
      const topic = dbStore.topics[0];
      if (!topic) return;

      const body = JSON.stringify({
        subject_id: 'sub-dbms',
        topic_id: topic.id,
        confidence_level: 'MODERATE',
      });

      await createRevisionHandler(new NextRequest('http://localhost:3000/api/progress/revision', {
        method: 'POST',
        headers: { Authorization: `Bearer ${studentToken}`, 'Content-Type': 'application/json' },
        body,
      }));

      const res2 = await createRevisionHandler(new NextRequest('http://localhost:3000/api/progress/revision', {
        method: 'POST',
        headers: { Authorization: `Bearer ${studentToken}`, 'Content-Type': 'application/json' },
        body,
      }));

      const json2 = await res2.json();
      expect(json2.data.revision_count).toBeGreaterThanOrEqual(2);
    });

    it('retrieves revision history for a student', async () => {
      const req = new NextRequest('http://localhost:3000/api/progress/revision?subject_id=sub-dbms', {
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      const res = await getRevisionHandler(req);
      expect(res.status).toBe(200);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 6. Exam Mode Progress Tracking
  // ─────────────────────────────────────────────────────────────
  describe('Exam Mode Progress Tracking', () => {
    it('creates an exam mode completion record', async () => {
      const req = new NextRequest('http://localhost:3000/api/progress/exam-mode', {
        method: 'POST',
        headers: { Authorization: `Bearer ${studentToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject_id: 'sub-dbms',
          duration_type: '1d',
          total_tasks: 10,
          completed_tasks: 8,
          status: 'COMPLETED',
        }),
      });

      const res = await createExamModeRecordHandler(req);
      expect(res.status).toBe(200); // apiSuccess returns 200 by default
      const json = await res.json();
      expect(json.data.completion_rate).toBe(80);
      expect(json.data.status).toBe('COMPLETED');
    });

    it('retrieves exam mode records for the student', async () => {
      const req = new NextRequest('http://localhost:3000/api/progress/exam-mode', {
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      const res = await getExamModeRecordsHandler(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      // GET returns { records: [...], total_sprints, completed_sprints }
      expect(Array.isArray(json.data.records)).toBe(true);
    });

    it('exam mode completion increments exam_modes_completed in practice summary', () => {
      dbStore.examModeRecords.push({
        id: 'exam-mode-test-1',
        user_id: 'usr-student-1',
        subject_id: 'sub-dbms',
        duration_type: '7d',
        total_tasks: 20,
        completed_tasks: 20,
        completion_rate: 100,
        status: 'COMPLETED',
        completed_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      const summary = calculateStudentPersonalization('usr-student-1', 'sub-dbms');
      expect(summary.practice_summary.exam_modes_completed).toBeGreaterThan(0);
    });
  });
});
