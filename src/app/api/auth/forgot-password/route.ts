import { NextRequest } from 'next/server';
import { dbStore } from '@/lib/db/client';
import { apiSuccess, apiError } from '@/lib/api/response';
import { createPasswordResetToken } from '@/lib/api/auth';
import { ForgotPasswordSchema } from '@/lib/api/validators';

export async function POST(request: NextRequest) {
  try {
    const json = await request.json().catch(() => null);
    const parseResult = ForgotPasswordSchema.safeParse(json);

    if (!parseResult.success) {
      return apiError('VALIDATION_ERROR', 'Invalid email address', 400, parseResult.error.format());
    }

    const { email } = parseResult.data;
    const user = dbStore.users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.is_active && !u.deleted_at
    );

    let resetToken: string | undefined;

    if (user) {
      resetToken = createPasswordResetToken(user.email);
    }

    const responseData: Record<string, any> = {
      message: 'If an account exists with this email, a password reset link has been dispatched.',
      expiresIn: '1 hour',
    };

    // Critical Security Protection: NEVER leak password reset tokens to client in production!
    // Expose only in test/development environments for automated test suites
    if (process.env.NODE_ENV !== 'production') {
      responseData.resetToken = resetToken || 'mock_reset_token';
    }

    return apiSuccess(responseData);
  } catch (err: unknown) {
    return apiError(
      'INTERNAL_ERROR',
      'Failed to process password reset request',
      500,
      err instanceof Error ? err.message : undefined
    );
  }
}
