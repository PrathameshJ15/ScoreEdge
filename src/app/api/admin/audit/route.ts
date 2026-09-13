import { NextRequest } from 'next/server';
import { dbStore, paginateArray } from '@/lib/db/client';
import { apiSuccess, apiError } from '@/lib/api/response';
import { PaginationQuerySchema } from '@/lib/api/validators';
import { requireRole } from '@/lib/api/auth';

export async function GET(request: NextRequest) {
  try {
    const authCheck = requireRole(request, ['ADMIN', 'REVIEWER']);
    if (!authCheck.authorized) {
      return apiError('FORBIDDEN', authCheck.errorReason || 'Admin or Reviewer access required', 403);
    }

    const { searchParams } = new URL(request.url);
    const entityType = searchParams.get('entity_type');
    const entityId = searchParams.get('entity_id');
    const reviewerId = searchParams.get('reviewer_id');

    let records = [...dbStore.verificationRecords];

    if (entityType) {
      records = records.filter((r) => r.entity_type === entityType);
    }
    if (entityId) {
      records = records.filter((r) => r.entity_id === entityId);
    }
    if (reviewerId) {
      records = records.filter((r) => r.reviewer_id === reviewerId);
    }

    // Newest audit records first
    records.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const pagination = PaginationQuerySchema.parse({
      page: searchParams.get('page') || 1,
      limit: searchParams.get('limit') || 20,
    });

    const result = paginateArray(records, pagination.page, pagination.limit);
    return apiSuccess(result.data, result.pagination);
  } catch (err: unknown) {
    return apiError('INTERNAL_ERROR', 'Failed to retrieve audit records', 500, err instanceof Error ? err.message : undefined);
  }
}