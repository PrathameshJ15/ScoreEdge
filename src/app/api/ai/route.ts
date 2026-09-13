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

    const { query, subject_id, unit_id, topic_id, task_type, marks_target, action, source_mode, file_ids, quick_action, session_id } = parseResult.data;

    // Optional user authentication for progress context & higher rate limits
    const currentUser = getAuthUser(request);
    const userId = currentUser?.id || 'usr-student-1';
    const entitlement = currentUser ? checkUserEntitlement(currentUser, subject_id) : { hasAccess: false };

    const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1';
    const rateLimitIdentifier = currentUser ? currentUser.id : `ip_${clientIp}`;

    // Auto-resolve session context (file association and multi-turn chat history)
    let effectiveFileIds = file_ids;
    let sessionChatHistory: Array<{ role: 'user' | 'assistant'; content: string }> | undefined;

    if (session_id) {
      const { dbStore } = await import('@/lib/db/client');
      const existingSession = dbStore.aiSessions.find((s) => s.id === session_id);
      if ((!effectiveFileIds || effectiveFileIds.length === 0) && existingSession?.file_id) {
        effectiveFileIds = [existingSession.file_id];
      }

      const prevMsgs = dbStore.aiMessages.filter((m) => m.session_id === session_id);
      if (prevMsgs.length > 0) {
        sessionChatHistory = prevMsgs.map((m) => ({
          role: m.role,
          content: m.content,
        }));
      }
    }

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
        sourceMode: source_mode,
        fileIds: effectiveFileIds,
        quickAction: quick_action,
        chatHistory: sessionChatHistory,
      });

      // If session_id is provided, automatically persist the messages
      if (session_id) {
        const { dbStore } = await import('@/lib/db/client');
        let session = dbStore.aiSessions.find((s) => s.id === session_id);
        if (!session) {
          session = {
            id: session_id,
            user_id: userId,
            subject_id: subject_id || 'sub-dbms',
            title: query.slice(0, 50) + (query.length > 50 ? '...' : ''),
            source_mode: source_mode || 'BOTH',
            file_id: file_ids && file_ids.length > 0 ? file_ids[0] : undefined,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          dbStore.aiSessions.unshift(session);
        } else {
          session.updated_at = new Date().toISOString();
          if (file_ids && file_ids.length > 0 && !session.file_id) {
            session.file_id = file_ids[0];
          }
        }

        // Add user message
        dbStore.aiMessages.push({
          id: `msg-${Date.now()}-u`,
          session_id,
          user_id: userId,
          role: 'user',
          content: query,
          source_mode: source_mode || 'BOTH',
          created_at: new Date().toISOString(),
        });

        // Add assistant message
        dbStore.aiMessages.push({
          id: `msg-${Date.now()}-a`,
          session_id,
          user_id: userId,
          role: 'assistant',
          content: result.content,
          source_mode: source_mode || 'BOTH',
          citations: result.citations.map((c) => ({
            type: (c.type as any) || 'STUDENT_MATERIAL',
            id: c.id,
            title: c.title,
            snippet: c.snippet,
          })),
          created_at: new Date().toISOString(),
        });
      }

      // Decoupled tracking for AI feature usage (no raw prompts or sensitive text)
      trackServerEvent('AI feature used', {
        userId: currentUser?.id,
        properties: {
          action: action || task_type || 'query',
          task_type,
          subject_id,
          unit_id,
          is_grounded: result.is_grounded,
          session_id,
        },
        headers: request.headers,
      });

      return apiSuccess({
        ...result,
        session_id,
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
