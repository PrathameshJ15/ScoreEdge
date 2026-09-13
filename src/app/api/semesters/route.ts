import { NextRequest } from 'next/server';
import { dbStore, paginateArray } from '@/lib/db/client';
import { apiSuccess, apiError } from '@/lib/api/response';
import { PaginationQuerySchema, SemesterCreateSchema } from '@/lib/api/validators';
import { requireRole, getAuthUser } from '@/lib/api/auth';
import { Semester } from '@/lib/db/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const academicYearId = searchParams.get('academic_year_id');
    const includeInactive = searchParams.get('include_inactive') === 'true';

    const currentUser = getAuthUser(request);
    const isAdmin = currentUser?.role === 'ADMIN';

    let semesters = dbStore.semesters;
    if (!isAdmin || !includeInactive) {
      semesters = semesters.filter((s) => s.is_active);
    }
    if (academicYearId) {
      semesters = semesters.filter((s) => s.academic_year_id === academicYearId);
    }

    const pagination = PaginationQuerySchema.parse({
      page: searchParams.get('page') || 1,
      limit: searchParams.get('limit') || 20,
    });

    const result = paginateArray(semesters, pagination.page, pagination.limit);
    return apiSuccess(result.data, result.pagination);
  } catch (err: unknown) {
    return apiError('INTERNAL_ERROR', 'Failed to retrieve semesters', 500, err instanceof Error ? err.message : undefined);
  }
}

export async function POST(request: NextRequest) {
  try {
    const authCheck = requireRole(request, ['ADMIN']);
    if (!authCheck.authorized) {
      return apiError('FORBIDDEN', authCheck.errorReason || 'Admin access required', 403);
    }

    const json = await request.json().catch(() => null);
    const parseResult = SemesterCreateSchema.safeParse(json);
    if (!parseResult.success) {
      return apiError('VALIDATION_ERROR', 'Invalid semester payload', 400, parseResult.error.format());
    }

    const payload = parseResult.data;
    const newSem: Semester = {
      id: `sem-${Date.now()}`,
      academic_year_id: payload.academic_year_id,
      semester_number: payload.semester_number,
      name: payload.name,
      is_active: payload.is_active,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    dbStore.semesters.push(newSem);
    return apiSuccess(newSem, undefined, 201);
  } catch (err: unknown) {
    return apiError('INTERNAL_ERROR', 'Failed to create semester', 500, err instanceof Error ? err.message : undefined);
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
      return apiError('VALIDATION_ERROR', 'Semester ID is required', 400);
    }

    const sem = dbStore.semesters.find((s) => s.id === id);
    if (!sem) {
      return apiError('NOT_FOUND', 'Semester not found', 404);
    }

    const parseResult = SemesterCreateSchema.partial().safeParse(json);
    if (!parseResult.success) {
      return apiError('VALIDATION_ERROR', 'Invalid update parameters', 400, parseResult.error.format());
    }

    Object.assign(sem, parseResult.data, { updated_at: new Date().toISOString() });
    return apiSuccess(sem);
  } catch (err: unknown) {
    return apiError('INTERNAL_ERROR', 'Failed to update semester', 500, err instanceof Error ? err.message : undefined);
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
      return apiError('VALIDATION_ERROR', 'Semester ID is required', 400);
    }

    const sem = dbStore.semesters.find((s) => s.id === id);
    if (!sem) {
      return apiError('NOT_FOUND', 'Semester not found', 404);
    }

    sem.is_active = false;
    sem.updated_at = new Date().toISOString();
    return apiSuccess({ message: 'Semester deactivated successfully' });
  } catch (err: unknown) {
    return apiError('INTERNAL_ERROR', 'Failed to deactivate semester', 500, err instanceof Error ? err.message : undefined);
  }
}
