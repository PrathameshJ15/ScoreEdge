import { NextRequest } from 'next/server';
import { dbStore } from '@/lib/db/client';
import { apiSuccess, apiError } from '@/lib/api/response';
import { ExamModeRecordSchema } from '@/lib/api/validators';
import { getAuthUser } from '@/lib/api/auth';
import { validateProgressAccess } from '@/lib/progress/personalizationEngine';
import { trackServerEvent } from '@/lib/analytics/service';
import { ExamModeRecord } from '@/lib/db/types';

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

    let records = dbStore.examModeRecords.filter((e) => e.user_id === targetUserId);
    if (subjectId) {
      records = records.filter((e) => e.subject_id === subjectId);
    }

    return apiSuccess({
      user_id: targetUserId,
      total_sprints: records.length,
      completed_sprints: records.filter((r) => r.status === 'COMPLETED').length,
      records,
    });
  } catch (err: unknown) {
    return apiError(
      'INTERNAL_ERROR',
      'Failed to retrieve Exam Mode completion records',
      500,
      err instanceof Error ? err.message : undefined
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const caller = getAuthUser(request);
    const json = await request.json().catch(() => null);

    const parseResult = ExamModeRecordSchema.safeParse(json);
    if (!parseResult.success) {
      return apiError(
        'VALIDATION_ERROR',
        'Invalid Exam Mode payload',
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

    const { subject_id, duration_type, total_tasks, completed_tasks, status } =
      parseResult.data;

    const completionRate = Math.round((completed_tasks / total_tasks) * 100);

    const newRecord: ExamModeRecord = {
      id: `em-rec-${Date.now()}`,
      user_id: targetUserId,
      subject_id,
      duration_type,
      total_tasks,
      completed_tasks,
      completion_rate: completionRate,
      status,
      completed_at: status === 'COMPLETED' ? new Date().toISOString() : null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    dbStore.examModeRecords.unshift(newRecord);

    const eventName = status === 'COMPLETED' ? 'Exam Mode completed' : 'Exam Mode started';
    trackServerEvent(eventName, {
      userId: targetUserId,
      properties: {
        subject_id,
        duration_type,
        total_tasks,
        completed_tasks,
        completion_rate: completionRate,
        status,
      },
      headers: request.headers,
    });

    return apiSuccess(newRecord);
  } catch (err: unknown) {
    return apiError(
      'INTERNAL_ERROR',
      'Failed to record Exam Mode completion',
      500,
      err instanceof Error ? err.message : undefined
    );
  }
}
