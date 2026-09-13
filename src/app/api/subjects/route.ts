import { NextRequest } from 'next/server';
import { dbStore, paginateArray } from '@/lib/db/client';
import { apiSuccess, apiError } from '@/lib/api/response';
import { PaginationQuerySchema, SubjectCreateSchema } from '@/lib/api/validators';
import { requireRole } from '@/lib/api/auth';
import { Subject } from '@/lib/db/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const patternId = searchParams.get('pattern_id');
    const branchId = searchParams.get('branch_id');
    const semesterId = searchParams.get('semester_id');
    const query = searchParams.get('q')?.toLowerCase();

    let subjects = dbStore.subjects.filter((s) => s.is_active && !s.deleted_at);

    if (patternId) {
      subjects = subjects.filter((s) => s.pattern_id === patternId);
    }
    if (branchId) {
      subjects = subjects.filter((s) => s.branch_id === branchId);
    }
    if (semesterId) {
      subjects = subjects.filter((s) => s.semester_id === semesterId);
    }
    if (query) {
      subjects = subjects.filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          s.short_name.toLowerCase().includes(query) ||
          s.code.includes(query)
      );
    }

    const pagination = PaginationQuerySchema.parse({
      page: searchParams.get('page') || 1,
      limit: searchParams.get('limit') || 20,
    });

    const result = paginateArray(subjects, pagination.page, pagination.limit);
    return apiSuccess(result.data, result.pagination);
  } catch (err: unknown) {
    return apiError('INTERNAL_ERROR', 'Failed to retrieve subjects', 500, err instanceof Error ? err.message : undefined);
  }
}

export async function POST(request: NextRequest) {
  try {
    const authCheck = requireRole(request, ['ADMIN']);
    if (!authCheck.authorized) {
      return apiError('FORBIDDEN', authCheck.errorReason || 'Admin access required', 403);
    }

    const json = await request.json().catch(() => null);
    const parseResult = SubjectCreateSchema.safeParse(json);

    if (!parseResult.success) {
      return apiError('VALIDATION_ERROR', 'Invalid subject payload', 400, parseResult.error.format());
    }

    const payload = parseResult.data;
    const newSubject: Subject = {
      id: `sub-${payload.short_name.toLowerCase()}-${Date.now()}`,
      pattern_id: payload.pattern_id,
      branch_id: payload.branch_id,
      semester_id: payload.semester_id,
      code: payload.code,
      name: payload.name,
      short_name: payload.short_name,
      total_units: payload.total_units,
      total_credits: payload.total_credits,
      is_popular: payload.is_popular,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    dbStore.subjects.push(newSubject);
    return apiSuccess(newSubject, undefined, 201);
  } catch (err: unknown) {
    return apiError('INTERNAL_ERROR', 'Failed to create subject', 500, err instanceof Error ? err.message : undefined);
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
      return apiError('VALIDATION_ERROR', 'Subject ID is required', 400);
    }

    const subject = dbStore.subjects.find((s) => s.id === id && !s.deleted_at);
    if (!subject) {
      return apiError('NOT_FOUND', 'Subject not found', 404);
    }

    const parseResult = SubjectCreateSchema.partial().safeParse(json);
    if (!parseResult.success) {
      return apiError('VALIDATION_ERROR', 'Invalid update parameters', 400, parseResult.error.format());
    }

    Object.assign(subject, parseResult.data, { updated_at: new Date().toISOString() });
    return apiSuccess(subject);
  } catch (err: unknown) {
    return apiError('INTERNAL_ERROR', 'Failed to update subject', 500, err instanceof Error ? err.message : undefined);
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
      return apiError('VALIDATION_ERROR', 'Subject ID is required', 400);
    }

    const subject = dbStore.subjects.find((s) => s.id === id);
    if (!subject) {
      return apiError('NOT_FOUND', 'Subject not found', 404);
    }

    subject.deleted_at = new Date().toISOString();
    subject.is_active = false;
    return apiSuccess({ message: 'Subject soft-deleted successfully' });
  } catch (err: unknown) {
    return apiError('INTERNAL_ERROR', 'Failed to delete subject', 500, err instanceof Error ? err.message : undefined);
  }
}
