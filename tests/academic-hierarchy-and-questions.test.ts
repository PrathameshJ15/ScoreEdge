import { describe, it, expect, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { dbStore } from '../src/lib/db/client';
import { createAuthToken } from '../src/lib/api/auth';
import { GET as getQuestionsHandler, POST as createQuestionHandler } from '../src/app/api/questions/route';
import { GET as getQuestionDetailHandler } from '../src/app/api/questions/[id]/route';
import { GET as getSyllabusHandler, POST as createSyllabusHandler } from '../src/app/api/syllabus/route';
import { GET as getTopicsHandler } from '../src/app/api/topics/route';
import { GET as getUnitsHandler } from '../src/app/api/units/route';
import { GET as getPapersHandler } from '../src/app/api/papers/route';
import { POST as toggleProgressHandler } from '../src/app/api/progress/route';

describe('Academic Hierarchy & Question Bank Suite', () => {
  beforeEach(() => {
    dbStore.reset();
  });

  describe('Academic Hierarchy & Syllabus Management', () => {
    it('retrieves units belonging to a specific subject', async () => {
      const req = new NextRequest('http://localhost:3000/api/units?subject_id=sub-dbms');
      const res = await getUnitsHandler(req);

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data.length).toBe(6);
      expect(json.data[0].title).toContain('DBMS');
      expect(json.data[0].unit_number).toBe(1);
    });

    it('retrieves topics belonging to a subject', async () => {
      const req = new NextRequest('http://localhost:3000/api/topics?subject_id=sub-dbms');
      const res = await getTopicsHandler(req);

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data.length).toBeGreaterThan(0);
      expect(json.data.some((t: any) => t.importance_level === 'MUST_STUDY')).toBe(true);
    });

    it('retrieves syllabus items enriched with unit and subject metadata', async () => {
      const req = new NextRequest('http://localhost:3000/api/syllabus?subject_id=sub-dbms');
      const res = await getSyllabusHandler(req);

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data.length).toBeGreaterThan(0);
      expect(json.data[0].unit).toBeDefined();
      expect(json.data[0].unit.unit_number).toBeDefined();
      expect(json.data[0].hours_allocated).toBeGreaterThan(0);
      expect(json.data[0].reference_materials).toBeDefined();
    });

    it('searches within syllabus content by keyword', async () => {
      const req = new NextRequest('http://localhost:3000/api/syllabus?subject_id=sub-dbms&q=normalization');
      const res = await getSyllabusHandler(req);

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data.length).toBeGreaterThan(0);
      expect(
        json.data[0].content.toLowerCase().includes('normalization') ||
        json.data[0].unit.title.toLowerCase().includes('normalization')
      ).toBe(true);
    });

    it('allows students to track and update syllabus coverage progress', async () => {
      const req = new NextRequest('http://localhost:3000/api/progress', {
        method: 'POST',
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
      expect(json.data.topic_id).toBe('topic-norm-bcnf');
    });

    it('blocks students from creating syllabus items without admin permissions', async () => {
      const studentToken = createAuthToken({ id: 'usr-student-1', email: 'student@sppu.ac.in', role: 'STUDENT' });
      const req = new NextRequest('http://localhost:3000/api/syllabus', {
        method: 'POST',
        headers: { Authorization: `Bearer ${studentToken}` },
        body: JSON.stringify({
          unit_id: 'unit-dbms-1',
          content: 'Unauthorized content insertion',
          hours_allocated: 4,
        }),
      });

      const res = await createSyllabusHandler(req);
      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.error.code).toBe('FORBIDDEN');
    });
  });

  describe('PYQ Library & Question Bank System', () => {
    it('filters questions by marks, subject, and question_type', async () => {
      const req = new NextRequest('http://localhost:3000/api/questions?subject_id=sub-dbms&marks=8&question_type=THEORY');
      const res = await getQuestionsHandler(req);

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data.length).toBeGreaterThan(0);
      expect(json.data.every((q: any) => q.marks === 8)).toBe(true);
      expect(json.data.every((q: any) => q.question_type === 'THEORY')).toBe(true);
    });

    it('filters questions by exam year and session from occurrences', async () => {
      const req = new NextRequest('http://localhost:3000/api/questions?year=2024&exam_session=IN_SEM');
      const res = await getQuestionsHandler(req);

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data.length).toBeGreaterThan(0);
      expect(
        json.data.every((q: any) =>
          q.occurrences.some((o: any) => o.year === 2024 && o.exam_session === 'IN_SEM')
        )
      ).toBe(true);
    });

    it('filters questions by verification status', async () => {
      const req = new NextRequest('http://localhost:3000/api/questions?verification_status=VERIFIED');
      const res = await getQuestionsHandler(req);

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data.length).toBeGreaterThan(0);
      expect(json.data.every((q: any) => q.verification_status === 'VERIFIED')).toBe(true);
    });

    it('retrieves detailed question view with subject, unit, pattern, occurrences, and answers', async () => {
      const req = new NextRequest('http://localhost:3000/api/questions/q-dbms-3nf-bcnf');
      const res = await getQuestionDetailHandler(req, { params: { id: 'q-dbms-3nf-bcnf' } });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data.question.id).toBe('q-dbms-3nf-bcnf');
      expect(json.data.question.subject).toBeDefined();
      expect(json.data.question.unit).toBeDefined();
      expect(json.data.question.pattern).toBeDefined();
      expect(json.data.occurrences.length).toBeGreaterThan(0);
      expect(json.data.answers.length).toBeGreaterThan(0);
      expect(json.data.answers[0].summary).toContain('BCNF');
    });

    it('groups question occurrences into examination papers for Paper Browsing', async () => {
      const req = new NextRequest('http://localhost:3000/api/papers?subject_id=sub-dbms');
      const res = await getPapersHandler(req);

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data.length).toBeGreaterThan(0);
      const firstPaper = json.data[0];
      expect(firstPaper.title).toContain('SPPU');
      expect(firstPaper.questions.length).toBeGreaterThan(0);
      expect(firstPaper.questions[0].question_number).toBeDefined();
      expect(firstPaper.total_marks).toBeGreaterThan(0);
    });

    it('blocks students from creating questions without admin role', async () => {
      const studentToken = createAuthToken({ id: 'usr-student-1', email: 'student@sppu.ac.in', role: 'STUDENT' });
      const req = new NextRequest('http://localhost:3000/api/questions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${studentToken}` },
        body: JSON.stringify({
          subject_id: 'sub-dbms',
          unit_id: 'unit-dbms-1',
          question_text: 'Explain SQL injection vulnerabilities.',
          marks: 5,
          difficulty: 'MEDIUM',
          question_type: 'THEORY',
          is_pyq: false,
          verification_status: 'UNVERIFIED',
          content_status: 'DRAFT',
        }),
      });

      const res = await createQuestionHandler(req);
      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.error.code).toBe('FORBIDDEN');
    });

    it('allows admin to create verified questions with content lifecycle', async () => {
      const adminToken = createAuthToken({ id: 'usr-admin-1', email: 'admin@scoreedge.in', role: 'ADMIN' });
      const req = new NextRequest('http://localhost:3000/api/questions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({
          subject_id: 'sub-dbms',
          unit_id: 'unit-dbms-1',
          question_text: 'Compare File Processing Systems vs DBMS with respect to data redundancy.',
          marks: 5,
          difficulty: 'EASY',
          question_type: 'THEORY',
          is_pyq: true,
          verification_status: 'VERIFIED',
          content_status: 'PUBLISHED',
        }),
      });

      const res = await createQuestionHandler(req);
      expect(res.status).toBe(201);
      const json = await res.json();
      expect(json.data.question_text).toContain('Compare File Processing Systems');
      expect(json.data.verification_status).toBe('VERIFIED');
    });
  });
});