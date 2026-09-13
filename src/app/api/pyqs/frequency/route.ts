import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/api/response';
import { calculateSubjectIntelligence } from '@/lib/intelligence/pyqEngine';
import { dbStore } from '@/lib/db/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get('subject_id') || dbStore.subjects[0]?.id || 'sub-dbms';
    const unitId = searchParams.get('unit_id');
    const minOccurrences = searchParams.get('min_occurrences') ? Number(searchParams.get('min_occurrences')) : 1;

    const intelligence = calculateSubjectIntelligence(subjectId);
    let items = intelligence.pyq_frequency;

    if (unitId) {
      items = items.filter((item) => item.unit_id === unitId);
    }
    if (minOccurrences > 1) {
      items = items.filter((item) => item.frequency >= minOccurrences);
    }

    return apiSuccess({
      subject_id: subjectId,
      subject_name: intelligence.subject_name,
      total_papers_analyzed: intelligence.total_papers_analyzed,
      items,
      disclaimer: intelligence.disclaimer,
    });
  } catch (err: unknown) {
    return apiError(
      'NOT_FOUND',
      'Failed to retrieve PYQ frequency analysis',
      404,
      err instanceof Error ? err.message : undefined
    );
  }
}
