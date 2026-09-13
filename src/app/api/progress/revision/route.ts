import { NextRequest } from 'next/server';
import { dbStore } from '@/lib/db/client';
import { apiSuccess, apiError } from '@/lib/api/response';
import { RevisionRecordSchema } from '@/lib/api/validators';
import { getAuthUser } from '@/lib/api/auth';
import { validateProgressAccess } from '@/lib/progress/personalizationEngine';
import { RevisionRecord } from '@/lib/db/types';

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

    let revisions = dbStore.revisionRecords.filter((r) => r.user_id === targetUserId);
    if (subjectId) {
      revisions = revisions.filter((r) => r.subject_id === subjectId);
    }

    return apiSuccess({
      user_id: targetUserId,
      total_revisions: revisions.length,
      revisions,
    });
  } catch (err: unknown) {
    return apiError(
      'INTERNAL_ERROR',
      'Failed to retrieve revision history',
      500,
      err instanceof Error ? err.message : undefined
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const caller = getAuthUser(request);
    const json = await request.json().catch(() => null);

    const parseResult = RevisionRecordSchema.safeParse(json);
    if (!parseResult.success) {
      return apiError(
        'VALIDATION_ERROR',
        'Invalid revision payload',
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

    const { subject_id, topic_id, confidence_level } = parseResult.data;

    // Spaced repetition interval
    const intervalDays =
      confidence_level === 'CONFIDENT' ? 4 : confidence_level === 'MODERATE' ? 2 : 1;
    const nextRevisionDate = new Date(Date.now() + intervalDays * 24 * 60 * 60 * 1000).toISOString();

    let record = dbStore.revisionRecords.find(
      (r) => r.user_id === targetUserId && r.subject_id === subject_id && r.topic_id === topic_id
    );

    if (record) {
      record.revision_count += 1;
      record.confidence_level = confidence_level;
      record.last_revised_at = new Date().toISOString();
      record.next_recommended_revision_at = nextRevisionDate;
      record.updated_at = new Date().toISOString();
    } else {
      record = {
        id: `rev-${Date.now()}`,
        user_id: targetUserId,
        subject_id,
        topic_id,
        revision_count: 1,
        confidence_level,
        last_revised_at: new Date().toISOString(),
        next_recommended_revision_at: nextRevisionDate,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      dbStore.revisionRecords.push(record);
    }

    return apiSuccess(record);
  } catch (err: unknown) {
    return apiError(
      'INTERNAL_ERROR',
      'Failed to record revision event',
      500,
      err instanceof Error ? err.message : undefined
    );
  }
}
