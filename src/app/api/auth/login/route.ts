import { NextRequest } from 'next/server';
import { dbStore } from '@/lib/db/client';
import { apiSuccess, apiError } from '@/lib/api/response';
import { verifyPassword, createAuthToken } from '@/lib/api/auth';
import { LoginRequestSchema } from '@/lib/api/validators';
import { trackServerEvent } from '@/lib/analytics/service';

export async function POST(request: NextRequest) {
  try {
    const json = await request.json().catch(() => null);
    const parseResult = LoginRequestSchema.safeParse(json);

    if (!parseResult.success) {
      return apiError('VALIDATION_ERROR', 'Invalid login parameters', 400, parseResult.error.format());
    }

    const { email, password } = parseResult.data;

    let user = dbStore.users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.is_active && !u.deleted_at
    );

    if (!user) {
      try {
        const { prisma, isDatabaseConfigured } = await import('@/lib/prisma');
        if (isDatabaseConfigured()) {
          const dbUser = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
          });
          if (dbUser && dbUser.isActive && !dbUser.deletedAt) {
            user = {
              id: dbUser.id,
              email: dbUser.email,
              password_hash: dbUser.passwordHash,
              full_name: dbUser.fullName,
              role: dbUser.role as any,
              department: dbUser.department,
              branch_code: dbUser.branchCode,
              academic_year: dbUser.academicYear,
              year_number: dbUser.yearNumber,
              semester_number: dbUser.semesterNumber,
              pattern: dbUser.pattern,
              target_sgpa: dbUser.targetSgpa,
              avatar_url: dbUser.avatarUrl,
              email_verified: dbUser.emailVerified,
              is_active: dbUser.isActive,
              created_at: dbUser.createdAt.toISOString(),
              updated_at: dbUser.updatedAt.toISOString(),
            };
            dbStore.users.push(user);
          }
        }
      } catch (err) {
        console.warn('[Prisma Login Fallback]:', err);
      }
    }

    if (!user) {
      return apiError('INVALID_CREDENTIALS', 'Invalid email or password', 401);
    }

    // Strict cryptographic password verification using salted scrypt and timingSafeEqual
    const isValid = verifyPassword(password, user.password_hash);

    if (!isValid) {
      return apiError('INVALID_CREDENTIALS', 'Invalid email or password', 401);
    }

    const token = createAuthToken({ id: user.id, email: user.email, role: user.role });

    // Decoupled login event tracking (no credentials or PII)
    trackServerEvent('login', {
      userId: user.id,
      properties: { auth_method: 'password' },
      headers: request.headers,
    });

    const response = apiSuccess({
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
        avatar_url: user.avatar_url,
      },
      token,
    });

    response.cookies.set('scoreedge_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (err: unknown) {
    return apiError('INTERNAL_ERROR', 'Failed to process login', 500, err instanceof Error ? err.message : undefined);
  }
}
