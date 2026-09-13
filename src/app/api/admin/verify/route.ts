import { NextRequest } from 'next/server';
import { dbStore } from '@/lib/db/client';
import { apiSuccess, apiError } from '@/lib/api/response';
import { requireRole } from '@/lib/api/auth';
import { VerificationActionSchema } from '@/lib/api/validators';
import { VerificationRecord } from '@/lib/db/types';

export async function POST(request: NextRequest) {
  try {
    const authCheck = requireRole(request, ['ADMIN', 'REVIEWER']);
    if (!authCheck.authorized) {
      return apiError('FORBIDDEN', authCheck.errorReason || 'Admin or Reviewer access required', 403);
    }

    const json = await request.json().catch(() => null);
    const parseResult = VerificationActionSchema.safeParse(json);

    if (!parseResult.success) {
      return apiError('VALIDATION_ERROR', 'Invalid verification payload', 400, parseResult.error.format());
    }

    const { entity_type, entity_id, status, review_notes } = parseResult.data;
    let statusFrom = 'UNKNOWN';

    if (entity_type === 'QUESTION') {
      const question = dbStore.questions.find((q) => q.id === entity_id);
      if (!question) return apiError('NOT_FOUND', 'Question not found', 404);
      statusFrom = question.content_status;
      question.content_status = status;
      if (status === 'PUBLISHED' || status === 'VERIFIED') {
        question.verification_status = 'VERIFIED';
      } else if (status === 'ARCHIVED') {
        question.verification_status = 'REJECTED';
      }
    } else if (entity_type === 'ANSWER') {
      const answer = dbStore.answers.find((a) => a.id === entity_id);
      if (!answer) return apiError('NOT_FOUND', 'Answer not found', 404);
      statusFrom = answer.content_status;
      answer.content_status = status;
      answer.verified_by = authCheck.user?.id || null;
    } else if (entity_type === 'NOTE') {
      const note = dbStore.notes.find((n) => n.id === entity_id);
      if (!note) return apiError('NOT_FOUND', 'Note not found', 404);
      statusFrom = note.content_status;
      note.content_status = status;
    } else if (entity_type === 'QUIZ') {
      const quiz = dbStore.quizzes.find((qz) => qz.id === entity_id);
      if (!quiz) return apiError('NOT_FOUND', 'Quiz not found', 404);
      statusFrom = quiz.content_status;
      quiz.content_status = status;
    } else if (entity_type === 'SYLLABUS') {
      const syllabus = dbStore.syllabusItems.find((s) => s.id === entity_id);
      if (!syllabus) return apiError('NOT_FOUND', 'Syllabus item not found', 404);
      statusFrom = syllabus.content_status || 'PUBLISHED';
      syllabus.content_status = status;
    }

    const auditRecord: VerificationRecord = {
      id: `ver-${Date.now()}`,
      entity_type,
      entity_id,
      status_from: statusFrom,
      status_to: status,
      reviewer_id: authCheck.user?.id || 'admin',
      review_notes: review_notes || null,
      created_at: new Date().toISOString(),
    };

    dbStore.verificationRecords.push(auditRecord);

    return apiSuccess({
      message: `${entity_type} status successfully changed to ${status}`,
      record: auditRecord,
    });
  } catch (err: unknown) {
    return apiError('INTERNAL_ERROR', 'Failed to process verification action', 500, err instanceof Error ? err.message : undefined);
  }
}
