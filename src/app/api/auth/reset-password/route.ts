import { NextRequest } from 'next/server';
import { dbStore } from '@/lib/db/client';
import { apiSuccess, apiError } from '@/lib/api/response';
import { consumePasswordResetToken, hashPassword } from '@/lib/api/auth';
import { ResetPasswordSchema } from '@/lib/api/validators';

export async function POST(request: NextRequest) {
  try {
    const json = await request.json().catch(() => null);
    const parseResult = ResetPasswordSchema.safeParse(json);

    if (!parseResult.success) {
      return apiError('VALIDATION_ERROR', 'Invalid password reset parameters', 400, parseResult.error.format());
    }

    const { token, password } = parseResult.data;
    const email = consumePasswordResetToken(token);

    if (!email) {
      return apiError('INVALID_TOKEN', 'The password reset token is invalid or has expired', 400);
    }

    const user = dbStore.users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.is_active && !u.deleted_at
    );

    if (!user) {
      return apiError('USER_NOT_FOUND', 'User account associated with this token was not found', 404);
    }

    // Update password hash and timestamp
    user.password_hash = hashPassword(password);
    user.updated_at = new Date().toISOString();

    return apiSuccess({
      message: 'Password has been successfully updated. You may now log in.',
      email: user.email,
    });
  } catch (err: unknown) {
    return apiError(
      'INTERNAL_ERROR',
      'Failed to reset password',
      500,
      err instanceof Error ? err.message : undefined
    );
  }
}
