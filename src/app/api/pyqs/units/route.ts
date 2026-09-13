import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/api/response';
import { calculateSubjectIntelligence } from '@/lib/intelligence/pyqEngine';
import { dbStore } from '@/lib/db/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get('subject_id') || dbStore.subjects[0]?.id || 'sub-dbms';

    const intelligence = calculateSubjectIntelligence(subjectId);

    return apiSuccess({
      subject_id: subjectId,
      subject_name: intelligence.subject_name,
      total_papers_analyzed: intelligence.total_papers_analyzed,
      units: intelligence.unit_analysis,
      disclaimer: intelligence.disclaimer,
    });
  } catch (err: unknown) {
    return apiError(
      'NOT_FOUND',
      'Failed to retrieve unit weightage analysis',
      404,
      err instanceof Error ? err.message : undefined
    );
  }
}
