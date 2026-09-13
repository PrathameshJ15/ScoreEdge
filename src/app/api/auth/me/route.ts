import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/api/response';
import { getAuthUser } from '@/lib/api/auth';

export async function GET(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user) {
      return apiError('UNAUTHORIZED', 'Not authenticated', 401);
    }

    return apiSuccess({
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        avatar_url: user.avatar_url,
        email_verified: user.email_verified,
        created_at: user.created_at,
      },
    });
  } catch (err: unknown) {
    return apiError('INTERNAL_ERROR', 'Failed to retrieve profile', 500, err instanceof Error ? err.message : undefined);
  }
}
