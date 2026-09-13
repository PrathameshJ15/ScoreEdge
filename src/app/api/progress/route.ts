import { NextRequest } from 'next/server';
import { dbStore } from '@/lib/db/client';
import { apiSuccess, apiError } from '@/lib/api/response';
import { ProgressToggleSchema } from '@/lib/api/validators';
import { getAuthUser } from '@/lib/api/auth';
import {
  calculateStudentPersonalization,
  validateProgressAccess,
} from '@/lib/progress/personalizationEngine';
import { trackServerEvent } from '@/lib/analytics/service';

export async function GET(request: NextRequest) {
  try {
    const caller = getAuthUser(request);
    const { searchParams } = new URL(request.url);

    const requestedUserId =
      searchParams.get('user_id') || (caller ? caller.id : 'usr-student-1');
    const subjectId = searchParams.get('subject_id') || 'sub-dbms';

    // Privacy Protection: Ensure users cannot access another student's private progress
    const accessCheck = validateProgressAccess(caller, requestedUserId);
    if (!accessCheck.allowed) {
      return apiError(
        'ACCESS_DENIED',
        accessCheck.errorReason || 'Access denied',
        accessCheck.statusCode
      );
    }

    // Generate grounded personalization & actionable next steps
    const summary = calculateStudentPersonalization(requestedUserId, subjectId);

    const userProgress = dbStore.studentProgress.filter(
      (p) => p.user_id === requestedUserId && p.subject_id === subjectId
    );

    return apiSuccess({
      // Backward-compatible properties
      subject_id: subjectId,
      overall_readiness_percentage: summary.syllabus_coverage.percentage,
      completed_count: summary.syllabus_coverage.completed_topics,
      total_topics: summary.syllabus_coverage.total_topics,
      records: userProgress,

      // Rich progress & personalization payload
      syllabus_coverage: summary.syllabus_coverage,
      practice_summary: summary.practice_summary,
      weak_topics: summary.weak_topics,
      strong_topics: summary.strong_topics,
      topics_needing_revision: summary.topics_needing_revision,

      // Dashboard Priority: "What should I do next?"
      primary_next_action: summary.primary_next_action,
      secondary_recommendations: summary.secondary_recommendations,
      recent_study_sessions: summary.recent_study_sessions,
    });
  } catch (err: unknown) {
    return apiError(
      'INTERNAL_ERROR',
      'Failed to retrieve progress and recommendations',
      500,
      err instanceof Error ? err.message : undefined
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const caller = getAuthUser(request);
    const json = await request.json().catch(() => null);

    const parseResult = ProgressToggleSchema.safeParse(json);
    if (!parseResult.success) {
      return apiError(
        'VALIDATION_ERROR',
        'Invalid progress payload',
        400,
        parseResult.error.format()
      );
    }

    // If a foreign user_id was submitted in body, ensure caller is admin
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

    const { subject_id, unit_id, topic_id, item_type, item_id, is_completed } =
      parseResult.data;

    let record = dbStore.studentProgress.find(
      (p) =>
        p.user_id === targetUserId &&
        p.item_type === item_type &&
        p.item_id === item_id
    );

    if (record) {
      record.is_completed = is_completed;
      record.last_activity_at = new Date().toISOString();
      record.updated_at = new Date().toISOString();
    } else {
      record = {
        id: `prog-${Date.now()}`,
        user_id: targetUserId,
        subject_id,
        unit_id: unit_id || null,
        topic_id: topic_id || null,
        item_type,
        item_id,
        is_completed,
        last_activity_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      dbStore.studentProgress.push(record);
    }

    // Decoupled tracking for syllabus progress
    trackServerEvent('syllabus progress', {
      userId: targetUserId,
      properties: {
        subject_id,
        unit_id,
        topic_id,
        item_type,
        is_completed,
      },
      headers: request.headers,
    });

    // If student marked a question or PYQ completed, track question practiced
    if (is_completed && (item_type === 'QUESTION' || item_type === 'PYQ')) {
      trackServerEvent('question practiced', {
        userId: targetUserId,
        properties: {
          subject_id,
          unit_id,
          question_id: item_id,
        },
        headers: request.headers,
      });
    }

    return apiSuccess(record);
  } catch (err: unknown) {
    return apiError(
      'INTERNAL_ERROR',
      'Failed to update progress',
      500,
      err instanceof Error ? err.message : undefined
    );
  }
}
