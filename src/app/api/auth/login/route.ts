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

    const user = dbStore.users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.is_active && !u.deleted_at
    );

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
