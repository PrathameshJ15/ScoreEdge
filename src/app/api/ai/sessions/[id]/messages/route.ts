import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/api/response';
import { getAuthUser } from '@/lib/api/auth';
import { dbStore } from '@/lib/db/client';
import { AIMessage } from '@/lib/db/types';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionId = params.id;
    const messages = dbStore.aiMessages.filter((m) => m.session_id === sessionId);

    return apiSuccess({
      messages: messages.sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      ),
    });
  } catch (err: unknown) {
    return apiError(
      'INTERNAL_ERROR',
      'Failed to load messages',
      500,
      err instanceof Error ? err.message : undefined
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getAuthUser(request);
    const userId = user?.id || 'usr-student-1';
    const sessionId = params.id;
    const json = await request.json().catch(() => null);

    if (!json || !json.content) {
      return apiError('VALIDATION_ERROR', 'Message content is required', 400);
    }

    const newMessage: AIMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      session_id: sessionId,
      user_id: userId,
      role: json.role === 'assistant' ? 'assistant' : 'user',
      content: json.content,
      source_mode: json.source_mode || 'BOTH',
      citations: json.citations || [],
      created_at: new Date().toISOString(),
    };

    dbStore.aiMessages.push(newMessage);

    // Update session timestamp
    const session = dbStore.aiSessions.find((s) => s.id === sessionId);
    if (session) {
      session.updated_at = new Date().toISOString();
    }

    return apiSuccess({
      message: newMessage,
    });
  } catch (err: unknown) {
    return apiError(
      'INTERNAL_ERROR',
      'Failed to append message',
      500,
      err instanceof Error ? err.message : undefined
    );
  }
}
