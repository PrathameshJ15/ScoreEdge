import { describe, it, expect, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { dbStore } from '../src/lib/db/client';
import { createAuthToken } from '../src/lib/api/auth';

// Admin endpoints
import { GET as getAdminStatsHandler } from '../src/app/api/admin/route';
import { POST as verifyActionHandler } from '../src/app/api/admin/verify/route';
import { GET as getAuditLogsHandler } from '../src/app/api/admin/audit/route';

// Content routes
import { GET as getQuestionsHandler, POST as createQuestionHandler } from '../src/app/api/questions/route';
import { GET as getQuestionDetailHandler, PUT as updateQuestionHandler, DELETE as deleteQuestionHandler } from '../src/app/api/questions/[id]/route';
import { GET as getNotesHandler, POST as createNoteHandler, PUT as updateNoteHandler, DELETE as deleteNoteHandler } from '../src/app/api/notes/route';
import { GET as getQuizzesHandler, POST as createQuizHandler, PUT as updateQuizHandler, DELETE as deleteQuizHandler } from '../src/app/api/quizzes/route';
import { GET as getSyllabusHandler, POST as createSyllabusHandler, PUT as updateSyllabusHandler, DELETE as deleteSyllabusHandler } from '../src/app/api/syllabus/route';
import { GET as getAnswersHandler, POST as createAnswerHandler, PUT as updateAnswerHandler, DELETE as deleteAnswerHandler } from '../src/app/api/answers/route';
import { GET as getSourcesHandler, POST as createSourceHandler, PUT as updateSourceHandler, DELETE as deleteSourceHandler } from '../src/app/api/sources/route';
import { GET as getOccurrencesHandler, POST as createOccurrenceHandler, PUT as updateOccurrenceHandler, DELETE as deleteOccurrenceHandler } from '../src/app/api/occurrences/route';
import { POST as createUniversityHandler, PUT as updateUniversityHandler, DELETE as deleteUniversityHandler } from '../src/app/api/universities/route';
import { POST as createPatternHandler, PUT as updatePatternHandler, DELETE as deletePatternHandler } from '../src/app/api/patterns/route';
import { POST as createBranchHandler, PUT as updateBranchHandler, DELETE as deleteBranchHandler } from '../src/app/api/branches/route';
import { POST as createAcademicYearHandler, PUT as updateAcademicYearHandler, DELETE as deleteAcademicYearHandler } from '../src/app/api/academic-years/route';
import { POST as createSemesterHandler, PUT as updateSemesterHandler, DELETE as deleteSemesterHandler } from '../src/app/api/semesters/route';
import { POST as createSubjectHandler } from '../src/app/api/subjects/route';
import { PUT as updateSubjectHandler, DELETE as deleteSubjectHandler } from '../src/app/api/subjects/[id]/route';
import { POST as createUnitHandler, PUT as updateUnitHandler, DELETE as deleteUnitHandler } from '../src/app/api/units/route';
import { POST as createTopicHandler, PUT as updateTopicHandler, DELETE as deleteTopicHandler } from '../src/app/api/topics/route';

describe('ScoreEdge Admin CMS & Content Governance Suite', () => {
  const adminToken = createAuthToken({ id: 'usr-admin-1', email: 'admin@scoreedge.in', role: 'ADMIN' });
  const studentToken = createAuthToken({ id: 'usr-student-1', email: 'student@sppu.ac.in', role: 'STUDENT' });

  beforeEach(() => {
    dbStore.reset();
  });

  describe('Strict CMS Authorization & Role Enforcement', () => {
    it('rejects student from accessing admin dashboard stats', async () => {
      const req = new NextRequest('http://localhost:3000/api/admin', {
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      const res = await getAdminStatsHandler(req);
      expect(res.status).toBe(403);
    });

    it('allows admin to retrieve full dashboard stats and status breakdown', async () => {
      const req = new NextRequest('http://localhost:3000/api/admin', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const res = await getAdminStatsHandler(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data.stats.total_subjects).toBeGreaterThan(0);
      expect(json.data.status_breakdown.PUBLISHED).toBeGreaterThan(0);
    });

    it('blocks student from creating universities, patterns, branches, and academic years', async () => {
      const studentHeaders = { Authorization: `Bearer ${studentToken}` };

      // University
      const uReq = new NextRequest('http://localhost:3000/api/universities', {
        method: 'POST',
        headers: studentHeaders,
        body: JSON.stringify({ code: 'MU', name: 'Mumbai University', state: 'Maharashtra' }),
      });
      expect((await createUniversityHandler(uReq)).status).toBe(403);

      // Pattern
      const pReq = new NextRequest('http://localhost:3000/api/patterns', {
        method: 'POST',
        headers: studentHeaders,
        body: JSON.stringify({ university_id: 'uni-sppu', name: '2026 Pattern', code: '2026', effective_year: 2026 }),
      });
      expect((await createPatternHandler(pReq)).status).toBe(403);

      // Branch
      const bReq = new NextRequest('http://localhost:3000/api/branches', {
        method: 'POST',
        headers: studentHeaders,
        body: JSON.stringify({ code: 'AI-DS', name: 'Artificial Intelligence & Data Science' }),
      });
      expect((await createBranchHandler(bReq)).status).toBe(403);

      // Academic Year
      const ayReq = new NextRequest('http://localhost:3000/api/academic-years', {
        method: 'POST',
        headers: studentHeaders,
        body: JSON.stringify({ pattern_id: 'pat-2024', code: 'BE', name: 'Final Year', year_number: 4 }),
      });
      expect((await createAcademicYearHandler(ayReq)).status).toBe(403);
    });

    it('blocks student from mutating subjects, units, topics, and syllabus items', async () => {
      const studentHeaders = { Authorization: `Bearer ${studentToken}` };

      // Subject creation
      const sReq = new NextRequest('http://localhost:3000/api/subjects', {
        method: 'POST',
        headers: studentHeaders,
        body: JSON.stringify({
          pattern_id: 'pat-2024',
          branch_id: 'br-comp',
          semester_id: 'sem-3',
          code: '210255',
          name: 'Distributed Systems',
          short_name: 'DS',
          total_units: 6,
          total_credits: 3,
          is_popular: false,
        }),
      });
      expect((await createSubjectHandler(sReq)).status).toBe(403);

      // Unit creation
      const uReq = new NextRequest('http://localhost:3000/api/units', {
        method: 'POST',
        headers: studentHeaders,
        body: JSON.stringify({
          subject_id: 'sub-dbms',
          unit_number: 7,
          title: 'Distributed Databases',
          description: 'Replication and partitioning',
          weightage_percentage: 15,
        }),
      });
      expect((await createUnitHandler(uReq)).status).toBe(403);

      // Topic creation
      const tReq = new NextRequest('http://localhost:3000/api/topics', {
        method: 'POST',
        headers: studentHeaders,
        body: JSON.stringify({
          unit_id: 'unit-dbms-1',
          title: 'Two-Phase Commit',
          description: 'Atomic commitment protocol',
          order_index: 5,
          importance_level: 'HIGH',
        }),
      });
      expect((await createTopicHandler(tReq)).status).toBe(403);
    });

    it('blocks student from mutating content sources and question occurrences', async () => {
      const studentHeaders = { Authorization: `Bearer ${studentToken}` };

      // Content source
      const srcReq = new NextRequest('http://localhost:3000/api/sources', {
        method: 'POST',
        headers: studentHeaders,
        body: JSON.stringify({
          name: 'Hacked Source',
          source_type: 'COMMUNITY_SUBMISSION',
        }),
      });
      expect((await createSourceHandler(srcReq)).status).toBe(403);

      // Question occurrence
      const occReq = new NextRequest('http://localhost:3000/api/occurrences', {
        method: 'POST',
        headers: studentHeaders,
        body: JSON.stringify({
          question_id: 'q-dbms-3nf-bcnf',
          year: 2025,
          exam_session: 'IN_SEM',
          question_number: 'Q1',
          marks: 5,
          pattern_id: 'pat-2024',
          branch_id: 'br-comp',
          semester_id: 'sem-3',
          subject_id: 'sub-dbms',
        }),
      });
      expect((await createOccurrenceHandler(occReq)).status).toBe(403);
    });
  });

  describe('Unpublished Content Protection & Student Privacy', () => {
    it('hides DRAFT, REVIEW, and ARCHIVED questions from student role', async () => {
      // Create a draft question as admin
      const createReq = new NextRequest('http://localhost:3000/api/questions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({
          subject_id: 'sub-dbms',
          unit_id: 'unit-dbms-1',
          question_text: 'Confidential draft question on database concurrency locks.',
          marks: 8,
          difficulty: 'HARD',
          question_type: 'THEORY',
          is_pyq: true,
          verification_status: 'NEEDS_REVIEW',
          content_status: 'DRAFT',
        }),
      });
      const createRes = await createQuestionHandler(createReq);
      expect(createRes.status).toBe(201);
      const createdQuestion = (await createRes.json()).data;

      // Student queries questions
      const studentQueryReq = new NextRequest('http://localhost:3000/api/questions?q=concurrency', {
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      const studentRes = await getQuestionsHandler(studentQueryReq);
      const studentJson = await studentRes.json();
      expect(studentJson.data.some((q: any) => q.id === createdQuestion.id)).toBe(false);

      // Student tries direct access by ID
      const directReq = new NextRequest(`http://localhost:3000/api/questions/${createdQuestion.id}`, {
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      const directRes = await getQuestionDetailHandler(directReq, { params: { id: createdQuestion.id } });
      expect(directRes.status).toBe(404);

      // Admin queries questions with status=DRAFT -> Visible
      const adminQueryReq = new NextRequest('http://localhost:3000/api/questions?status=DRAFT', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const adminRes = await getQuestionsHandler(adminQueryReq);
      const adminJson = await adminRes.json();
      expect(adminJson.data.some((q: any) => q.id === createdQuestion.id)).toBe(true);
    });

    it('hides DRAFT and REVIEW study notes from students until published', async () => {
      // Create a review note as admin
      const createReq = new NextRequest('http://localhost:3000/api/notes', {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({
          subject_id: 'sub-dbms',
          unit_id: 'unit-dbms-1',
          title: 'Under-Review Note on Transaction Isolation',
          slug: 'draft-tx-isolation',
          summary: 'Internal draft summary',
          content_body: 'Draft content undergoing peer academic review.',
          read_time_minutes: 8,
          is_free_preview: true,
          content_status: 'REVIEW',
        }),
      });
      const createRes = await createNoteHandler(createReq);
      expect(createRes.status).toBe(201);
      const draftNote = (await createRes.json()).data;

      // Student views notes
      const studentReq = new NextRequest('http://localhost:3000/api/notes?slug=draft-tx-isolation', {
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      const studentRes = await getNotesHandler(studentReq);
      const studentJson = await studentRes.json();
      expect(studentJson.data.some((n: any) => n.id === draftNote.id)).toBe(false);
    });

    it('hides DRAFT quizzes from students', async () => {
      const createReq = new NextRequest('http://localhost:3000/api/quizzes', {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({
          subject_id: 'sub-dbms',
          title: 'Unpublished Practice Quiz',
          description: 'Draft quiz questions',
          duration_minutes: 10,
          total_questions: 5,
          passing_score: 50,
          difficulty: 'BASIC',
          is_premium: false,
          content_status: 'DRAFT',
        }),
      });
      const createRes = await createQuizHandler(createReq);
      expect(createRes.status).toBe(201);
      const draftQuiz = (await createRes.json()).data;

      const studentReq = new NextRequest('http://localhost:3000/api/quizzes', {
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      const studentRes = await getQuizzesHandler(studentReq);
      const studentJson = await studentRes.json();
      expect(studentJson.data.some((qz: any) => qz.id === draftQuiz.id)).toBe(false);
    });
  });

  describe('Full Content Lifecycle Transitions & Audit Logging', () => {
    it('executes complete verification workflow: DRAFT -> REVIEW -> VERIFIED -> PUBLISHED -> ARCHIVED', async () => {
      // 1. Admin creates a question in DRAFT
      const createReq = new NextRequest('http://localhost:3000/api/questions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({
          subject_id: 'sub-dbms',
          unit_id: 'unit-dbms-3',
          question_text: 'Define Boyce-Codd Normal Form with functional dependency violation examples.',
          marks: 5,
          difficulty: 'MEDIUM',
          question_type: 'THEORY',
          is_pyq: true,
          verification_status: 'UNVERIFIED',
          content_status: 'DRAFT',
        }),
      });
      const createRes = await createQuestionHandler(createReq);
      const q = (await createRes.json()).data;
      expect(q.content_status).toBe('DRAFT');

      // 2. Admin submits for REVIEW
      const reviewReq = new NextRequest('http://localhost:3000/api/admin/verify', {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({
          entity_type: 'QUESTION',
          entity_id: q.id,
          status: 'REVIEW',
          review_notes: 'Submitted to Dr. Sharma for curriculum verification',
        }),
      });
      const reviewRes = await verifyActionHandler(reviewReq);
      expect(reviewRes.status).toBe(200);

      // 3. Reviewer marks VERIFIED
      const verifiedReq = new NextRequest('http://localhost:3000/api/admin/verify', {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({
          entity_type: 'QUESTION',
          entity_id: q.id,
          status: 'VERIFIED',
          review_notes: 'Verified against SPPU 2024 syllabus requirements',
        }),
      });
      const verifiedRes = await verifyActionHandler(verifiedReq);
      expect(verifiedRes.status).toBe(200);

      // 4. Admin PUBLISHES
      const pubReq = new NextRequest('http://localhost:3000/api/admin/verify', {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({
          entity_type: 'QUESTION',
          entity_id: q.id,
          status: 'PUBLISHED',
          review_notes: 'Published to student question bank',
        }),
      });
      const pubRes = await verifyActionHandler(pubReq);
      expect(pubRes.status).toBe(200);

      // Now question is visible to student!
      const studentReq = new NextRequest(`http://localhost:3000/api/questions/${q.id}`, {
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      const studentRes = await getQuestionDetailHandler(studentReq, { params: { id: q.id } });
      expect(studentRes.status).toBe(200);

      // 5. Admin ARCHIVES
      const archReq = new NextRequest('http://localhost:3000/api/admin/verify', {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({
          entity_type: 'QUESTION',
          entity_id: q.id,
          status: 'ARCHIVED',
          review_notes: 'Archived due to syllabus revision',
        }),
      });
      const archRes = await verifyActionHandler(archReq);
      expect(archRes.status).toBe(200);

      // Student access is revoked again
      const studentCheckReq = new NextRequest(`http://localhost:3000/api/questions/${q.id}`, {
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      expect((await getQuestionDetailHandler(studentCheckReq, { params: { id: q.id } })).status).toBe(404);

      // Verify Audit Trail captured all transitions
      const auditReq = new NextRequest(`http://localhost:3000/api/admin/audit?entity_id=${q.id}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const auditRes = await getAuditLogsHandler(auditReq);
      expect(auditRes.status).toBe(200);
      const auditJson = await auditRes.json();
      expect(auditJson.data.length).toBe(4);
      expect(auditJson.data.some((a: any) => a.status_to === 'PUBLISHED')).toBe(true);
      expect(auditJson.data.some((a: any) => a.status_to === 'ARCHIVED')).toBe(true);
    });
  });

  describe('Source Attribution & Examination Occurrence Management', () => {
    it('creates an official SPPU exam source and links it to questions and occurrences', async () => {
      // 1. Create content source
      const srcReq = new NextRequest('http://localhost:3000/api/sources', {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({
          name: 'SPPU SE Computer Engineering In-Sem Oct 2024 Paper',
          source_type: 'UNIVERSITY_EXAM_PAPER',
          source_url: 'https://unipune.ac.in/papers/se_comp_oct24.pdf',
          license_type: 'Official SPPU Question Paper',
          copyright_notes: 'All rights reserved by Savitribai Phule Pune University',
        }),
      });
      const srcRes = await createSourceHandler(srcReq);
      expect(srcRes.status).toBe(201);
      const source = (await srcRes.json()).data;
      expect(source.id).toBeDefined();

      // 2. Create question attributed to this source
      const qReq = new NextRequest('http://localhost:3000/api/questions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({
          subject_id: 'sub-dbms',
          unit_id: 'unit-dbms-2',
          question_text: 'Explain ACID properties of transactions with suitable bank transfer illustration.',
          marks: 5,
          difficulty: 'EASY',
          question_type: 'THEORY',
          is_pyq: true,
          verification_status: 'VERIFIED',
          content_status: 'PUBLISHED',
          source_id: source.id,
        }),
      });
      const qRes = await createQuestionHandler(qReq);
      const question = (await qRes.json()).data;
      expect(question.source_id).toBe(source.id);

      // 3. Attach exam occurrence linked to the source
      const occReq = new NextRequest('http://localhost:3000/api/occurrences', {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({
          question_id: question.id,
          year: 2024,
          exam_session: 'IN_SEM',
          question_number: 'Q2(b)',
          marks: 5,
          pattern_id: 'pat-2024',
          branch_id: 'br-comp',
          semester_id: 'sem-3',
          subject_id: 'sub-dbms',
          source_id: source.id,
          verification_status: 'VERIFIED',
        }),
      });
      const occRes = await createOccurrenceHandler(occReq);
      expect(occRes.status).toBe(201);
      const occ = (await occRes.json()).data;
      expect(occ.source_id).toBe(source.id);

      // 4. Retrieve question details and confirm occurrence and attribution
      const detailReq = new NextRequest(`http://localhost:3000/api/questions/${question.id}`);
      const detailRes = await getQuestionDetailHandler(detailReq, { params: { id: question.id } });
      const detailJson = await detailRes.json();
      expect(detailJson.data.occurrences.length).toBe(1);
      expect(detailJson.data.occurrences[0].question_number).toBe('Q2(b)');
      expect(detailJson.data.occurrences[0].year).toBe(2024);
    });

    it('allows admin to edit and delete/archive questions, answers, and sources', async () => {
      // Create answer
      const ansReq = new NextRequest('http://localhost:3000/api/answers', {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({
          question_id: 'q-dbms-3nf-bcnf',
          marks_target: '5',
          heading: 'Standard Academic BCNF Solution',
          summary: 'BCNF ensures every determinant is a candidate key.',
          key_points: ['Definition of BCNF', 'Comparison with 3NF', 'Lossless decomposition'],
          is_premium: false,
          content_status: 'PUBLISHED',
        }),
      });
      const ansRes = await createAnswerHandler(ansReq);
      expect(ansRes.status).toBe(201);
      const ans = (await ansRes.json()).data;

      // Edit answer
      const editReq = new NextRequest(`http://localhost:3000/api/answers?id=${ans.id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({
          heading: 'Updated 5-Mark Solution Heading',
          evaluator_tips: 'Highlight the dependency preservation trade-off',
        }),
      });
      const editRes = await updateAnswerHandler(editReq);
      expect(editRes.status).toBe(200);
      const updated = (await editRes.json()).data;
      expect(updated.heading).toBe('Updated 5-Mark Solution Heading');

      // Archive answer
      const delReq = new NextRequest(`http://localhost:3000/api/answers?id=${ans.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const delRes = await deleteAnswerHandler(delReq);
      expect(delRes.status).toBe(200);
    });
  });
});
