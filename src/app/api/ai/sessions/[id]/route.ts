import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/api/response';
import { getAuthUser } from '@/lib/api/auth';
import { dbStore } from '@/lib/db/client';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getAuthUser(request);
    const userId = user?.id || 'usr-student-1';
    const sessionId = params.id;

    const session = dbStore.aiSessions.find((s) => s.id === sessionId);
    if (!session) {
      return apiError('NOT_FOUND', 'AI Session not found', 404);
    }

    const messages = dbStore.aiMessages.filter((m) => m.session_id === sessionId);

    let fileName = session.file_name;
    if (!fileName && session.file_id) {
      const file = dbStore.userStudyFiles.find((f) => f.id === session.file_id);
      if (file) fileName = file.filename;
    }

    return apiSuccess({
      session: {
        ...session,
        file_name: fileName,
      },
      messages: messages.sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      ),
    });
  } catch (err: unknown) {
    return apiError(
      'INTERNAL_ERROR',
      'Failed to load session details',
      500,
      err instanceof Error ? err.message : undefined
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getAuthUser(request);
    const userId = user?.id || 'usr-student-1';
    const sessionId = params.id;

    const sessionIndex = dbStore.aiSessions.findIndex(
      (s) => s.id === sessionId && (s.user_id === userId || user?.role === 'ADMIN')
    );

    if (sessionIndex === -1) {
      return apiError('NOT_FOUND', 'AI Session not found', 404);
    }

    // Remove session
    dbStore.aiSessions.splice(sessionIndex, 1);

    // Remove associated messages
    dbStore.aiMessages = dbStore.aiMessages.filter((m) => m.session_id !== sessionId);

    return apiSuccess({
      message: 'Session and message history deleted successfully',
      deleted_id: sessionId,
    });
  } catch (err: unknown) {
    return apiError(
      'INTERNAL_ERROR',
      'Failed to delete session',
      500,
      err instanceof Error ? err.message : undefined
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getAuthUser(request);
    const userId = user?.id || 'usr-student-1';
    const sessionId = params.id;
    const body = await request.json().catch(() => ({}));

    const session = dbStore.aiSessions.find(
      (s) => s.id === sessionId && (s.user_id === userId || user?.role === 'ADMIN')
    );

    if (!session) {
      return apiError('NOT_FOUND', 'AI Session not found', 404);
    }

    if (body.title) {
      session.title = body.title.slice(0, 100);
    }
    if (body.file_id) {
      session.file_id = body.file_id;
    }
    if (body.file_name) {
      session.file_name = body.file_name;
    }
    session.updated_at = new Date().toISOString();

    return apiSuccess({
      session,
    });
  } catch (err: unknown) {
    return apiError(
      'INTERNAL_ERROR',
      'Failed to update session',
      500,
      err instanceof Error ? err.message : undefined
    );
  }
}
