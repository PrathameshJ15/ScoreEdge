import { NextRequest } from 'next/server';
import { dbStore, paginateArray } from '@/lib/db/client';
import { apiSuccess, apiError } from '@/lib/api/response';
import { PaginationQuerySchema } from '@/lib/api/validators';
import { requireRole } from '@/lib/api/auth';
import {
  enrichCluster,
  autoDiscoverClusters,
  recomputeClusterStats,
} from '@/lib/intelligence/clusteringEngine';
import { QuestionCluster } from '@/lib/db/types';

export async function GET(request: NextRequest) {
  try {
    const auth = requireRole(request, ['ADMIN', 'REVIEWER']);
    if (!auth.authorized || !auth.user) {
      return apiError('FORBIDDEN', auth.errorReason || 'Access denied', 403);
    }

    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get('subject_id');
    const unitId = searchParams.get('unit_id');
    const status = searchParams.get('status'); // 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED'

    let clusters = dbStore.questionClusters.filter((c) => !c.deleted_at);

    if (subjectId) {
      clusters = clusters.filter((c) => c.subject_id === subjectId);
    }
    if (unitId) {
      clusters = clusters.filter((c) => c.unit_id === unitId);
    }
    if (status) {
      clusters = clusters.filter((c) => c.review_status === status);
    }

    const enriched = clusters.map((c) => enrichCluster(c, true));

    const pagination = PaginationQuerySchema.parse({
      page: searchParams.get('page') || 1,
      limit: searchParams.get('limit') || 20,
    });

    const result = paginateArray(enriched, pagination.page, pagination.limit);
    return apiSuccess(result.data, result.pagination);
  } catch (err: unknown) {
    return apiError(
      'INTERNAL_ERROR',
      'Failed to retrieve clusters for admin',
      500,
      err instanceof Error ? err.message : undefined
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = requireRole(request, ['ADMIN']);
    if (!auth.authorized || !auth.user) {
      return apiError('FORBIDDEN', auth.errorReason || 'Admin privileges required', 403);
    }
    const adminUser = auth.user;

    const body = await request.json();

    // Trigger auto-discovery
    if (body.action === 'AUTO_DISCOVER') {
      const subjectId = body.subject_id || 'sub-dbms';
      const discovered = autoDiscoverClusters(subjectId);
      return apiSuccess({
        message: `Auto-discovery complete. Discovered ${discovered.length} potential cluster(s) for review.`,
        discovered_count: discovered.length,
        clusters: discovered.map((c) => enrichCluster(c, true)),
      });
    }

    // Manual cluster creation
    const { subject_id, unit_id, topic_id, canonical_name, canonical_question, typical_marks } = body;
    if (!subject_id || !unit_id || !canonical_name || !canonical_question) {
      return apiError('VALIDATION_ERROR', 'Missing required fields for question cluster');
    }

    const newCluster: QuestionCluster = {
      id: `cluster-${Date.now()}`,
      subject_id,
      unit_id,
      topic_id: topic_id || null,
      canonical_name,
      canonical_question,
      occurrence_count: 0,
      years: [],
      typical_marks: typical_marks || '8 Marks',
      confidence_score: 1.0,
      human_approved: true,
      approved_by: adminUser.id,
      approved_at: new Date().toISOString(),
      review_status: 'APPROVED',
      repetition_summary: 'Manual verified cluster created by admin',
      clustering_algorithm: 'MANUAL',
      embedding_model: null,
      trend: 'STABLE',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    dbStore.questionClusters.push(newCluster);
    recomputeClusterStats(newCluster.id);

    return apiSuccess(enrichCluster(newCluster, true), undefined, 201);
  } catch (err: unknown) {
    return apiError(
      'INTERNAL_ERROR',
      'Failed to create question cluster',
      500,
      err instanceof Error ? err.message : undefined
    );
  }
}
