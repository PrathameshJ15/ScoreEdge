import { NextRequest } from 'next/server';
import { dbStore, paginateArray } from '@/lib/db/client';
import { apiSuccess, apiError } from '@/lib/api/response';
import { PaginationQuerySchema, PatternCreateSchema } from '@/lib/api/validators';
import { requireRole, getAuthUser } from '@/lib/api/auth';
import { Pattern } from '@/lib/db/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const universityId = searchParams.get('university_id');
    const includeInactive = searchParams.get('include_inactive') === 'true';

    const currentUser = getAuthUser(request);
    const isAdmin = currentUser?.role === 'ADMIN';

    let patterns = dbStore.patterns;
    if (!isAdmin || !includeInactive) {
      patterns = patterns.filter((p) => p.is_active);
    }
    if (universityId) {
      patterns = patterns.filter((p) => p.university_id === universityId);
    }

    const pagination = PaginationQuerySchema.parse({
      page: searchParams.get('page') || 1,
      limit: searchParams.get('limit') || 20,
    });

    const result = paginateArray(patterns, pagination.page, pagination.limit);
    return apiSuccess(result.data, result.pagination);
  } catch (err: unknown) {
    return apiError('INTERNAL_ERROR', 'Failed to retrieve patterns', 500, err instanceof Error ? err.message : undefined);
  }
}

export async function POST(request: NextRequest) {
  try {
    const authCheck = requireRole(request, ['ADMIN']);
    if (!authCheck.authorized) {
      return apiError('FORBIDDEN', authCheck.errorReason || 'Admin access required', 403);
    }

    const json = await request.json().catch(() => null);
    const parseResult = PatternCreateSchema.safeParse(json);
    if (!parseResult.success) {
      return apiError('VALIDATION_ERROR', 'Invalid pattern payload', 400, parseResult.error.format());
    }

    const payload = parseResult.data;
    const newPattern: Pattern = {
      id: `pat-${Date.now()}`,
      university_id: payload.university_id,
      name: payload.name,
      code: payload.code,
      effective_year: payload.effective_year,
      is_active: payload.is_active,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    dbStore.patterns.push(newPattern);
    return apiSuccess(newPattern, undefined, 201);
  } catch (err: unknown) {
    return apiError('INTERNAL_ERROR', 'Failed to create pattern', 500, err instanceof Error ? err.message : undefined);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authCheck = requireRole(request, ['ADMIN']);
    if (!authCheck.authorized) {
      return apiError('FORBIDDEN', authCheck.errorReason || 'Admin access required', 403);
    }

    const json = await request.json().catch(() => null);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id') || json?.id;

    if (!id) {
      return apiError('VALIDATION_ERROR', 'Pattern ID is required', 400);
    }

    const pattern = dbStore.patterns.find((p) => p.id === id);
    if (!pattern) {
      return apiError('NOT_FOUND', 'Pattern not found', 404);
    }

    const parseResult = PatternCreateSchema.partial().safeParse(json);
    if (!parseResult.success) {
      return apiError('VALIDATION_ERROR', 'Invalid update parameters', 400, parseResult.error.format());
    }

    Object.assign(pattern, parseResult.data, { updated_at: new Date().toISOString() });
    return apiSuccess(pattern);
  } catch (err: unknown) {
    return apiError('INTERNAL_ERROR', 'Failed to update pattern', 500, err instanceof Error ? err.message : undefined);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authCheck = requireRole(request, ['ADMIN']);
    if (!authCheck.authorized) {
      return apiError('FORBIDDEN', authCheck.errorReason || 'Admin access required', 403);
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return apiError('VALIDATION_ERROR', 'Pattern ID is required', 400);
    }

    const pattern = dbStore.patterns.find((p) => p.id === id);
    if (!pattern) {
      return apiError('NOT_FOUND', 'Pattern not found', 404);
    }

    pattern.is_active = false;
    pattern.updated_at = new Date().toISOString();
    return apiSuccess({ message: 'Pattern deactivated successfully' });
  } catch (err: unknown) {
    return apiError('INTERNAL_ERROR', 'Failed to deactivate pattern', 500, err instanceof Error ? err.message : undefined);
  }
}
