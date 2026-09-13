import { describe, it, expect, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { dbStore } from '../src/lib/db/client';
import { POST as fileUploadHandler } from '../src/app/api/files/upload/route';
import { GET as getSessionsHandler, POST as createSessionHandler } from '../src/app/api/ai/sessions/route';
import {
  GET as getSessionDetailHandler,
  DELETE as deleteSessionHandler,
  PATCH as patchSessionHandler,
} from '../src/app/api/ai/sessions/[id]/route';
import { GET as getSessionMessagesHandler } from '../src/app/api/ai/sessions/[id]/messages/route';
import { POST as aiQueryHandler } from '../src/app/api/ai/route';

describe('AI Study Tutor Hub & Dedicated GPT Interaction Flow', () => {
  beforeEach(() => {
    dbStore.reset();
  });

  describe('1. File Upload & Semantic Text Extraction for Study Tutor', () => {
    it('uploads a syllabus document and extracts semantic chunks', async () => {
      const sampleNotes = `
# Unit 2: Relational Database Design
Relational database design models data into relations.
Key normal forms:
- 1NF: Atomic attribute values.
- 2NF: No partial dependency on candidate keys.
- 3NF: No transitive dependency on superkeys.
- BCNF: For every FD X -> Y, X must be a superkey.
Lossless decomposition is always guaranteed in BCNF, but dependency preservation is only guaranteed in 3NF.
      `.trim();

      const req = new NextRequest('http://localhost:3000/api/files/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: 'DBMS_Unit2_Notes.txt',
          mimeType: 'text/plain',
          textContent: sampleNotes,
        }),
      });

      const res = await fileUploadHandler(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.data.file).toBeDefined();
      expect(json.data.file.status).toBe('READY');
      expect(json.data.file.filename).toBe('DBMS_Unit2_Notes.txt');
      expect(json.data.file.chunks_count).toBeGreaterThan(0);
    });

    it('rejects unsupported file formats gracefully', async () => {
      const req = new NextRequest('http://localhost:3000/api/files/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: 'virus.exe',
          mimeType: 'application/octet-stream',
          textContent: 'binary',
        }),
      });

      const res = await fileUploadHandler(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error.code).toBe('FILE_VALIDATION_ERROR');
    });
  });

  describe('2. Chat Session Creation & Persistence', () => {
    it('creates a new session with associated study file and title', async () => {
      const req = new NextRequest('http://localhost:3000/api/ai/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Quick Review: DBMS_Unit2_Notes.pdf',
          file_id: 'file-123',
          file_name: 'DBMS_Unit2_Notes.pdf',
          subject_id: 'sub-dbms',
          source_mode: 'BOTH',
        }),
      });

      const res = await createSessionHandler(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.data.session.id).toBeDefined();
      expect(json.data.session.title).toBe('Quick Review: DBMS_Unit2_Notes.pdf');
      expect(json.data.session.file_name).toBe('DBMS_Unit2_Notes.pdf');
    });

    it('lists all historical sessions with message count and relative metadata', async () => {
      const req = new NextRequest('http://localhost:3000/api/ai/sessions', {
        method: 'GET',
      });

      const res = await getSessionsHandler(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.data.sessions).toBeDefined();
      expect(json.data.sessions.length).toBeGreaterThanOrEqual(3);

      const firstSess = json.data.sessions[0];
      expect(firstSess).toHaveProperty('title');
      expect(firstSess).toHaveProperty('file_name');
      expect(firstSess).toHaveProperty('message_count');
    });
  });

  describe('3. Multi-Turn Conversation & Session Restoration', () => {
    it('records user query and assistant response under session_id automatically', async () => {
      const sessionId = 'test-sess-restore-1';

      // 1. Ask initial question with session_id
      const queryReq = new NextRequest('http://localhost:3000/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: 'Explain Boyce-Codd Normal Form with decomposition conditions',
          subject_id: 'sub-dbms',
          task_type: 'EXPLAIN',
          session_id: sessionId,
          source_mode: 'SCOREDGE',
        }),
      });

      const queryRes = await aiQueryHandler(queryReq);
      expect(queryRes.status).toBe(200);

      // 2. Restore session details and messages
      const restoreReq = new NextRequest(`http://localhost:3000/api/ai/sessions/${sessionId}`, {
        method: 'GET',
      });

      const restoreRes = await getSessionDetailHandler(restoreReq, {
        params: { id: sessionId },
      });
      expect(restoreRes.status).toBe(200);

      const restoreJson = await restoreRes.json();
      expect(restoreJson.data.session.id).toBe(sessionId);
      expect(restoreJson.data.messages.length).toBe(2);

      expect(restoreJson.data.messages[0].role).toBe('user');
      expect(restoreJson.data.messages[0].content).toContain('Boyce-Codd Normal Form');
      expect(restoreJson.data.messages[1].role).toBe('assistant');
      expect(restoreJson.data.messages[1].content).toBeDefined();

      // 3. Continue talking in the restored session (follow-up message)
      const followUpReq = new NextRequest('http://localhost:3000/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: 'Does BCNF always preserve functional dependencies?',
          subject_id: 'sub-dbms',
          task_type: 'EXPLAIN',
          session_id: sessionId,
          source_mode: 'SCOREDGE',
        }),
      });

      const followUpRes = await aiQueryHandler(followUpReq);
      expect(followUpRes.status).toBe(200);

      // Verify restored message count increased to 4 (2 turns)
      const messagesReq = new NextRequest(`http://localhost:3000/api/ai/sessions/${sessionId}/messages`, {
        method: 'GET',
      });
      const messagesRes = await getSessionMessagesHandler(messagesReq, {
        params: { id: sessionId },
      });
      const messagesJson = await messagesRes.json();
      expect(messagesJson.data.messages.length).toBe(4);
    });

    it('updates session title and allows clean deletion', async () => {
      const sessionId = 'test-sess-to-delete';
      dbStore.aiSessions.push({
        id: sessionId,
        user_id: 'usr-student-1',
        title: 'Draft Session',
        source_mode: 'BOTH',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      dbStore.aiMessages.push({
        id: 'msg-temp',
        session_id: sessionId,
        user_id: 'usr-student-1',
        role: 'user',
        content: 'Hello AI',
        source_mode: 'BOTH',
        created_at: new Date().toISOString(),
      });

      // Patch Title
      const patchReq = new NextRequest(`http://localhost:3000/api/ai/sessions/${sessionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Updated Exam Notes Discussion' }),
      });
      const patchRes = await patchSessionHandler(patchReq, { params: { id: sessionId } });
      expect(patchRes.status).toBe(200);

      const patchJson = await patchRes.json();
      expect(patchJson.data.session.title).toBe('Updated Exam Notes Discussion');

      // Delete Session
      const delReq = new NextRequest(`http://localhost:3000/api/ai/sessions/${sessionId}`, {
        method: 'DELETE',
      });
      const delRes = await deleteSessionHandler(delReq, { params: { id: sessionId } });
      expect(delRes.status).toBe(200);

      // Verify purged
      expect(dbStore.aiSessions.some((s) => s.id === sessionId)).toBe(false);
      expect(dbStore.aiMessages.some((m) => m.session_id === sessionId)).toBe(false);
    });
  });

  describe('4. Quick Actions with File Grounding', () => {
    it('executes quick review and model answers with file context', async () => {
      const req = new NextRequest('http://localhost:3000/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: 'Give me a quick review of Normalization',
          subject_id: 'sub-dbms',
          task_type: 'EXAM_ANSWER',
          marks_target: 5,
          quick_action: 'SUMMARIZE',
          source_mode: 'SCOREDGE',
        }),
      });

      const res = await aiQueryHandler(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data.content).toBeDefined();
      expect(json.data.is_grounded).toBe(true);
    });
  });
});
