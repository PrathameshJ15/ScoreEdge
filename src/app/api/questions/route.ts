import { NextRequest } from 'next/server';
import { dbStore, paginateArray } from '@/lib/db/client';
import { apiSuccess, apiError } from '@/lib/api/response';
import { PaginationQuerySchema, QuestionCreateSchema } from '@/lib/api/validators';
import { getAuthUser, requireRole } from '@/lib/api/auth';
import { Question } from '@/lib/db/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get('subject_id');
    const unitId = searchParams.get('unit_id');
    const topicId = searchParams.get('topic_id');
    const isPyq = searchParams.get('is_pyq');
    const difficulty = searchParams.get('difficulty');
    const questionType = searchParams.get('question_type');
    const verificationStatus = searchParams.get('verification_status');
    const marks = searchParams.get('marks');
    const year = searchParams.get('year') ? Number(searchParams.get('year')) : null;
    const session = searchParams.get('exam_session') || searchParams.get('session');
    const patternId = searchParams.get('pattern_id');
    const branchId = searchParams.get('branch_id');
    const semesterId = searchParams.get('semester_id');
    const status = searchParams.get('status');
    const query = searchParams.get('q')?.toLowerCase();

    const currentUser = getAuthUser(request);
    const isAdminOrReviewer = currentUser && (currentUser.role === 'ADMIN' || currentUser.role === 'REVIEWER');

    let questions = dbStore.questions.filter((q) => !q.deleted_at);

    // Public / student filter
    if (!isAdminOrReviewer) {
      questions = questions.filter((q) => q.content_status === 'PUBLISHED');
    } else if (status) {
      questions = questions.filter((q) => q.content_status === status);
    }

    if (subjectId) {
      questions = questions.filter((q) => q.subject_id === subjectId);
    }
    if (unitId) {
      questions = questions.filter((q) => q.unit_id === unitId);
    }
    if (topicId) {
      questions = questions.filter((q) => q.topic_id === topicId);
    }
    if (isPyq !== null && isPyq !== undefined && isPyq !== '') {
      const boolVal = isPyq === 'true' || isPyq === '1';
      questions = questions.filter((q) => q.is_pyq === boolVal);
    }
    if (difficulty) {
      questions = questions.filter((q) => q.difficulty === difficulty);
    }
    if (questionType) {
      questions = questions.filter((q) => q.question_type === questionType);
    }
    if (verificationStatus) {
      questions = questions.filter((q) => q.verification_status === verificationStatus);
    }
    if (marks) {
      const numMarks = Number(marks);
      questions = questions.filter((q) => q.marks === numMarks);
    }
    if (branchId) {
      const branchSubjectIds = new Set(dbStore.subjects.filter((s) => s.branch_id === branchId).map((s) => s.id));
      questions = questions.filter((q) => branchSubjectIds.has(q.subject_id));
    }
    if (semesterId) {
      const semSubjectIds = new Set(dbStore.subjects.filter((s) => s.semester_id === semesterId).map((s) => s.id));
      questions = questions.filter((q) => semSubjectIds.has(q.subject_id));
    }

    // Attach occurrences
    let enriched = questions.map((q) => {
      const occurrences = dbStore.questionOccurrences.filter((occ) => occ.question_id === q.id);
      const subject = dbStore.subjects.find((s) => s.id === q.subject_id);
      const unit = dbStore.units.find((u) => u.id === q.unit_id);
      const topic = q.topic_id ? dbStore.topics.find((t) => t.id === q.topic_id) : null;
      const answersCount = dbStore.answers.filter((a) => a.question_id === q.id && a.content_status === 'PUBLISHED').length;

      return {
        ...q,
        occurrences,
        subject: subject ? { id: subject.id, name: subject.name, short_name: subject.short_name, code: subject.code, pattern_id: subject.pattern_id } : null,
        unit: unit ? { id: unit.id, unit_number: unit.unit_number, title: unit.title } : null,
        topic: topic ? { id: topic.id, title: topic.title, importance_level: topic.importance_level } : null,
        answers_count: answersCount,
      };
    });

    if (year || session) {
      enriched = enriched.filter((q) =>
        q.occurrences.some((o) => {
          const matchYear = !year || o.year === year;
          const matchSession = !session || o.exam_session === session;
          return matchYear && matchSession;
        })
      );
    }
    if (patternId) {
      enriched = enriched.filter((q) => 
        q.occurrences.some((o) => o.pattern_id === patternId) || 
        (q.subject && q.subject.pattern_id === patternId)
      );
    }
    if (query) {
      enriched = enriched.filter(
        (q) =>
          q.question_text.toLowerCase().includes(query) ||
          q.normalized_question.toLowerCase().includes(query) ||
          (q.subject?.name.toLowerCase().includes(query)) ||
          (q.unit?.title.toLowerCase().includes(query))
      );
    }

    const pagination = PaginationQuerySchema.parse({
      page: searchParams.get('page') || 1,
      limit: searchParams.get('limit') || 20,
    });

    const result = paginateArray(enriched, pagination.page, pagination.limit);
    return apiSuccess(result.data, result.pagination);
  } catch (err: unknown) {
    return apiError('INTERNAL_ERROR', 'Failed to retrieve questions', 500, err instanceof Error ? err.message : undefined);
  }
}

export async function POST(request: NextRequest) {
  try {
    const authCheck = requireRole(request, ['ADMIN', 'REVIEWER']);
    if (!authCheck.authorized) {
      return apiError('FORBIDDEN', authCheck.errorReason || 'Admin or Reviewer access required', 403);
    }

    const json = await request.json().catch(() => null);
    const parseResult = QuestionCreateSchema.safeParse(json);

    if (!parseResult.success) {
      return apiError('VALIDATION_ERROR', 'Invalid question payload', 400, parseResult.error.format());
    }

    const payload = parseResult.data;
    const normalized =
      payload.normalized_question ||
      payload.question_text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .trim();

    const newQuestion: Question = {
      id: `q-${Date.now()}`,
      subject_id: payload.subject_id,
      unit_id: payload.unit_id,
      topic_id: payload.topic_id || null,
      question_text: payload.question_text,
      normalized_question: normalized,
      marks: payload.marks,
      difficulty: payload.difficulty,
      question_type: payload.question_type,
      is_pyq: payload.is_pyq,
      verification_status: payload.verification_status,
      content_status: payload.content_status,
      source_id: payload.source_id || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    dbStore.questions.push(newQuestion);
    return apiSuccess(newQuestion, undefined, 201);
  } catch (err: unknown) {
    return apiError('INTERNAL_ERROR', 'Failed to create question', 500, err instanceof Error ? err.message : undefined);
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
      return apiError('VALIDATION_ERROR', 'Question ID is required', 400);
    }

    const question = dbStore.questions.find((q) => q.id === id && !q.deleted_at);
    if (!question) {
      return apiError('NOT_FOUND', 'Question not found', 404);
    }

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

export async function DELETE(request: NextRequest) {
  try {
    const authCheck = requireRole(request, ['ADMIN']);
    if (!authCheck.authorized) {
      return apiError('FORBIDDEN', authCheck.errorReason || 'Admin access required', 403);
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return apiError('VALIDATION_ERROR', 'Question ID is required', 400);
    }

    const question = dbStore.questions.find((q) => q.id === id);
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
