import { describe, it, expect, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { dbStore } from '@/lib/db/client';
import { createAuthToken } from '@/lib/api/auth';
import {
  calculateStudentPersonalization,
  validateProgressAccess,
} from '@/lib/progress/personalizationEngine';
import { GET as getProgressHandler, POST as toggleProgressHandler } from '@/app/api/progress/route';
import { GET as getSessionHandler, POST as postSessionHandler } from '@/app/api/progress/session/route';
import { GET as getRevisionHandler, POST as postRevisionHandler } from '@/app/api/progress/revision/route';
import { GET as getExamModeHandler, POST as postExamModeHandler } from '@/app/api/progress/exam-mode/route';

describe('ScoreEdge Student Progress & Personalization Engine', () => {
  const student1Token = createAuthToken({
    id: 'usr-student-1',
    email: 'student@sppu.ac.in',
    role: 'STUDENT',
  });

  const student2Token = createAuthToken({
    id: 'usr-student-2',
    email: 'rahul.sharma@sppu.ac.in',
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

  describe('1. Student Data Protection & Privacy Isolation', () => {
    it('strictly forbids a student from reading another student\'s progress records', async () => {
      // Student 1 tries to read Student 2's private progress
      const req = new NextRequest('http://localhost:3000/api/progress?user_id=usr-student-2', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${student1Token}`,
        },
      });

      const res = await getProgressHandler(req);
      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.error.code).toBe('ACCESS_DENIED');
      expect(json.error.message).toContain('another student');
    });

    it('strictly forbids a student from modifying another student\'s progress', async () => {
      // Student 1 tries to toggle progress on behalf of Student 2
      const req = new NextRequest('http://localhost:3000/api/progress', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${student1Token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: 'usr-student-2',
          subject_id: 'sub-dbms',
          item_type: 'TOPIC',
          item_id: 'topic-norm-3nf',
          is_completed: true,
        }),
      });

      const res = await toggleProgressHandler(req);
      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.error.code).toBe('ACCESS_DENIED');
    });

    it('rejects unauthenticated requests trying to query specific student IDs', async () => {
      const req = new NextRequest('http://localhost:3000/api/progress?user_id=usr-student-2', {
        method: 'GET',
      });

      const res = await getProgressHandler(req);
      expect(res.status).toBe(401);
    });

    it('allows students to freely access their own progress records', async () => {
      const req = new NextRequest('http://localhost:3000/api/progress', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${student1Token}`,
        },
      });

      const res = await getProgressHandler(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data.syllabus_coverage).toBeDefined();
    });

    it('allows ADMIN users to audit student progress across accounts', async () => {
      const req = new NextRequest('http://localhost:3000/api/progress?user_id=usr-student-2', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });

      const res = await getProgressHandler(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data.syllabus_coverage).toBeDefined();
    });
  });

  describe('2. Syllabus Coverage & Progress Tracking', () => {
    it('accurately calculates overall and unit-by-unit syllabus coverage', () => {
      const personalization = calculateStudentPersonalization('usr-student-1', 'sub-dbms');

      expect(personalization.syllabus_coverage.total_topics).toBeGreaterThan(0);
      expect(personalization.syllabus_coverage.completed_topics).toBeGreaterThanOrEqual(1);
      expect(personalization.syllabus_coverage.percentage).toBeGreaterThan(0);
      expect(personalization.syllabus_coverage.percentage).toBeLessThanOrEqual(100);

      // Verify unit breakdown includes unit numbers and percentages
      const breakdown = personalization.syllabus_coverage.unit_breakdown;
      expect(breakdown.length).toBeGreaterThanOrEqual(2);
      expect(breakdown.some((u) => u.unit_number === 3 && u.percentage > 0)).toBe(true);
    });

    it('tracks questions practiced and solved PYQs', async () => {
      // Toggle a solved PYQ
      const req = new NextRequest('http://localhost:3000/api/progress', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${student1Token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject_id: 'sub-dbms',
          item_type: 'PYQ',
          item_id: 'pyq-dbms-2023-q1',
          is_completed: true,
        }),
      });

      const res = await toggleProgressHandler(req);
      expect(res.status).toBe(200);

      const personalization = calculateStudentPersonalization('usr-student-1', 'sub-dbms');
      expect(personalization.practice_summary.pyqs_solved).toBeGreaterThanOrEqual(1);
      expect(personalization.practice_summary.questions_practiced).toBeGreaterThanOrEqual(1);
    });
  });

  describe('3. Weak Topics & Strong Topics Classification', () => {
    it('detects weak topics based on low quiz scores (<60%)', () => {
      // Seed includes a quiz attempt of 40% on Transactions
      const personalization = calculateStudentPersonalization('usr-student-1', 'sub-dbms');

      expect(personalization.weak_topics.length).toBeGreaterThan(0);
      const weakTopic = personalization.weak_topics.find((w) =>
        w.topic_title.toLowerCase().includes('locking') || w.topic_title.toLowerCase().includes('2pl')
      );
      expect(weakTopic).toBeDefined();
      expect(weakTopic?.severity).toBe('CRITICAL');
      expect(weakTopic?.reason).toContain('40%');
    });

    it('identifies strong topics based on high quiz accuracy (>=80%)', () => {
      // Seed includes a quiz attempt of 90% on Normalization
      const personalization = calculateStudentPersonalization('usr-student-1', 'sub-dbms');

      expect(personalization.strong_topics.length).toBeGreaterThan(0);
      const strongTopic = personalization.strong_topics.find((s) =>
        s.topic_title.toLowerCase().includes('normalization')
      );
      expect(strongTopic).toBeDefined();
      expect(strongTopic?.accuracy_percentage).toBe(90);
    });
  });

  describe('4. "What Should I Do Next?" Prioritized Recommendations', () => {
    it('generates a primary actionable recommendation focused on high-priority weak areas', () => {
      const personalization = calculateStudentPersonalization('usr-student-1', 'sub-dbms');

      const primary = personalization.primary_next_action;
      expect(primary).toBeDefined();
      expect(primary.title).toBeDefined();
      expect(primary.title.length).toBeGreaterThan(5);
      expect(primary.rationale).toBeDefined();
      expect(primary.action_url).toBeDefined();
      expect(primary.action_label).toBeDefined();
      expect(primary.estimated_minutes).toBeGreaterThan(0);
      expect(primary.priority).toBe('MUST_STUDY');
    });

    it('curates high-impact secondary recommendations (PYQs, diagnostic drills, revision)', () => {
      const personalization = calculateStudentPersonalization('usr-student-1', 'sub-dbms');

      const secondaries = personalization.secondary_recommendations;
      expect(secondaries.length).toBe(3);
      expect(secondaries.some((s) => s.type === 'SOLVE_PYQ')).toBe(true);
      expect(secondaries.some((s) => s.type === 'TAKE_QUIZ')).toBe(true);
    });
  });

  describe('5. Study Sessions & Spaced Revision History', () => {
    it('records and retrieves study sessions via /api/progress/session', async () => {
      const postReq = new NextRequest('http://localhost:3000/api/progress/session', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${student1Token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject_id: 'sub-dbms',
          duration_minutes: 50,
          topics_covered: ['topic-norm-3nf'],
          questions_practiced: 4,
          notes_reviewed: 2,
        }),
      });

      const postRes = await postSessionHandler(postReq);
      expect(postRes.status).toBe(200);
      const postJson = await postRes.json();
      expect(postJson.data.duration_minutes).toBe(50);

      // Get sessions
      const getReq = new NextRequest('http://localhost:3000/api/progress/session?subject_id=sub-dbms', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${student1Token}`,
        },
      });

      const getRes = await getSessionHandler(getReq);
      expect(getRes.status).toBe(200);
      const getJson = await getRes.json();
      expect(getJson.data.total_sessions).toBeGreaterThanOrEqual(1);
      expect(getJson.data.total_minutes).toBeGreaterThanOrEqual(50);
    });

    it('records and calculates spaced revision schedules via /api/progress/revision', async () => {
      const postReq = new NextRequest('http://localhost:3000/api/progress/revision', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${student1Token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject_id: 'sub-dbms',
          topic_id: 'topic-norm-3nf',
          confidence_level: 'CONFIDENT',
        }),
      });

      const postRes = await postRevisionHandler(postReq);
      expect(postRes.status).toBe(200);
      const postJson = await postRes.json();
      expect(postJson.data.revision_count).toBeGreaterThanOrEqual(1);
      expect(postJson.data.next_recommended_revision_at).toBeDefined();
    });

    it('records and retrieves Exam Mode completion sprints', async () => {
      const postReq = new NextRequest('http://localhost:3000/api/progress/exam-mode', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${student1Token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject_id: 'sub-dbms',
          duration_type: '2h',
          total_tasks: 5,
          completed_tasks: 5,
          status: 'COMPLETED',
        }),
      });

      const postRes = await postExamModeHandler(postReq);
      expect(postRes.status).toBe(200);
      const postJson = await postRes.json();
      expect(postJson.data.status).toBe('COMPLETED');
      expect(postJson.data.completion_rate).toBe(100);

      // Get exam mode history
      const getReq = new NextRequest('http://localhost:3000/api/progress/exam-mode', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${student1Token}`,
        },
      });

      const getRes = await getExamModeHandler(getReq);
      expect(getRes.status).toBe(200);
      const getJson = await getRes.json();
      expect(getJson.data.completed_sprints).toBeGreaterThanOrEqual(1);
    });
  });
});
