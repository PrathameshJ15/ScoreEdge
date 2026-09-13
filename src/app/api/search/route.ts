import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/api/response';
import { UnifiedSearchQuerySchema } from '@/lib/api/validators';
import { executeUnifiedSearch } from '@/lib/search/searchEngine';
import { trackServerEvent } from '@/lib/analytics/service';
import { sanitizeSearchQuery } from '@/lib/analytics/privacy';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const parseResult = UnifiedSearchQuerySchema.safeParse({
      q: searchParams.get('q') || '',
      subject_id: searchParams.get('subject_id') || undefined,
      unit_id: searchParams.get('unit_id') || undefined,
      university_id: searchParams.get('university_id') || undefined,
      pattern_id: searchParams.get('pattern_id') || undefined,
      branch_id: searchParams.get('branch_id') || undefined,
      academic_year_id: searchParams.get('academic_year_id') || undefined,
      semester_id: searchParams.get('semester_id') || undefined,
      category: searchParams.get('category') || 'ALL',
      priority: searchParams.get('priority') || undefined,
      marks: searchParams.get('marks') || undefined,
      limit: searchParams.get('limit') || 30,
    });

    if (!parseResult.success) {
      return apiError(
        'VALIDATION_ERROR',
        'Invalid search parameters',
        400,
        parseResult.error.format()
      );
    }

    const {
      q,
      subject_id,
      unit_id,
      university_id,
      pattern_id,
      branch_id,
      academic_year_id,
      semester_id,
      category,
      priority,
      marks,
      limit,
    } = parseResult.data;

    const results = executeUnifiedSearch(q, {
      subject_id,
      unit_id,
      university_id,
      pattern_id,
      branch_id,
      academic_year_id,
      semester_id,
      category,
      priority,
      marks,
      limit,
    });

    if (q && q.trim().length > 0) {
      trackServerEvent('search performed', {
        properties: {
          sanitized_query: sanitizeSearchQuery(q),
          subject_id,
          category,
          results_count: results.total_matches,
        },
        headers: request.headers,
      });
    }

    return apiSuccess(results);
  } catch (err: unknown) {
    return apiError(
      'INTERNAL_ERROR',
      'Search query execution failed',
      500,
      err instanceof Error ? err.message : undefined
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const json = await request.json().catch(() => ({}));

    const parseResult = UnifiedSearchQuerySchema.safeParse({
      q: json.q || '',
      subject_id: json.subject_id,
      unit_id: json.unit_id,
      university_id: json.university_id,
      pattern_id: json.pattern_id,
      branch_id: json.branch_id,
      academic_year_id: json.academic_year_id,
      semester_id: json.semester_id,
      category: json.category || 'ALL',
      priority: json.priority,
      marks: json.marks,
      limit: json.limit || 30,
    });

    if (!parseResult.success) {
      return apiError(
        'VALIDATION_ERROR',
        'Invalid search payload',
        400,
        parseResult.error.format()
      );
    }

    const {
      q,
      subject_id,
      unit_id,
      university_id,
      pattern_id,
      branch_id,
      academic_year_id,
      semester_id,
      category,
      priority,
      marks,
      limit,
    } = parseResult.data;

    // Prepared for optional vector embedding hook
    const vectorEmbedding = Array.isArray(json.vector_embedding)
      ? json.vector_embedding
      : undefined;

    const results = executeUnifiedSearch(
      q,
      {
        subject_id,
        unit_id,
        university_id,
        pattern_id,
        branch_id,
        academic_year_id,
        semester_id,
        category,
        priority,
        marks,
        limit,
      },
      vectorEmbedding ? { vectorEmbedding } : undefined
    );

    if (q && q.trim().length > 0) {
      trackServerEvent('search performed', {
        properties: {
          sanitized_query: sanitizeSearchQuery(q),
          subject_id,
          category,
          results_count: results.total_matches,
        },
        headers: request.headers,
      });
    }

    return apiSuccess(results);
  } catch (err: unknown) {
    return apiError(
      'INTERNAL_ERROR',
      'Search query execution failed',
      500,
      err instanceof Error ? err.message : undefined
    );
  }
}
