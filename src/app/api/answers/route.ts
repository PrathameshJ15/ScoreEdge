import { NextRequest } from 'next/server';
import { dbStore, paginateArray } from '@/lib/db/client';
import { apiSuccess, apiError } from '@/lib/api/response';
import { PaginationQuerySchema, AnswerCreateSchema } from '@/lib/api/validators';
import { getAuthUser, requireRole } from '@/lib/api/auth';
import { checkUserEntitlement } from '@/lib/payments/entitlements';
import { Answer } from '@/lib/db/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const questionId = searchParams.get('question_id');
    const marks = searchParams.get('marks') ? Number(searchParams.get('marks')) : null;

    const currentUser = getAuthUser(request);
    const isAdminOrReviewer = currentUser && (currentUser.role === 'ADMIN' || currentUser.role === 'REVIEWER');
    const status = searchParams.get('status');

    let answers = dbStore.answers;
    if (!isAdminOrReviewer) {
      answers = answers.filter((a) => a.content_status === 'PUBLISHED');
    } else if (status) {
      answers = answers.filter((a) => a.content_status === status);
    }

    if (questionId) {
      answers = answers.filter((a) => a.question_id === questionId);
    }
    if (marks) {
      answers = answers.filter((a) => a.marks_target === marks);
    }

    // Mask premium content if not entitled
    const maskedAnswers = answers.map((ans) => {
      const question = dbStore.questions.find((q) => q.id === ans.question_id);
      const entitlementCheck = checkUserEntitlement(currentUser, question?.subject_id);
      const isUnlocked = isAdminOrReviewer || entitlementCheck.hasAccess;

      if (ans.is_premium && !isUnlocked) {
        return {
          id: ans.id,
          question_id: ans.question_id,
          marks_target: ans.marks_target,
          heading: ans.heading,
          summary: ans.summary,
          is_premium: true,
          is_locked: true,
          message: 'Upgrade to Single Subject Pass (₹49) or Semester Pass (₹199) to unlock full 10-mark answers and diagrams.',
        };
      }
      return {
        ...ans,
        is_locked: false,
      };
    });

    const pagination = PaginationQuerySchema.parse({
      page: searchParams.get('page') || 1,
      limit: searchParams.get('limit') || 20,
    });

    const result = paginateArray(maskedAnswers, pagination.page, pagination.limit);
    return apiSuccess(result.data, result.pagination);
  } catch (err: unknown) {
    return apiError('INTERNAL_ERROR', 'Failed to retrieve answers', 500, err instanceof Error ? err.message : undefined);
  }
}

export async function POST(request: NextRequest) {
  try {
    const authCheck = requireRole(request, ['ADMIN', 'REVIEWER']);
    if (!authCheck.authorized) {
      return apiError('FORBIDDEN', authCheck.errorReason || 'Admin or Reviewer access required', 403);
    }

    const json = await request.json().catch(() => null);
    const parseResult = AnswerCreateSchema.safeParse(json);

    if (!parseResult.success) {
      return apiError('VALIDATION_ERROR', 'Invalid answer payload', 400, parseResult.error.format());
    }

    const payload = parseResult.data;
    const newAnswer: Answer = {
      id: `ans-${Date.now()}`,
      question_id: payload.question_id,
      marks_target: payload.marks_target as 2 | 5 | 10,
      heading: payload.heading,
      summary: payload.summary,
      key_points: payload.key_points,
      diagram_description: payload.diagram_description || null,
      example_text: payload.example_text || null,
      evaluator_tips: payload.evaluator_tips || null,
      is_premium: payload.is_premium,
      content_status: payload.content_status,
      author_id: authCheck.user?.id || null,
      verified_by: authCheck.user?.role === 'ADMIN' ? authCheck.user.id : null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    dbStore.answers.push(newAnswer);
    return apiSuccess(newAnswer, undefined, 201);
  } catch (err: unknown) {
    return apiError('INTERNAL_ERROR', 'Failed to create answer', 500, err instanceof Error ? err.message : undefined);
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
      return apiError('VALIDATION_ERROR', 'Answer ID is required', 400);
    }

    const answer = dbStore.answers.find((a) => a.id === id);
    if (!answer) {
      return apiError('NOT_FOUND', 'Answer not found', 404);
    }

    const parseResult = AnswerCreateSchema.partial().safeParse(json);
    if (!parseResult.success) {
      return apiError('VALIDATION_ERROR', 'Invalid update parameters', 400, parseResult.error.format());
    }

    Object.assign(answer, parseResult.data, { updated_at: new Date().toISOString() });
    if (parseResult.data.content_status === 'VERIFIED' || parseResult.data.content_status === 'PUBLISHED') {
      answer.verified_by = authCheck.user?.id || null;
    }

    return apiSuccess(answer);
  } catch (err: unknown) {
    return apiError('INTERNAL_ERROR', 'Failed to update answer', 500, err instanceof Error ? err.message : undefined);
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
      return apiError('VALIDATION_ERROR', 'Answer ID is required', 400);
    }

    const answer = dbStore.answers.find((a) => a.id === id);
    if (!answer) {
      return apiError('NOT_FOUND', 'Answer not found', 404);
    }

    answer.content_status = 'ARCHIVED';
    answer.updated_at = new Date().toISOString();
    return apiSuccess({ message: 'Answer archived successfully' });
  } catch (err: unknown) {
    return apiError('INTERNAL_ERROR', 'Failed to delete answer', 500, err instanceof Error ? err.message : undefined);
  }
}
