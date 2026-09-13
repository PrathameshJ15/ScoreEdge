import { NextRequest } from 'next/server';
import { dbStore, paginateArray } from '@/lib/db/client';
import { apiSuccess, apiError } from '@/lib/api/response';
import { PaginationQuerySchema, UniversityCreateSchema } from '@/lib/api/validators';
import { requireRole } from '@/lib/api/auth';
import { University } from '@/lib/db/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pagination = PaginationQuerySchema.parse({
      page: searchParams.get('page') || 1,
      limit: searchParams.get('limit') || 20,
    });

    const result = paginateArray(dbStore.universities, pagination.page, pagination.limit);
    return apiSuccess(result.data, result.pagination);
  } catch (err: unknown) {
    return apiError('INTERNAL_ERROR', 'Failed to retrieve universities', 500, err instanceof Error ? err.message : undefined);
  }
}

export async function POST(request: NextRequest) {
  try {
    const authCheck = requireRole(request, ['ADMIN']);
    if (!authCheck.authorized) {
      return apiError('FORBIDDEN', authCheck.errorReason || 'Admin access required', 403);
    }

    const json = await request.json().catch(() => null);
    const parseResult = UniversityCreateSchema.safeParse(json);
    if (!parseResult.success) {
      return apiError('VALIDATION_ERROR', 'Invalid university payload', 400, parseResult.error.format());
    }

    const payload = parseResult.data;
    const newUni: University = {
      id: `uni-${Date.now()}`,
      code: payload.code.toUpperCase(),
      name: payload.name,
      state: payload.state,
      country: payload.country,
      website: payload.website || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    dbStore.universities.push(newUni);
    return apiSuccess(newUni, undefined, 201);
  } catch (err: unknown) {
    return apiError('INTERNAL_ERROR', 'Failed to create university', 500, err instanceof Error ? err.message : undefined);
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
      return apiError('VALIDATION_ERROR', 'University ID is required', 400);
    }

    const uni = dbStore.universities.find((u) => u.id === id);
    if (!uni) {
      return apiError('NOT_FOUND', 'University not found', 404);
    }

    const parseResult = UniversityCreateSchema.partial().safeParse(json);
    if (!parseResult.success) {
      return apiError('VALIDATION_ERROR', 'Invalid update parameters', 400, parseResult.error.format());
    }

    Object.assign(uni, parseResult.data, { updated_at: new Date().toISOString() });
    return apiSuccess(uni);
  } catch (err: unknown) {
    return apiError('INTERNAL_ERROR', 'Failed to update university', 500, err instanceof Error ? err.message : undefined);
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
      return apiError('VALIDATION_ERROR', 'University ID is required', 400);
    }

    const index = dbStore.universities.findIndex((u) => u.id === id);
    if (index === -1) {
      return apiError('NOT_FOUND', 'University not found', 404);
    }

    dbStore.universities.splice(index, 1);
    return apiSuccess({ message: 'University removed successfully' });
  } catch (err: unknown) {
    return apiError('INTERNAL_ERROR', 'Failed to delete university', 500, err instanceof Error ? err.message : undefined);
  }
}
