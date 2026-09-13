import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/api/response';
import { requireRole } from '@/lib/api/auth';
import { removeMemberFromCluster } from '@/lib/intelligence/clusteringEngine';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; memberId: string } }
) {
  try {
    const auth = requireRole(request, ['ADMIN']);
    if (!auth.authorized || !auth.user) {
      return apiError('FORBIDDEN', auth.errorReason || 'Admin privileges required', 403);
    }

    const removed = removeMemberFromCluster(params.id, params.memberId);
    if (!removed) {
      return apiError('NOT_FOUND', 'Cluster member not found', 404);
    }

    return apiSuccess({ message: 'Cluster member successfully removed', member_id: params.memberId });
  } catch (err: unknown) {
    return apiError(
      'INTERNAL_ERROR',
      'Failed to remove member from cluster',
      500,
      err instanceof Error ? err.message : undefined
    );
  }
}
