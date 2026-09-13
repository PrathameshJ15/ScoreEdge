import { NextRequest } from 'next/server';
import { dbStore } from '@/lib/db/client';
import { apiSuccess, apiError } from '@/lib/api/response';
import { requireRole } from '@/lib/api/auth';
import {
  enrichCluster,
  approveCluster,
  rejectCluster,
  recomputeClusterStats,
} from '@/lib/intelligence/clusteringEngine';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = requireRole(request, ['ADMIN', 'REVIEWER']);
    if (!auth.authorized || !auth.user) {
      return apiError('FORBIDDEN', auth.errorReason || 'Access denied', 403);
    }

    const cluster = dbStore.questionClusters.find((c) => c.id === params.id && !c.deleted_at);
    if (!cluster) {
      return apiError('NOT_FOUND', 'Question cluster not found', 404);
    }

    return apiSuccess(enrichCluster(cluster, true));
  } catch (err: unknown) {
    return apiError(
      'INTERNAL_ERROR',
      'Failed to retrieve cluster',
      500,
      err instanceof Error ? err.message : undefined
    );
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = requireRole(request, ['ADMIN']);
    if (!auth.authorized || !auth.user) {
      return apiError('FORBIDDEN', auth.errorReason || 'Admin privileges required', 403);
    }
    const adminUser = auth.user;

    const cluster = dbStore.questionClusters.find((c) => c.id === params.id && !c.deleted_at);
    if (!cluster) {
      return apiError('NOT_FOUND', 'Question cluster not found', 404);
    }

    const body = await request.json();

    // 1. APPROVE ACTION
    if (body.action === 'APPROVE') {
      const approved = approveCluster(params.id, adminUser.id);
      return apiSuccess(enrichCluster(approved, true));
    }

    // 2. REJECT ACTION
    if (body.action === 'REJECT') {
      const rejected = rejectCluster(params.id, adminUser.id, body.reason);
      return apiSuccess(enrichCluster(rejected, true));
    }

    // 3. EDIT CANONICAL / METADATA
    if (body.canonical_question !== undefined) cluster.canonical_question = body.canonical_question;
    if (body.canonical_name !== undefined) cluster.canonical_name = body.canonical_name;
    if (body.topic_id !== undefined) cluster.topic_id = body.topic_id;
    if (body.typical_marks !== undefined) cluster.typical_marks = body.typical_marks;
    if (body.confidence_score !== undefined) cluster.confidence_score = body.confidence_score;
    cluster.updated_at = new Date().toISOString();

    recomputeClusterStats(cluster.id);

    return apiSuccess(enrichCluster(cluster, true));
  } catch (err: unknown) {
    return apiError(
      'INTERNAL_ERROR',
      'Failed to update question cluster',
      500,
      err instanceof Error ? err.message : undefined
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = requireRole(request, ['ADMIN']);
    if (!auth.authorized || !auth.user) {
      return apiError('FORBIDDEN', auth.errorReason || 'Admin privileges required', 403);
    }

    const cluster = dbStore.questionClusters.find((c) => c.id === params.id && !c.deleted_at);
    if (!cluster) {
      return apiError('NOT_FOUND', 'Question cluster not found', 404);
    }

    cluster.deleted_at = new Date().toISOString();
    return apiSuccess({ message: 'Cluster successfully archived/deleted', id: params.id });
  } catch (err: unknown) {
    return apiError(
      'INTERNAL_ERROR',
      'Failed to delete cluster',
      500,
      err instanceof Error ? err.message : undefined
    );
  }
}
