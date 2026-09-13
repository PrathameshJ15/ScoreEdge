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
        department: user.department,
        branch_code: user.branch_code,
        academic_year: user.academic_year,
        year_number: user.year_number,
        semester_number: user.semester_number,
        pattern: user.pattern,
        target_sgpa: user.target_sgpa,
        university: user.university,
        college_name: user.college_name,
        backlog_subjects_json: user.backlog_subjects_json,
        avatar_url: user.avatar_url,
        email_verified: user.email_verified,
        created_at: user.created_at,
      },
    });
  } catch (err: unknown) {
    return apiError('INTERNAL_ERROR', 'Failed to retrieve profile', 500, err instanceof Error ? err.message : undefined);
  }
}
