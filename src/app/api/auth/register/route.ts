import { NextRequest } from 'next/server';
import { dbStore } from '@/lib/db/client';
import { apiSuccess, apiError } from '@/lib/api/response';
import { hashPassword, createAuthToken, getAuthUser } from '@/lib/api/auth';
import { RegisterRequestSchema } from '@/lib/api/validators';
import { User } from '@/lib/db/types';
import { trackServerEvent } from '@/lib/analytics/service';

export async function POST(request: NextRequest) {
  try {
    const json = await request.json().catch(() => null);
    const parseResult = RegisterRequestSchema.safeParse(json);

    if (!parseResult.success) {
      return apiError('VALIDATION_ERROR', 'Invalid registration parameters', 400, parseResult.error.format());
    }

    const { email, password, full_name, role } = parseResult.data;

    // Security Gate: Self-registration for elevated roles (ADMIN, REVIEWER) is strictly forbidden
    // Only existing administrators can register or provision admin/reviewer accounts
    const caller = getAuthUser(request);
    const isCallerAdmin = caller && caller.role === 'ADMIN';

    if (role && role !== 'STUDENT' && !isCallerAdmin) {
      return apiError(
        'FORBIDDEN',
        'Self-registration as administrator or reviewer is forbidden. Contact system admin.',
        403
      );
    }

    const assignedRole = isCallerAdmin && role ? role : 'STUDENT';

    // Check if user already exists
    const existing = dbStore.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return apiError('USER_EXISTS', 'A user with this email already exists', 409);
    }

    const newUser: User = {
      id: `usr-${Date.now()}`,
      email: email.toLowerCase(),
      password_hash: hashPassword(password),
      full_name,
      role: assignedRole,
      avatar_url: null,
      email_verified: false,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    dbStore.users.push(newUser);

    try {
      const { prisma, isDatabaseConfigured } = await import('@/lib/prisma');
      if (isDatabaseConfigured()) {
        await prisma.user.create({
          data: {
            id: newUser.id,
            email: newUser.email,
            passwordHash: newUser.password_hash,
            fullName: newUser.full_name,
            role: newUser.role as any,
            avatarUrl: newUser.avatar_url,
            emailVerified: newUser.email_verified,
            isActive: newUser.is_active,
          },
        });
      }
    } catch (err) {
      console.warn('[Prisma Register Fallback]:', err);
    }

    // Decoupled, privacy-preserving event tracking (no raw PII)
    trackServerEvent('signup', {
      userId: newUser.id,
      properties: { role: newUser.role },
      headers: request.headers,
    });

    const token = createAuthToken({ id: newUser.id, email: newUser.email, role: newUser.role });

    const response = apiSuccess(
      {
        user: {
          id: newUser.id,
          email: newUser.email,
          full_name: newUser.full_name,
          role: newUser.role,
        },
        token,
      },
      undefined,
      201
    );

    response.cookies.set('scoreedge_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (err: unknown) {
    return apiError('INTERNAL_ERROR', 'Failed to register user', 500, err instanceof Error ? err.message : undefined);
  }
}
