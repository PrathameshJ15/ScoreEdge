import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/api/response';
import { getAuthUser } from '@/lib/api/auth';
import { dbStore } from '@/lib/db/client';
import { AISession } from '@/lib/db/types';

export async function GET(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    const userId = user?.id || 'usr-student-1';

    let userSessions = dbStore.aiSessions.filter((s) => s.user_id === userId);

    // If none exist, seed a couple of authentic recent sample sessions for immediate UI usability
    if (userSessions.length === 0) {
      const defaultSessions: AISession[] = [
        {
          id: 'sess-1',
          user_id: userId,
          subject_id: 'sub-dbms',
          title: 'Explain 3NF vs BCNF with examples',
          source_mode: 'BOTH',
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'sess-2',
          user_id: userId,
          subject_id: 'sub-os',
          title: 'Compare FCFS vs Round Robin CPU scheduling',
          source_mode: 'SCOREDGE',
          created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'sess-3',
          user_id: userId,
          subject_id: 'sub-dbms',
          title: 'Important questions from my uploaded notes',
          source_mode: 'MY_MATERIAL',
          created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        },
      ];
      dbStore.aiSessions.push(...defaultSessions);
      userSessions = defaultSessions;
    }

    return apiSuccess({
      sessions: userSessions.sort(
        (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      ),
    });
  } catch (err: unknown) {
    return apiError(
      'INTERNAL_ERROR',
      'Failed to load conversation history',
      500,
      err instanceof Error ? err.message : undefined
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    const userId = user?.id || 'usr-student-1';
    const json = await request.json().catch(() => ({}));

    const title = (json.title || 'New Study Session').slice(0, 100);
    const source_mode = json.source_mode || 'BOTH';
    const subject_id = json.subject_id || 'sub-dbms';

    const newSession: AISession = {
      id: `sess-${Date.now()}`,
      user_id: userId,
      subject_id,
      title,
      source_mode,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    dbStore.aiSessions.unshift(newSession);

    return apiSuccess({
      session: newSession,
    });
  } catch (err: unknown) {
    return apiError(
      'INTERNAL_ERROR',
      'Failed to create AI session',
      500,
      err instanceof Error ? err.message : undefined
    );
  }
}
