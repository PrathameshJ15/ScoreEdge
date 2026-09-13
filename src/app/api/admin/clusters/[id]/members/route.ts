import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/api/response';
import { requireRole } from '@/lib/api/auth';
import { addMemberToCluster } from '@/lib/intelligence/clusteringEngine';
import { RepetitionType } from '@/lib/db/types';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = requireRole(request, ['ADMIN']);
    if (!auth.authorized || !auth.user) {
      return apiError('FORBIDDEN', auth.errorReason || 'Admin privileges required', 403);
    }
    const adminUser = auth.user;

    const body = await request.json();
    const { question_id, repetition_type } = body;

    if (!question_id) {
      return apiError('VALIDATION_ERROR', 'question_id is required');
    }

    const member = addMemberToCluster(
      params.id,
      question_id,
      repetition_type as RepetitionType,
      adminUser.id
    );

    return apiSuccess(member, undefined, 201);
  } catch (err: unknown) {
    return apiError(
      'INTERNAL_ERROR',
      'Failed to add member to cluster',
      500,
      err instanceof Error ? err.message : undefined
    );
  }
}
