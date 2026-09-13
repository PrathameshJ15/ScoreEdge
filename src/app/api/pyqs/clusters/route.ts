import { NextRequest } from 'next/server';
import { dbStore, paginateArray } from '@/lib/db/client';
import { apiSuccess, apiError } from '@/lib/api/response';
import { PaginationQuerySchema } from '@/lib/api/validators';
import { getAuthUser } from '@/lib/api/auth';
import { checkUserEntitlement } from '@/lib/payments/entitlements';
import { enrichCluster } from '@/lib/intelligence/clusteringEngine';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get('subject_id');
    const unitId = searchParams.get('unit_id');

    const currentUser = getAuthUser(request);
    const isAdminOrReviewer = currentUser && (currentUser.role === 'ADMIN' || currentUser.role === 'REVIEWER');
    const entitlementCheck = checkUserEntitlement(currentUser, subjectId);
    const hasFullAccess = isAdminOrReviewer || entitlementCheck.hasAccess;

    let clusters = dbStore.questionClusters.filter((c) => !c.deleted_at);

    // Regular students only see human-approved or non-rejected clusters
    if (!isAdminOrReviewer) {
      clusters = clusters.filter((c) => c.review_status !== 'REJECTED');
    }

    if (subjectId) {
      clusters = clusters.filter((c) => c.subject_id === subjectId);
    }
    if (unitId) {
      clusters = clusters.filter((c) => c.unit_id === unitId);
    }

    const enrichedClusters = clusters.map((c, idx) => {
      const enriched = enrichCluster(c);

      const relatedQuestions = dbStore.questions.filter(
        (q) => q.subject_id === c.subject_id && q.unit_id === c.unit_id && !q.deleted_at
      );

      const isLocked = !hasFullAccess && idx >= 2;

      // Safe Display: "Repeated/Similar in X verified papers"
      const repetitionSummary =
        c.repetition_summary || `Repeated/Similar in ${c.occurrence_count} verified papers`;

      return {
        ...enriched,
        repetition_summary: repetitionSummary,
        is_locked: isLocked,
        lock_message: isLocked
          ? 'Upgrade to Single Subject Pass (₹49) or Semester Pass (₹199) to unlock full frequency intelligence.'
          : null,
        variations: isLocked
          ? relatedQuestions.slice(0, 1).map((q) => ({
              id: q.id,
              question_text: q.question_text,
              marks: q.marks,
              difficulty: q.difficulty,
            }))
          : relatedQuestions.map((q) => ({
              id: q.id,
              question_text: q.question_text,
              marks: q.marks,
              difficulty: q.difficulty,
            })),
      };
    });

    const pagination = PaginationQuerySchema.parse({
      page: searchParams.get('page') || 1,
      limit: searchParams.get('limit') || 20,
    });

    const result = paginateArray(enrichedClusters, pagination.page, pagination.limit);
    return apiSuccess(result.data, result.pagination);
  } catch (err: unknown) {
    return apiError(
      'INTERNAL_ERROR',
      'Failed to retrieve question clusters',
      500,
      err instanceof Error ? err.message : undefined
    );
  }
}
