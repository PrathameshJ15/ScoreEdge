import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/api/response';
import { calculateSubjectIntelligence, PriorityCategory } from '@/lib/intelligence/pyqEngine';
import { dbStore } from '@/lib/db/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get('subject_id') || dbStore.subjects[0]?.id || 'sub-dbms';
    const priority = searchParams.get('priority') as PriorityCategory | null;
    const unitId = searchParams.get('unit_id');

    const intelligence = calculateSubjectIntelligence(subjectId);
    let topics = intelligence.topics_priority;

    if (priority) {
      topics = topics.filter((t) => t.priority === priority);
    }
    if (unitId) {
      topics = topics.filter((t) => t.unit_id === unitId);
    }

    return apiSuccess({
      subject_id: subjectId,
      subject_name: intelligence.subject_name,
      total_topics: topics.length,
      important_lists: intelligence.important_topic_lists,
      topics,
      disclaimer: intelligence.disclaimer,
    });
  } catch (err: unknown) {
    return apiError(
      'NOT_FOUND',
      'Failed to retrieve topic priority list',
      404,
      err instanceof Error ? err.message : undefined
    );
  }
}
