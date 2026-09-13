import { NextRequest } from 'next/server';
import { dbStore } from '@/lib/db/client';
import { apiSuccess, apiError } from '@/lib/api/response';
import { requireRole, getAuthUser } from '@/lib/api/auth';
import { checkUserEntitlement } from '@/lib/payments/entitlements';
import { QuestionCreateSchema } from '@/lib/api/validators';
import { trackServerEvent } from '@/lib/analytics/service';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const question = dbStore.questions.find((q) => q.id === params.id && !q.deleted_at);
    if (!question) {
      return apiError('NOT_FOUND', 'Question not found', 404);
    }

    const currentUser = getAuthUser(request);
    const isAdminOrReviewer = currentUser && (currentUser.role === 'ADMIN' || currentUser.role === 'REVIEWER');

    if (question.content_status !== 'PUBLISHED' && !isAdminOrReviewer) {
      return apiError('NOT_FOUND', 'Question not found', 404);
    }

    const occurrences = dbStore.questionOccurrences.filter((occ) => occ.question_id === question.id);
    let answers = dbStore.answers.filter((a) => a.question_id === question.id);

    if (!isAdminOrReviewer) {
      answers = answers.filter((a) => a.content_status === 'PUBLISHED');
    }

    // Mask premium answers if user is not entitled
    const entitlementCheck = checkUserEntitlement(currentUser, question.subject_id);
    const isUnlocked = isAdminOrReviewer || entitlementCheck.hasAccess;

    const maskedAnswers = answers.map((ans) => {
      if (ans.is_premium && !isUnlocked) {
        return {
          id: ans.id,
          question_id: ans.question_id,
          marks_target: ans.marks_target,
          heading: ans.heading,
          summary: ans.summary,
          is_premium: true,
          is_locked: true,
          message:
            'Upgrade to Single Subject Pass (₹49) or Semester Pass (₹199) to unlock full 10-mark answers and diagrams.',
        };
      }
      return {
        ...ans,
        is_locked: false,
      };
    });

    const subject = dbStore.subjects.find((s) => s.id === question.subject_id);
    const unit = dbStore.units.find((u) => u.id === question.unit_id);
    const topic = question.topic_id ? dbStore.topics.find((t) => t.id === question.topic_id) : null;
    const pattern = subject ? dbStore.patterns.find((p) => p.id === subject.pattern_id) : null;
    const branch = subject ? dbStore.branches.find((b) => b.id === subject.branch_id) : null;
    const semester = subject ? dbStore.semesters.find((s) => s.id === subject.semester_id) : null;

    if (question.is_pyq) {
      trackServerEvent('PYQ viewed', {
        userId: currentUser?.id,
        properties: {
          question_id: question.id,
          subject_id: question.subject_id,
          unit_id: question.unit_id,
          marks: question.marks,
          difficulty: question.difficulty,
        },
        headers: request.headers,
      });
    }

    return apiSuccess({
      question: {
        ...question,
        subject,
        unit,
        topic,
        pattern,
        branch,
        semester,
      },
      occurrences,
      answers: maskedAnswers,
    });
  } catch (err: unknown) {
    return apiError('INTERNAL_ERROR', 'Failed to retrieve question', 500, err instanceof Error ? err.message : undefined);
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authCheck = requireRole(request, ['ADMIN', 'REVIEWER']);
    if (!authCheck.authorized) {
      return apiError('FORBIDDEN', authCheck.errorReason || 'Admin or Reviewer access required', 403);
    }

    const question = dbStore.questions.find((q) => q.id === params.id && !q.deleted_at);
    if (!question) {
      return apiError('NOT_FOUND', 'Question not found', 404);
    }

    const json = await request.json().catch(() => null);
    const parseResult = QuestionCreateSchema.partial().safeParse(json);

    if (!parseResult.success) {
      return apiError('VALIDATION_ERROR', 'Invalid update parameters', 400, parseResult.error.format());
    }

    Object.assign(question, parseResult.data, { updated_at: new Date().toISOString() });
    return apiSuccess(question);
  } catch (err: unknown) {
    return apiError('INTERNAL_ERROR', 'Failed to update question', 500, err instanceof Error ? err.message : undefined);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authCheck = requireRole(request, ['ADMIN']);
    if (!authCheck.authorized) {
      return apiError('FORBIDDEN', authCheck.errorReason || 'Admin access required', 403);
    }

    const question = dbStore.questions.find((q) => q.id === params.id);
    if (!question) {
      return apiError('NOT_FOUND', 'Question not found', 404);
    }

    question.deleted_at = new Date().toISOString();
    question.content_status = 'ARCHIVED';

    return apiSuccess({ message: 'Question soft-deleted successfully' });
  } catch (err: unknown) {
    return apiError('INTERNAL_ERROR', 'Failed to delete question', 500, err instanceof Error ? err.message : undefined);
  }
}
