import { NextRequest } from 'next/server';
import { dbStore, paginateArray } from '@/lib/db/client';
import { apiSuccess, apiError } from '@/lib/api/response';
import { PaginationQuerySchema, AcademicYearCreateSchema } from '@/lib/api/validators';
import { requireRole, getAuthUser } from '@/lib/api/auth';
import { AcademicYear } from '@/lib/db/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const patternId = searchParams.get('pattern_id');
    const includeInactive = searchParams.get('include_inactive') === 'true';

    const currentUser = getAuthUser(request);
    const isAdmin = currentUser?.role === 'ADMIN';

    let years = dbStore.academicYears;
    if (!isAdmin || !includeInactive) {
      years = years.filter((y) => y.is_active);
    }
    if (patternId) {
      years = years.filter((y) => y.pattern_id === patternId);
    }

    const pagination = PaginationQuerySchema.parse({
      page: searchParams.get('page') || 1,
      limit: searchParams.get('limit') || 20,
    });

    const result = paginateArray(years, pagination.page, pagination.limit);
    return apiSuccess(result.data, result.pagination);
  } catch (err: unknown) {
    return apiError('INTERNAL_ERROR', 'Failed to retrieve academic years', 500, err instanceof Error ? err.message : undefined);
  }
}

export async function POST(request: NextRequest) {
  try {
    const authCheck = requireRole(request, ['ADMIN']);
    if (!authCheck.authorized) {
      return apiError('FORBIDDEN', authCheck.errorReason || 'Admin access required', 403);
    }

    const json = await request.json().catch(() => null);
    const parseResult = AcademicYearCreateSchema.safeParse(json);
    if (!parseResult.success) {
      return apiError('VALIDATION_ERROR', 'Invalid academic year payload', 400, parseResult.error.format());
    }

    const payload = parseResult.data;
    const newYear: AcademicYear = {
      id: `ay-${Date.now()}`,
      pattern_id: payload.pattern_id,
      code: payload.code,
      name: payload.name,
      year_number: payload.year_number,
      is_active: payload.is_active,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    dbStore.academicYears.push(newYear);
    return apiSuccess(newYear, undefined, 201);
  } catch (err: unknown) {
    return apiError('INTERNAL_ERROR', 'Failed to create academic year', 500, err instanceof Error ? err.message : undefined);
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
      return apiError('VALIDATION_ERROR', 'Academic Year ID is required', 400);
    }

    const year = dbStore.academicYears.find((y) => y.id === id);
    if (!year) {
      return apiError('NOT_FOUND', 'Academic Year not found', 404);
    }

    const parseResult = AcademicYearCreateSchema.partial().safeParse(json);
    if (!parseResult.success) {
      return apiError('VALIDATION_ERROR', 'Invalid update parameters', 400, parseResult.error.format());
    }

    Object.assign(year, parseResult.data, { updated_at: new Date().toISOString() });
    return apiSuccess(year);
  } catch (err: unknown) {
    return apiError('INTERNAL_ERROR', 'Failed to update academic year', 500, err instanceof Error ? err.message : undefined);
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
      return apiError('VALIDATION_ERROR', 'Academic Year ID is required', 400);
    }

    const year = dbStore.academicYears.find((y) => y.id === id);
    if (!year) {
      return apiError('NOT_FOUND', 'Academic Year not found', 404);
    }

    year.is_active = false;
    year.updated_at = new Date().toISOString();
    return apiSuccess({ message: 'Academic Year deactivated successfully' });
  } catch (err: unknown) {
    return apiError('INTERNAL_ERROR', 'Failed to deactivate academic year', 500, err instanceof Error ? err.message : undefined);
  }
}
