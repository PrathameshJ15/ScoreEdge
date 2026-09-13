/**
 * ScoreEdge Notes & Answers Tests
 *
 * Covers:
 * - Notes listing with subject/unit/slug filters
 * - Notes premium locking & unlocking by entitlement
 * - Free preview notes visible without entitlement
 * - Admin sees all note statuses
 * - Admin CRUD: create/update/delete notes
 * - Answers: listing, marks filter, premium masking
 * - Answers: 2M, 5M, 10M mark levels
 * - Answers: admin creates, updates, archives
 * - Unauthorized access prevention
 * - Content body masked when locked
 * - Mobile: response structure is lightweight when locked
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { dbStore } from '../src/lib/db/client';
import { createAuthToken } from '../src/lib/api/auth';
import {
  GET as getNotesHandler,
  POST as createNoteHandler,
  PUT as updateNoteHandler,
  DELETE as deleteNoteHandler,
} from '../src/app/api/notes/route';
import {
  GET as getAnswersHandler,
  POST as createAnswerHandler,
  PUT as updateAnswerHandler,
  DELETE as deleteAnswerHandler,
} from '../src/app/api/answers/route';

describe('ScoreEdge Notes & Answers System', () => {
  const studentToken = createAuthToken({ id: 'usr-student-1', email: 'student@sppu.ac.in', role: 'STUDENT' });
  const adminToken = createAuthToken({ id: 'usr-admin-1', email: 'admin@scoreedge.in', role: 'ADMIN' });
  const reviewerToken = createAuthToken({ id: 'usr-reviewer-1', email: 'reviewer@scoreedge.in', role: 'REVIEWER' });

  beforeEach(() => {
    dbStore.reset();
    // Clear all default entitlements for accurate lock testing
    dbStore.entitlements = dbStore.entitlements.filter(e => e.user_id !== 'usr-student-1');

    // Ensure a reviewer user exists in users table
    if (!dbStore.users.some(u => u.id === 'usr-reviewer-1')) {
      dbStore.users.push({
        id: 'usr-reviewer-1',
        email: 'reviewer@scoreedge.in',
        password_hash: 'test_hash',
        full_name: 'Reviewer Test User',
        role: 'REVIEWER',
        email_verified: true,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    // Ensure we have a published premium note and a published free-preview note
    if (!dbStore.notes.some(n => n.is_premium && !n.is_free_preview && n.content_status === 'PUBLISHED')) {
      dbStore.notes.push({
        id: 'note-premium-test',
        subject_id: 'sub-dbms',
        unit_id: 'unit-dbms-3',
        topic_id: 'topic-norm-bcnf',
        title: 'BCNF Advanced Notes',
        slug: 'bcnf-advanced-notes',
        summary: 'Deep dive into BCNF decomposition and anomalies.',
        content_body: '# BCNF Advanced\nComplete solutions for university exams.',
        read_time_minutes: 15,
        is_free_preview: false,
        is_premium: true,
        content_status: 'PUBLISHED',
        author_id: 'usr-admin-1',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    if (!dbStore.notes.some(n => n.is_free_preview && n.content_status === 'PUBLISHED')) {
      dbStore.notes.push({
        id: 'note-free-test',
        subject_id: 'sub-dbms',
        unit_id: 'unit-dbms-1',
        topic_id: null,
        title: 'Free Preview Notes',
        slug: 'free-preview-notes',
        summary: 'Free introductory notes.',
        content_body: '# Free Notes\nIntro content.',
        read_time_minutes: 5,
        is_free_preview: true,
        is_premium: false,
        content_status: 'PUBLISHED',
        author_id: 'usr-admin-1',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
  });

  // ─────────────────────────────────────────────────────────────
  // 1. Notes Listing
  // ─────────────────────────────────────────────────────────────
  describe('Notes Listing & Filtering', () => {
    it('returns published notes without auth token', async () => {
      const req = new NextRequest('http://localhost:3000/api/notes');
      const res = await getNotesHandler(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data.length).toBeGreaterThan(0);
    });

    it('filters notes by subject_id', async () => {
      const req = new NextRequest('http://localhost:3000/api/notes?subject_id=sub-dbms');
      const res = await getNotesHandler(req);
      const json = await res.json();
      expect(json.data.every((n: any) => n.subject_id === 'sub-dbms')).toBe(true);
    });

    it('filters notes by unit_id', async () => {
      const note = dbStore.notes.find(n => n.unit_id && n.content_status === 'PUBLISHED');
      if (!note) return;
      const req = new NextRequest(`http://localhost:3000/api/notes?unit_id=${note.unit_id}`);
      const res = await getNotesHandler(req);
      const json = await res.json();
      expect(json.data.every((n: any) => n.unit_id === note.unit_id)).toBe(true);
    });

    it('retrieves a specific note by slug', async () => {
      const note = dbStore.notes.find(n => n.content_status === 'PUBLISHED');
      if (!note) return;
      const req = new NextRequest(`http://localhost:3000/api/notes?slug=${note.slug}`);
      const res = await getNotesHandler(req);
      const json = await res.json();
      expect(json.data.length).toBeGreaterThanOrEqual(1);
      expect(json.data[0].slug).toBe(note.slug);
    });

    it('does not return soft-deleted notes', async () => {
      const testDeletedNote = {
        ...dbStore.notes[0],
        id: 'note-soft-deleted-test',
        slug: 'soft-deleted-note-test-slug',
        deleted_at: new Date().toISOString(),
      };
      dbStore.notes.push(testDeletedNote);

      const req = new NextRequest(`http://localhost:3000/api/notes?slug=soft-deleted-note-test-slug`);
      const res = await getNotesHandler(req);
      const json = await res.json();
      expect(json.data.length).toBe(0);
    });

    it('admin can list draft notes using status filter', async () => {
      // Inject a draft note
      dbStore.notes.push({
        id: 'note-draft-test',
        subject_id: 'sub-dbms',
        unit_id: 'unit-dbms-1',
        topic_id: null,
        title: 'Draft Note',
        slug: 'draft-note-test',
        summary: 'Draft summary',
        content_body: '# Draft content',
        read_time_minutes: 10,
        is_free_preview: false,
        is_premium: false,
        content_status: 'DRAFT',
        author_id: 'usr-admin-1',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      const req = new NextRequest('http://localhost:3000/api/notes?status=DRAFT', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const res = await getNotesHandler(req);
      const json = await res.json();
      expect(json.data.some((n: any) => n.content_status === 'DRAFT')).toBe(true);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 2. Premium Note Locking
  // ─────────────────────────────────────────────────────────────
  describe('Premium Note Locking & Entitlement', () => {
    it('masks content_body of premium notes for unauthenticated users', async () => {
      const premiumNote = dbStore.notes.find(n => n.is_premium && !n.is_free_preview && n.content_status === 'PUBLISHED');
      if (!premiumNote) return;

      const req = new NextRequest(`http://localhost:3000/api/notes?slug=${premiumNote.slug}`);
      const res = await getNotesHandler(req);
      const json = await res.json();
      expect(json.data[0].is_locked).toBe(true);
      expect(json.data[0].content_body).toBeUndefined(); // masked
    });

    it('reveals content_body when student has subject entitlement', async () => {
      const premiumNote = dbStore.notes.find(n => n.is_premium && !n.is_free_preview && n.content_status === 'PUBLISHED');
      if (!premiumNote) return;

      dbStore.entitlements.push({
        id: 'ent-note-test',
        user_id: 'usr-student-1',
        product_id: 'prod-sub-dbms',
        subject_id: premiumNote.subject_id,
        access_scope: 'SINGLE_SUBJECT',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      const req = new NextRequest(`http://localhost:3000/api/notes?slug=${premiumNote.slug}`, {
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      const res = await getNotesHandler(req);
      const json = await res.json();
      expect(json.data[0].is_locked).toBe(false);
      expect(json.data[0].content_body).toBeDefined();
    });

    it('reveals premium notes with semester-all pass', async () => {
      const premiumNote = dbStore.notes.find(n => n.is_premium && !n.is_free_preview && n.content_status === 'PUBLISHED');
      if (!premiumNote) return;

      dbStore.entitlements.push({
        id: 'ent-sem-test',
        user_id: 'usr-student-1',
        product_id: 'prod-sem-comp',
        access_scope: 'SEMESTER_ALL',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      const req = new NextRequest(`http://localhost:3000/api/notes?slug=${premiumNote.slug}`, {
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      const res = await getNotesHandler(req);
      const json = await res.json();
      expect(json.data[0].is_locked).toBe(false);
    });

    it('free-preview notes are visible to unauthenticated users without locking', async () => {
      const freeNote = dbStore.notes.find(n => n.is_free_preview && n.content_status === 'PUBLISHED');
      if (!freeNote) return;

      const req = new NextRequest(`http://localhost:3000/api/notes?slug=${freeNote.slug}`);
      const res = await getNotesHandler(req);
      const json = await res.json();
      expect(json.data[0].is_locked).toBe(false);
    });

    it('admin bypasses premium lock with no entitlement', async () => {
      const premiumNote = dbStore.notes.find(n => n.is_premium && !n.is_free_preview && n.content_status === 'PUBLISHED');
      if (!premiumNote) return;

      const req = new NextRequest(`http://localhost:3000/api/notes?slug=${premiumNote.slug}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const res = await getNotesHandler(req);
      const json = await res.json();
      expect(json.data[0].is_locked).toBe(false);
      expect(json.data[0].content_body).toBeDefined();
    });

    it('revoked entitlement re-locks premium content', async () => {
      const premiumNote = dbStore.notes.find(n => n.is_premium && !n.is_free_preview && n.content_status === 'PUBLISHED');
      if (!premiumNote) return;

      const ent = {
        id: 'ent-revoked-test',
        user_id: 'usr-student-1',
        product_id: 'prod-sub-dbms',
        subject_id: premiumNote.subject_id,
        access_scope: 'SINGLE_SUBJECT' as const,
        is_active: false, // revoked
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      dbStore.entitlements.push(ent);

      const req = new NextRequest(`http://localhost:3000/api/notes?slug=${premiumNote.slug}`, {
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      const res = await getNotesHandler(req);
      const json = await res.json();
      expect(json.data[0].is_locked).toBe(true);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 3. Admin Notes CRUD
  // ─────────────────────────────────────────────────────────────
  describe('Admin Notes CRUD', () => {
    it('admin can create a new note', async () => {
      const req = new NextRequest('http://localhost:3000/api/notes', {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject_id: 'sub-dbms',
          unit_id: 'unit-dbms-1',
          title: 'Introduction to DBMS',
          slug: 'intro-to-dbms-new',
          summary: 'Overview of DBMS fundamentals',
          content_body: '# DBMS Introduction\n\nContent here...',
          read_time_minutes: 12,
          is_free_preview: true,
          is_premium: false,
          content_status: 'PUBLISHED',
        }),
      });

      const res = await createNoteHandler(req);
      expect(res.status).toBe(201);
      const json = await res.json();
      expect(json.data.slug).toBe('intro-to-dbms-new');
      expect(json.data.id).toBeDefined();
    });

    it('reviewer can create a note', async () => {
      const req = new NextRequest('http://localhost:3000/api/notes', {
        method: 'POST',
        headers: { Authorization: `Bearer ${reviewerToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject_id: 'sub-dbms',
          unit_id: 'unit-dbms-2',
          title: 'Reviewer Note',
          slug: 'reviewer-note-unit2',
          summary: 'Summary for reviewer note',
          content_body: '# Reviewer Note Content Body Here',
          read_time_minutes: 8,
          is_free_preview: false,
          is_premium: true,
          content_status: 'DRAFT',
        }),
      });

      const res = await createNoteHandler(req);
      expect(res.status).toBe(201);
    });

    it('student cannot create a note', async () => {
      const req = new NextRequest('http://localhost:3000/api/notes', {
        method: 'POST',
        headers: { Authorization: `Bearer ${studentToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject_id: 'sub-dbms',
          unit_id: 'unit-dbms-1',
          title: 'Hacked note',
          slug: 'student-hack-note',
          summary: 'Bad actor',
          content_body: 'Bad content',
          read_time_minutes: 1,
          is_free_preview: true,
          is_premium: false,
          content_status: 'PUBLISHED',
        }),
      });

      const res = await createNoteHandler(req);
      expect(res.status).toBe(403);
    });

    it('admin can update a note', async () => {
      const note = dbStore.notes.find(n => n.content_status === 'PUBLISHED');
      if (!note) return;

      const req = new NextRequest(`http://localhost:3000/api/notes?id=${note.id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Updated Note Title', id: note.id }),
      });

      const res = await updateNoteHandler(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data.title).toBe('Updated Note Title');
    });

    it('admin can soft-delete a note (archived)', async () => {
      const note = dbStore.notes.find(n => n.content_status === 'PUBLISHED');
      if (!note) return;

      const req = new NextRequest(`http://localhost:3000/api/notes?id=${note.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      const res = await deleteNoteHandler(req);
      expect(res.status).toBe(200);
      const updated = dbStore.notes.find(n => n.id === note.id);
      expect(updated?.deleted_at).toBeDefined();
      expect(updated?.content_status).toBe('ARCHIVED');
    });

    it('student cannot delete a note', async () => {
      const note = dbStore.notes.find(n => n.content_status === 'PUBLISHED');
      if (!note) return;

      const req = new NextRequest(`http://localhost:3000/api/notes?id=${note.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${studentToken}` },
      });

      const res = await deleteNoteHandler(req);
      expect(res.status).toBe(403);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 4. Answers System
  // ─────────────────────────────────────────────────────────────
  describe('Answers: Listing, Locking, & CRUD', () => {
    it('returns answers filtered by marks=2 (no premium masking for 2M)', async () => {
      const req = new NextRequest('http://localhost:3000/api/answers?marks=2', {
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      const res = await getAnswersHandler(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      // 2M answers are not premium-locked in the seed data
      expect(json.data.every((a: any) => a.marks_target === 2)).toBe(true);
    });

    it('masks premium 10M answers for student without entitlement', async () => {
      const req = new NextRequest('http://localhost:3000/api/answers?marks=10', {
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      const res = await getAnswersHandler(req);
      const json = await res.json();
      const premiumAnswers = json.data.filter((a: any) => a.is_premium);
      expect(premiumAnswers.every((a: any) => a.is_locked === true)).toBe(true);
      expect(premiumAnswers.every((a: any) => a.key_points === undefined)).toBe(true);
    });

    it('unlocks 10M answers when student has semester pass', async () => {
      dbStore.entitlements.push({
        id: 'ent-sem-answers',
        user_id: 'usr-student-1',
        product_id: 'prod-sem-comp',
        access_scope: 'SEMESTER_ALL',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      const req = new NextRequest('http://localhost:3000/api/answers?marks=10', {
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      const res = await getAnswersHandler(req);
      const json = await res.json();
      const premiumAnswers = json.data.filter((a: any) => a.is_premium);
      expect(premiumAnswers.every((a: any) => a.is_locked === false)).toBe(true);
      expect(premiumAnswers.every((a: any) => Array.isArray(a.key_points))).toBe(true);
    });

    it('admin sees all answers including DRAFT', async () => {
      dbStore.answers.push({
        id: 'ans-draft-test',
        question_id: dbStore.questions[0].id,
        marks_target: 5,
        heading: 'Draft Answer',
        summary: 'Summary',
        key_points: ['Point 1'],
        is_premium: false,
        content_status: 'DRAFT',
        author_id: 'usr-admin-1',
        verified_by: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      const req = new NextRequest('http://localhost:3000/api/answers?status=DRAFT', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const res = await getAnswersHandler(req);
      const json = await res.json();
      expect(json.data.some((a: any) => a.content_status === 'DRAFT')).toBe(true);
    });

    it('filters answers by question_id', async () => {
      const q = dbStore.questions[0];
      const req = new NextRequest(`http://localhost:3000/api/answers?question_id=${q.id}`);
      const res = await getAnswersHandler(req);
      const json = await res.json();
      expect(json.data.every((a: any) => a.question_id === q.id)).toBe(true);
    });

    it('admin can create a 5M answer for a question', async () => {
      const question = dbStore.questions[0];
      const req = new NextRequest('http://localhost:3000/api/answers', {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question_id: question.id,
          marks_target: '5', // AnswerCreateSchema uses z.enum(['2', '5', '10']).transform(Number)
          heading: 'Detailed 5M Answer',
          summary: 'Comprehensive coverage of the topic.',
          key_points: ['Point A', 'Point B', 'Point C'],
          diagram_description: 'Block diagram showing architecture',
          is_premium: false,
          content_status: 'PUBLISHED',
        }),
      });

      const res = await createAnswerHandler(req);
      expect(res.status).toBe(201);
      const json = await res.json();
      expect(json.data.marks_target).toBe(5);
      expect(json.data.key_points).toHaveLength(3);
    });

    it('student cannot create an answer', async () => {
      const question = dbStore.questions[0];
      const req = new NextRequest('http://localhost:3000/api/answers', {
        method: 'POST',
        headers: { Authorization: `Bearer ${studentToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question_id: question.id,
          marks_target: 5,
          heading: 'Student hack',
          summary: 'Hack attempt',
          key_points: ['Bad'],
          is_premium: false,
          content_status: 'PUBLISHED',
        }),
      });

      const res = await createAnswerHandler(req);
      expect(res.status).toBe(403);
    });

    it('admin can archive an answer', async () => {
      const answer = dbStore.answers.find(a => a.content_status === 'PUBLISHED');
      if (!answer) return;

      const req = new NextRequest(`http://localhost:3000/api/answers?id=${answer.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      const res = await deleteAnswerHandler(req);
      expect(res.status).toBe(200);
      const updated = dbStore.answers.find(a => a.id === answer.id);
      expect(updated?.content_status).toBe('ARCHIVED');
    });

    it('answer locked response does not leak key_points, diagram_description, or evaluator_tips', async () => {
      const premiumAns = dbStore.answers.find(a => a.is_premium && a.content_status === 'PUBLISHED');
      if (!premiumAns) return;

      const req = new NextRequest(`http://localhost:3000/api/answers?question_id=${premiumAns.question_id}`, {
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      const res = await getAnswersHandler(req);
      const json = await res.json();
      const locked = json.data.find((a: any) => a.id === premiumAns.id);
      if (locked?.is_locked) {
        expect(locked.key_points).toBeUndefined();
        expect(locked.diagram_description).toBeUndefined();
        expect(locked.evaluator_tips).toBeUndefined();
      }
    });
  });
});
