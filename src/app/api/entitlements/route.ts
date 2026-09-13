import { NextRequest } from 'next/server';
import { dbStore } from '@/lib/db/client';
import { apiSuccess, apiError } from '@/lib/api/response';
import { getAuthUser } from '@/lib/api/auth';

export async function GET(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user) {
      return apiError('UNAUTHORIZED', 'Authentication required', 401);
    }

    const now = new Date();
    const activeEntitlements = dbStore.entitlements.filter(
      (e) => e.user_id === user.id && e.is_active && (!e.expires_at || new Date(e.expires_at) > now)
    );

    const hasSemesterPass = activeEntitlements.some((e) => e.access_scope === 'SEMESTER_ALL');
    const unlockedSubjectIds = activeEntitlements
      .map((e) => e.subject_id)
      .filter((id): id is string => Boolean(id));

    return apiSuccess({
      has_semester_pass: hasSemesterPass,
      unlocked_subject_ids: unlockedSubjectIds,
      entitlements: activeEntitlements,
    });
  } catch (err: unknown) {
    return apiError('INTERNAL_ERROR', 'Failed to retrieve entitlements', 500, err instanceof Error ? err.message : undefined);
  }
}
