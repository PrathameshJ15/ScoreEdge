import { describe, it, expect, beforeEach } from 'vitest';
import { dbStore } from '../src/lib/db/client';
import {
  extractTextFromFile,
  chunkDocumentText,
  searchStudentDocumentChunks,
  extractPdfWithPdfplumber,
} from '../src/lib/files/processor';
import {
  GROQ_STUDY_TUTOR_SYSTEM_PROMPT,
  buildGroqStudyTutorSystemPrompt,
} from '../src/lib/ai/prompts';
import { buildGroundedPromptMessages } from '../src/lib/ai/contextBuilder';
import { executeGroundedAIQuery } from '../src/lib/ai/service';
import { POST as fileUploadHandler } from '../src/app/api/files/upload/route';
import { POST as aiQueryHandler } from '../src/app/api/ai/route';
import { NextRequest } from 'next/server';

// Helper to construct a valid 2-page PDF binary buffer
function createSampleTwoPagePdf(): Buffer {
  const pdfContent = (
    '%PDF-1.4\n' +
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n' +
    '2 0 obj\n<< /Type /Pages /Kids [3 0 R 6 0 R] /Count 2 >>\nendobj\n' +
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n' +
    '4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n' +
    '5 0 obj\n<< /Length 110 >>\nstream\n' +
    'BT\n/F1 12 Tf\n50 720 Td\n(Unit 3 Relational Database Design and Normalization 3NF BCNF) Tj\nET\n' +
    'endstream\nendobj\n' +
    '6 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 7 0 R >>\nendobj\n' +
    '7 0 obj\n<< /Length 95 >>\nstream\n' +
    'BT\n/F1 12 Tf\n50 720 Td\n(Unit 4 Transaction Management ACID Properties Concurrency Control) Tj\nET\n' +
    'endstream\nendobj\n' +
    'xref\n0 8\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000123 00000 n \n0000000232 00000 n \n0000000303 00000 n \n0000000464 00000 n \n0000000573 00000 n \n' +
    'trailer\n<< /Size 8 /Root 1 0 R >>\nstartxref\n719\n%%EOF\n'
  );
  return Buffer.from(pdfContent, 'binary');
}

describe('AI Study Tutor - PDF Processing, RAG Model & Groq LLM Tutor Suite', () => {
  beforeEach(() => {
    dbStore.reset();
  });

  describe('1. PDF Extraction Engine with pdfplumber', () => {
    it('extracts structured text with page markers from PDF using pdfplumber', async () => {
      const pdfBuffer = createSampleTwoPagePdf();
      const result = await extractTextFromFile(pdfBuffer, 'dbms_syllabus.pdf', 'application/pdf');

      expect(result.text).toBeTruthy();
      expect(result.text.length).toBeGreaterThan(30);
      expect(result.ocrApplied).toBe(false);
      expect(result.text).toContain('Normalization');
    });

    it('gracefully handles empty/scanned PDFs with OCR fallback notification', async () => {
      const emptyPdf = Buffer.from('%PDF-1.4\n%EOF', 'utf-8');
      const result = await extractTextFromFile(emptyPdf, 'scanned_drawing.pdf', 'application/pdf');

      expect(result.ocrApplied).toBe(true);
      expect(result.text).toContain('scanned_drawing.pdf');
    });
  });

  describe('2. Page-Aware Semantic Chunking & RAG Retrieval', () => {
    it('accurately attaches page numbers to study chunks', () => {
      const textWithPageMarkers = (
        '--- [Page 1] ---\n' +
        'Database Management Systems Unit 1.\n' +
        'An entity relationship model is a high level conceptual data model.\n\n' +
        '--- [Page 2] ---\n' +
        'Transactions and Concurrency Control Unit 4.\n' +
        'Two-Phase Locking guarantees conflict serializability in DBMS.\n'
      );

      const chunks = chunkDocumentText(textWithPageMarkers, 'file-page-test-1', 'usr-student-1');

      expect(chunks.length).toBeGreaterThanOrEqual(2);
      expect(chunks[0].page_number).toBe(1);
      expect(chunks[1].page_number).toBe(2);
    });

    it('performs hybrid RAG search returning stratified chunks for overview queries', () => {
      const userId = 'usr-student-1';
      const fileId = 'file-stratified-1';

      dbStore.userStudyFiles.push({
        id: fileId,
        user_id: userId,
        filename: 'full_operating_systems.pdf',
        file_type: 'pdf',
        file_size_bytes: 1024 * 50,
        mime_type: 'application/pdf',
        status: 'READY',
        chunks_count: 3,
        ocr_applied: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      dbStore.studyFileChunks.push(
        {
          id: 'chk-1',
          file_id: fileId,
          user_id: userId,
          chunk_index: 0,
          page_number: 1,
          content: 'Chapter 1: Operating System Architecture, Kernel Modes, System Calls.',
          token_count: 20,
          created_at: new Date().toISOString(),
        },
        {
          id: 'chk-2',
          file_id: fileId,
          user_id: userId,
          chunk_index: 1,
          page_number: 5,
          content: 'Chapter 3: CPU Scheduling Algorithms, Round Robin, Multi-level queues.',
          token_count: 20,
          created_at: new Date().toISOString(),
        },
        {
          id: 'chk-3',
          file_id: fileId,
          user_id: userId,
          chunk_index: 2,
          page_number: 10,
          content: 'Chapter 6: Virtual Memory, Demand Paging, FIFO and LRU replacement.',
          token_count: 20,
          created_at: new Date().toISOString(),
        }
      );

      const overviewResults = searchStudentDocumentChunks(userId, 'Please give me a complete quick review of this document', [fileId], 4);

      expect(overviewResults.length).toBeGreaterThanOrEqual(2);
      expect(overviewResults[0].chunk.content).toContain('Chapter 1');
      expect(overviewResults[0].chunk.page_number).toBe(1);
    });

    it('scores keyword-specific queries with exact matching and heading bonuses', () => {
      const userId = 'usr-student-1';
      const fileId = 'file-kw-1';

      dbStore.userStudyFiles.push({
        id: fileId,
        user_id: userId,
        filename: 'dbms_notes.pdf',
        file_type: 'pdf',
        file_size_bytes: 1024 * 10,
        mime_type: 'application/pdf',
        status: 'READY',
        chunks_count: 2,
        ocr_applied: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      dbStore.studyFileChunks.push(
        {
          id: 'chk-dsa',
          file_id: fileId,
          user_id: userId,
          chunk_index: 0,
          page_number: 1,
          content: 'Binary Search Tree traversal includes Inorder, Preorder, and Postorder.',
          token_count: 20,
          created_at: new Date().toISOString(),
        },
        {
          id: 'chk-bcnf',
          file_id: fileId,
          user_id: userId,
          chunk_index: 1,
          page_number: 4,
          headings: ['BCNF Decomposition Rules'],
          content: 'Boyce-Codd Normal Form (BCNF) strictly mandates that for every functional dependency X -> Y, X is a superkey.',
          token_count: 25,
          created_at: new Date().toISOString(),
        }
      );

      const searchResults = searchStudentDocumentChunks(userId, 'What is BCNF Decomposition?', [fileId]);

      expect(searchResults.length).toBeGreaterThanOrEqual(1);
      expect(searchResults[0].chunk.id).toBe('chk-bcnf');
      expect(searchResults[0].score).toBeGreaterThan(5);
    });
  });

  describe('3. Groq LLM System Prompt & Multi-Turn Chat Context', () => {
    it('generates high-rigor Groq Study Tutor prompt with deep PDF analysis instructions', () => {
      expect(GROQ_STUDY_TUTOR_SYSTEM_PROMPT).toContain('ScoreEdge Academic AI');
      expect(GROQ_STUDY_TUTOR_SYSTEM_PROMPT).toContain('Groq LPUs');
      expect(GROQ_STUDY_TUTOR_SYSTEM_PROMPT).toContain('QUICK REVIEW');
      expect(GROQ_STUDY_TUTOR_SYSTEM_PROMPT).toContain('IMPORTANT QUESTIONS');
      expect(GROQ_STUDY_TUTOR_SYSTEM_PROMPT).toContain('MODEL ANSWERS');
      expect(GROQ_STUDY_TUTOR_SYSTEM_PROMPT).toContain('PRACTICE QUIZ');
      expect(GROQ_STUDY_TUTOR_SYSTEM_PROMPT).toContain('ZERO HALLUCINATION');
    });

    it('customizes Groq prompt for specific university while maintaining safety guidelines', () => {
      const customPrompt = buildGroqStudyTutorSystemPrompt(
        'Mumbai University',
        '2024 CBCS',
        'Information Technology'
      );

      expect(customPrompt).toContain('Mumbai University');
      expect(customPrompt).toContain('2024 CBCS');
      expect(customPrompt).toContain('Information Technology');
      expect(customPrompt).toContain('ScoreEdge Academic AI');
      expect(customPrompt).toContain('<<<STUDENT_DOCUMENT_UNTRUSTED_CONTENT>>>');
    });

    it('injects multi-turn conversation history into Groq prompt messages for continuity', () => {
      const dummyContext = {
        query: 'What about 2NF?',
        syllabus: [],
        topics: [],
        pyqs: [],
        verified_answers: [],
        notes: [],
        question_clusters: [],
        priority_data: [],
        citations: [],
        total_sources_count: 0,
        is_empty: true,
      };

      const chatHistory = [
        { role: 'user' as const, content: 'Can you explain 1NF?' },
        { role: 'assistant' as const, content: '1NF requires all attributes to hold atomic values.' },
      ];

      const { messages } = buildGroundedPromptMessages(dummyContext as any, 'What about 2NF?', {
        sourceMode: 'BOTH',
        chatHistory,
      });

      expect(messages.length).toBe(4);
      expect(messages[1].content).toBe('Can you explain 1NF?');
      expect(messages[2].content).toContain('1NF requires');
      expect(messages[3].content).toBe('What about 2NF?');
    });
  });

  describe('4. Full End-to-End API Integration', () => {
    it('uploads PDF file, indexes chunks, and verifies status is READY', async () => {
      const pdfBuffer = createSampleTwoPagePdf();
      const payload = {
        filename: 'sppu_dbms_unit3.pdf',
        mimeType: 'application/pdf',
        contentBase64: pdfBuffer.toString('base64'),
      };

      const req = new NextRequest('http://localhost:3000/api/files/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const res = await fileUploadHandler(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.data).toBeDefined();
      expect(json.data.file.status).toBe('READY');
      expect(json.data.file.chunks_count).toBeGreaterThanOrEqual(1);
    });

    it('executes AI query with session_id, preserves chat history and answers', async () => {
      const sessId = 'sess-test-auto-persist';

      const req = new NextRequest('http://localhost:3000/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: 'Explain ACID properties in DBMS for a 5-mark question',
          session_id: sessId,
          source_mode: 'BOTH',
          task_type: 'EXAM_ANSWER',
          marks_target: 5,
        }),
      });

      const res = await aiQueryHandler(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.data).toBeDefined();
      expect(json.data.content).toBeTruthy();

      const savedMessages = dbStore.aiMessages.filter((m) => m.session_id === sessId);
      expect(savedMessages.length).toBe(2);
      expect(savedMessages[0].role).toBe('user');
      expect(savedMessages[1].role).toBe('assistant');
    });
  });
});
