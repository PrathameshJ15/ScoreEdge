import { NextRequest } from 'next/server';
import { dbStore, paginateArray } from '@/lib/db/client';
import { apiSuccess, apiError } from '@/lib/api/response';
import { PaginationQuerySchema, QuestionOccurrenceCreateSchema } from '@/lib/api/validators';
import { requireRole } from '@/lib/api/auth';
import { QuestionOccurrence } from '@/lib/db/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const questionId = searchParams.get('question_id');
    const subjectId = searchParams.get('subject_id');
    const year = searchParams.get('year') ? Number(searchParams.get('year')) : null;
    const session = searchParams.get('exam_session');

    let occurrences = [...dbStore.questionOccurrences];

    if (questionId) {
      occurrences = occurrences.filter((o) => o.question_id === questionId);
    }
    if (subjectId) {
      occurrences = occurrences.filter((o) => o.subject_id === subjectId);
    }
    if (year) {
      occurrences = occurrences.filter((o) => o.year === year);
    }
    if (session) {
      occurrences = occurrences.filter((o) => o.exam_session === session);
    }

    const pagination = PaginationQuerySchema.parse({
      page: searchParams.get('page') || 1,
      limit: searchParams.get('limit') || 20,
    });

    const result = paginateArray(occurrences, pagination.page, pagination.limit);
    return apiSuccess(result.data, result.pagination);
  } catch (err: unknown) {
    return apiError('INTERNAL_ERROR', 'Failed to retrieve occurrences', 500, err instanceof Error ? err.message : undefined);
  }
}

export async function POST(request: NextRequest) {
  try {
    const authCheck = requireRole(request, ['ADMIN', 'REVIEWER']);
    if (!authCheck.authorized) {
      return apiError('FORBIDDEN', authCheck.errorReason || 'Admin or Reviewer access required', 403);
    }

    const json = await request.json().catch(() => null);
    const parseResult = QuestionOccurrenceCreateSchema.safeParse(json);
    if (!parseResult.success) {
      return apiError('VALIDATION_ERROR', 'Invalid occurrence payload', 400, parseResult.error.format());
    }

    const payload = parseResult.data;

    const question = dbStore.questions.find((q) => q.id === payload.question_id);
    if (!question) {
      return apiError('NOT_FOUND', 'Question not found for occurrence', 404);
    }

    const newOccurrence: QuestionOccurrence = {
      id: `occ-${Date.now()}`,
      question_id: payload.question_id,
      year: payload.year,
      exam_session: payload.exam_session,
      question_number: payload.question_number,
      marks: payload.marks,
      pattern_id: payload.pattern_id,
      branch_id: payload.branch_id,
      semester_id: payload.semester_id,
      subject_id: payload.subject_id,
      source_id: payload.source_id || null,
      verification_status: payload.verification_status,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    dbStore.questionOccurrences.push(newOccurrence);

    if (!question.is_pyq) {
      question.is_pyq = true;
      question.updated_at = new Date().toISOString();
    }

    return apiSuccess(newOccurrence, undefined, 201);
  } catch (err: unknown) {
    return apiError('INTERNAL_ERROR', 'Failed to create occurrence', 500, err instanceof Error ? err.message : undefined);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authCheck = requireRole(request, ['ADMIN', 'REVIEWER']);
    if (!authCheck.authorized) {
      return apiError('FORBIDDEN', authCheck.errorReason || 'Admin or Reviewer access required', 403);
    }

    const json = await request.json().catch(() => null);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id') || json?.id;

    if (!id) {
      return apiError('VALIDATION_ERROR', 'Occurrence ID is required', 400);
    }

    const occurrence = dbStore.questionOccurrences.find((o) => o.id === id);
    if (!occurrence) {
      return apiError('NOT_FOUND', 'Occurrence not found', 404);
    }

    const parseResult = QuestionOccurrenceCreateSchema.partial().safeParse(json);
    if (!parseResult.success) {
      return apiError('VALIDATION_ERROR', 'Invalid update parameters', 400, parseResult.error.format());
    }

    Object.assign(occurrence, parseResult.data, { updated_at: new Date().toISOString() });
    return apiSuccess(occurrence);
  } catch (err: unknown) {
    return apiError('INTERNAL_ERROR', 'Failed to update occurrence', 500, err instanceof Error ? err.message : undefined);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authCheck = requireRole(request, ['ADMIN']);
    if (!authCheck.authorized) {
      return apiError('FORBIDDEN', authCheck.errorReason || 'Admin access required', 403);
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return apiError('VALIDATION_ERROR', 'Occurrence ID is required', 400);
    }

    const index = dbStore.questionOccurrences.findIndex((o) => o.id === id);
    if (index === -1) {
      return apiError('NOT_FOUND', 'Occurrence not found', 404);
    }

    dbStore.questionOccurrences.splice(index, 1);
    return apiSuccess({ message: 'Occurrence deleted successfully' });
  } catch (err: unknown) {
    return apiError('INTERNAL_ERROR', 'Failed to delete occurrence', 500, err instanceof Error ? err.message : undefined);
  }
}
