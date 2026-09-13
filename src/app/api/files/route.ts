import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/api/response';
import { getAuthUser } from '@/lib/api/auth';
import { dbStore } from '@/lib/db/client';

export async function GET(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    const userId = user?.id || 'usr-student-1';

    const files = dbStore.userStudyFiles.filter(
      (f) => f.user_id === userId && !f.deleted_at
    );

    return apiSuccess({
      files,
      total_count: files.length,
    });
  } catch (err: unknown) {
    return apiError(
      'INTERNAL_ERROR',
      'Failed to list study materials',
      500,
      err instanceof Error ? err.message : undefined
    );
  }
}
