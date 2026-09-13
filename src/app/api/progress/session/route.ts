import { NextRequest } from 'next/server';
import { dbStore } from '@/lib/db/client';
import { apiSuccess, apiError } from '@/lib/api/response';
import { StudySessionCreateSchema } from '@/lib/api/validators';
import { getAuthUser } from '@/lib/api/auth';
import { validateProgressAccess } from '@/lib/progress/personalizationEngine';
import { StudySession } from '@/lib/db/types';

export async function GET(request: NextRequest) {
  try {
    const caller = getAuthUser(request);
    const { searchParams } = new URL(request.url);

    const targetUserId =
      searchParams.get('user_id') || (caller ? caller.id : 'usr-student-1');
    const subjectId = searchParams.get('subject_id');

    const accessCheck = validateProgressAccess(caller, targetUserId);
    if (!accessCheck.allowed) {
      return apiError(
        'ACCESS_DENIED',
        accessCheck.errorReason || 'Access denied',
        accessCheck.statusCode
      );
    }

    let sessions = dbStore.studySessions.filter((s) => s.user_id === targetUserId);
    if (subjectId) {
      sessions = sessions.filter((s) => s.subject_id === subjectId);
    }

    const totalMinutes = sessions.reduce((acc, s) => acc + s.duration_minutes, 0);

    return apiSuccess({
      user_id: targetUserId,
      total_sessions: sessions.length,
      total_minutes: totalMinutes,
      sessions,
    });
  } catch (err: unknown) {
    return apiError(
      'INTERNAL_ERROR',
      'Failed to retrieve study sessions',
      500,
      err instanceof Error ? err.message : undefined
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const caller = getAuthUser(request);
    const json = await request.json().catch(() => null);

    const parseResult = StudySessionCreateSchema.safeParse(json);
    if (!parseResult.success) {
      return apiError(
        'VALIDATION_ERROR',
        'Invalid study session payload',
        400,
        parseResult.error.format()
      );
    }

    const targetUserId =
      (json && typeof json.user_id === 'string' ? json.user_id : null) ||
      (caller ? caller.id : 'usr-student-1');

    const accessCheck = validateProgressAccess(caller, targetUserId);
    if (!accessCheck.allowed) {
      return apiError(
        'ACCESS_DENIED',
        accessCheck.errorReason || 'Access denied',
        accessCheck.statusCode
      );
    }

    const {
      subject_id,
      duration_minutes,
      topics_covered,
      questions_practiced,
      notes_reviewed,
      started_at,
      completed_at,
    } = parseResult.data;

    const newSession: StudySession = {
      id: `session-${Date.now()}`,
      user_id: targetUserId,
      subject_id,
      duration_minutes,
      topics_covered,
      questions_practiced,
      notes_reviewed,
      started_at: started_at || new Date(Date.now() - duration_minutes * 60 * 1000).toISOString(),
      completed_at: completed_at || new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    dbStore.studySessions.unshift(newSession);

    return apiSuccess(newSession);
  } catch (err: unknown) {
    return apiError(
      'INTERNAL_ERROR',
      'Failed to record study session',
      500,
      err instanceof Error ? err.message : undefined
    );
  }
}
