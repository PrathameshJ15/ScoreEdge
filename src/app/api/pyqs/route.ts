import { NextRequest } from 'next/server';
import { dbStore, paginateArray } from '@/lib/db/client';
import { apiSuccess, apiError } from '@/lib/api/response';
import { PaginationQuerySchema } from '@/lib/api/validators';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get('subject_id');
    const unitId = searchParams.get('unit_id');
    const year = searchParams.get('year') ? Number(searchParams.get('year')) : null;
    const session = searchParams.get('session');
    const query = searchParams.get('q')?.toLowerCase();

    // Retrieve published PYQ questions
    let pyqQuestions = dbStore.questions.filter(
      (q) => q.is_pyq && q.content_status === 'PUBLISHED' && !q.deleted_at
    );

    if (subjectId) {
      pyqQuestions = pyqQuestions.filter((q) => q.subject_id === subjectId);
    }
    if (unitId) {
      pyqQuestions = pyqQuestions.filter((q) => q.unit_id === unitId);
    }
    if (query) {
      pyqQuestions = pyqQuestions.filter(
        (q) =>
          q.question_text.toLowerCase().includes(query) ||
          q.normalized_question.toLowerCase().includes(query)
      );
    }

    // Attach occurrences
    let enriched = pyqQuestions.map((q) => {
      const occurrences = dbStore.questionOccurrences.filter((occ) => occ.question_id === q.id);
      return {
        ...q,
        occurrences,
      };
    });

    if (year) {
      enriched = enriched.filter((q) => q.occurrences.some((o) => o.year === year));
    }
    if (session) {
      enriched = enriched.filter((q) => q.occurrences.some((o) => o.exam_session === session));
    }

    const pagination = PaginationQuerySchema.parse({
      page: searchParams.get('page') || 1,
      limit: searchParams.get('limit') || 20,
    });

    const result = paginateArray(enriched, pagination.page, pagination.limit);
    return apiSuccess(result.data, result.pagination);
  } catch (err: unknown) {
    return apiError('INTERNAL_ERROR', 'Failed to retrieve PYQs', 500, err instanceof Error ? err.message : undefined);
  }
}
