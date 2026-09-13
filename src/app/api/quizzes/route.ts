import { NextRequest } from 'next/server';
import { dbStore, paginateArray } from '@/lib/db/client';
import { apiSuccess, apiError } from '@/lib/api/response';
import { PaginationQuerySchema, QuizCreateSchema } from '@/lib/api/validators';
import { requireRole, getAuthUser } from '@/lib/api/auth';
import { Quiz } from '@/lib/db/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get('subject_id');
    const unitId = searchParams.get('unit_id');
    const status = searchParams.get('status');

    const currentUser = getAuthUser(request);
    const isAdminOrReviewer = currentUser && (currentUser.role === 'ADMIN' || currentUser.role === 'REVIEWER');

    let quizzes = dbStore.quizzes;
    if (!isAdminOrReviewer) {
      quizzes = quizzes.filter((q) => q.content_status === 'PUBLISHED');
    } else if (status) {
      quizzes = quizzes.filter((q) => q.content_status === status);
    }

    if (subjectId) {
      quizzes = quizzes.filter((q) => q.subject_id === subjectId);
    }
    if (unitId) {
      quizzes = quizzes.filter((q) => q.unit_id === unitId);
    }

    const pagination = PaginationQuerySchema.parse({
      page: searchParams.get('page') || 1,
      limit: searchParams.get('limit') || 20,
    });

    const result = paginateArray(quizzes, pagination.page, pagination.limit);
    return apiSuccess(result.data, result.pagination);
  } catch (err: unknown) {
    return apiError('INTERNAL_ERROR', 'Failed to retrieve quizzes', 500, err instanceof Error ? err.message : undefined);
  }
}

export async function POST(request: NextRequest) {
  try {
    const authCheck = requireRole(request, ['ADMIN', 'REVIEWER']);
    if (!authCheck.authorized) {
      return apiError('FORBIDDEN', authCheck.errorReason || 'Admin access required', 403);
    }

    const json = await request.json().catch(() => null);
    const parseResult = QuizCreateSchema.safeParse(json);

    if (!parseResult.success) {
      return apiError('VALIDATION_ERROR', 'Invalid quiz payload', 400, parseResult.error.format());
    }

    const payload = parseResult.data;
    const newQuiz: Quiz = {
      id: `quiz-${Date.now()}`,
      subject_id: payload.subject_id,
      unit_id: payload.unit_id || null,
      title: payload.title,
      description: payload.description,
      duration_minutes: payload.duration_minutes,
      total_questions: payload.total_questions,
      passing_score: payload.passing_score,
      difficulty: payload.difficulty,
      is_premium: payload.is_premium,
      content_status: (json?.content_status as any) || 'PUBLISHED',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    dbStore.quizzes.push(newQuiz);
    return apiSuccess(newQuiz, undefined, 201);
  } catch (err: unknown) {
    return apiError('INTERNAL_ERROR', 'Failed to create quiz', 500, err instanceof Error ? err.message : undefined);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authCheck = requireRole(request, ['ADMIN', 'REVIEWER']);
    if (!authCheck.authorized) {
      return apiError('FORBIDDEN', authCheck.errorReason || 'Admin access required', 403);
    }

    const json = await request.json().catch(() => null);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id') || json?.id;

    if (!id) {
      return apiError('VALIDATION_ERROR', 'Quiz ID is required', 400);
    }

    const quiz = dbStore.quizzes.find((q) => q.id === id);
    if (!quiz) {
      return apiError('NOT_FOUND', 'Quiz not found', 404);
    }

    const parseResult = QuizCreateSchema.partial().safeParse(json);
    if (!parseResult.success) {
      return apiError('VALIDATION_ERROR', 'Invalid update parameters', 400, parseResult.error.format());
    }

    Object.assign(quiz, parseResult.data, {
      content_status: json?.content_status || quiz.content_status,
      updated_at: new Date().toISOString(),
    });
    return apiSuccess(quiz);
  } catch (err: unknown) {
    return apiError('INTERNAL_ERROR', 'Failed to update quiz', 500, err instanceof Error ? err.message : undefined);
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
      return apiError('VALIDATION_ERROR', 'Quiz ID is required', 400);
    }

    const quiz = dbStore.quizzes.find((q) => q.id === id);
    if (!quiz) {
      return apiError('NOT_FOUND', 'Quiz not found', 404);
    }

    quiz.content_status = 'ARCHIVED';
    quiz.updated_at = new Date().toISOString();
    return apiSuccess({ message: 'Quiz archived successfully' });
  } catch (err: unknown) {
    return apiError('INTERNAL_ERROR', 'Failed to delete quiz', 500, err instanceof Error ? err.message : undefined);
  }
}
