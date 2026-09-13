import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/api/response';
import { calculateSubjectIntelligence } from '@/lib/intelligence/pyqEngine';
import { dbStore } from '@/lib/db/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get('subject_id') || dbStore.subjects[0]?.id || 'sub-dbms';
    const unitId = searchParams.get('unit_id');
    const priority = searchParams.get('priority');

    const intelligence = calculateSubjectIntelligence(subjectId);

    // Optional filters for scoped queries
    let filteredTopics = intelligence.topics_priority;
    if (unitId) {
      filteredTopics = filteredTopics.filter((t) => t.unit_id === unitId);
    }
    if (priority) {
      filteredTopics = filteredTopics.filter((t) => t.priority === priority);
    }

    let filteredUnits = intelligence.unit_analysis;
    if (unitId) {
      filteredUnits = filteredUnits.filter((u) => u.unit_id === unitId);
    }

    let filteredFrequency = intelligence.pyq_frequency;
    if (unitId) {
      filteredFrequency = filteredFrequency.filter((f) => f.unit_id === unitId);
    }

    const payload = {
      ...intelligence,
      topics_priority: filteredTopics,
      unit_analysis: filteredUnits,
      pyq_frequency: filteredFrequency,
    };

    return apiSuccess(payload);
  } catch (err: unknown) {
    return apiError(
      'NOT_FOUND',
      'Failed to calculate PYQ intelligence',
      404,
      err instanceof Error ? err.message : undefined
    );
  }
}
