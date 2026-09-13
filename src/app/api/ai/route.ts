import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/api/response';
import { AIQuerySchema } from '@/lib/api/validators';
import { getAuthUser } from '@/lib/api/auth';
import { checkUserEntitlement } from '@/lib/payments/entitlements';
import { executeGroundedAIQuery } from '@/lib/ai/service';
import { AIBoundaryViolationError } from '@/lib/ai/guardrails';
import { trackServerEvent } from '@/lib/analytics/service';

export async function POST(request: NextRequest) {
  try {
    const json = await request.json().catch(() => null);
    const parseResult = AIQuerySchema.safeParse(json);

    if (!parseResult.success) {
      return apiError('VALIDATION_ERROR', 'Invalid AI query parameters', 400, parseResult.error.format());
    }

    const { query, subject_id, unit_id, topic_id, task_type, marks_target, action } = parseResult.data;

    // Optional user authentication for progress context & higher rate limits
    const currentUser = getAuthUser(request);
    const entitlement = currentUser ? checkUserEntitlement(currentUser, subject_id) : { hasAccess: false };

    const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1';
    const rateLimitIdentifier = currentUser ? currentUser.id : `ip_${clientIp}`;

    try {
      const result = await executeGroundedAIQuery({
        query,
        subjectId: subject_id,
        unitId: unit_id,
        topicId: topic_id,
        userId: currentUser?.id,
        isPremiumUser: entitlement.hasAccess,
        taskType: task_type,
        marksTarget: marks_target,
        requestedAction: action,
      });

      // Decoupled tracking for AI feature usage (no raw prompts or sensitive text)
      trackServerEvent('AI feature used', {
        userId: currentUser?.id,
        properties: {
          action: action || task_type || 'query',
          task_type,
          subject_id,
          unit_id,
          is_grounded: result.is_grounded,
        },
        headers: request.headers,
      });

      return apiSuccess({
        ...result,
        grounding: {
          is_grounded: result.is_grounded,
          matched_verified_sources: result.grounded_sources_count,
        },
      });
    } catch (err: unknown) {
      if (err instanceof AIBoundaryViolationError) {
        return apiError(
          'DISALLOWED_AI_OPERATION',
          err.message,
          403,
          { domain: err.domain }
        );
      }

      if (err instanceof Error && err.message.includes('limit exceeded')) {
        return apiError('RATE_LIMITED', err.message, 429);
      }

      throw err;
    }
  } catch (err: unknown) {
    return apiError(
      'INTERNAL_ERROR',
      'Failed to process AI grounded query',
      500,
      err instanceof Error ? err.message : undefined
    );
  }
}
