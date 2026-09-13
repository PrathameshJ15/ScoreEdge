import { NextRequest } from 'next/server';
import { dbStore, paginateArray } from '@/lib/db/client';
import { apiSuccess, apiError } from '@/lib/api/response';
import { PaginationQuerySchema, UnitCreateSchema } from '@/lib/api/validators';
import { requireRole } from '@/lib/api/auth';
import { Unit } from '@/lib/db/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get('subject_id');

    let units = [...dbStore.units];
    if (subjectId) {
      units = units.filter((u) => u.subject_id === subjectId);
    }

    units.sort((a, b) => a.unit_number - b.unit_number);

    const pagination = PaginationQuerySchema.parse({
      page: searchParams.get('page') || 1,
      limit: searchParams.get('limit') || 20,
    });

    const result = paginateArray(units, pagination.page, pagination.limit);
    return apiSuccess(result.data, result.pagination);
  } catch (err: unknown) {
    return apiError('INTERNAL_ERROR', 'Failed to retrieve units', 500, err instanceof Error ? err.message : undefined);
  }
}

export async function POST(request: NextRequest) {
  try {
    const authCheck = requireRole(request, ['ADMIN']);
    if (!authCheck.authorized) {
      return apiError('FORBIDDEN', authCheck.errorReason || 'Admin access required', 403);
    }

    const json = await request.json().catch(() => null);
    const parseResult = UnitCreateSchema.safeParse(json);

    if (!parseResult.success) {
      return apiError('VALIDATION_ERROR', 'Invalid unit payload', 400, parseResult.error.format());
    }

    const payload = parseResult.data;
    const newUnit: Unit = {
      id: `unit-${Date.now()}`,
      subject_id: payload.subject_id,
      unit_number: payload.unit_number,
      title: payload.title,
      description: payload.description,
      weightage_percentage: payload.weightage_percentage,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    dbStore.units.push(newUnit);
    return apiSuccess(newUnit, undefined, 201);
  } catch (err: unknown) {
    return apiError('INTERNAL_ERROR', 'Failed to create unit', 500, err instanceof Error ? err.message : undefined);
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
      return apiError('VALIDATION_ERROR', 'Unit ID is required', 400);
    }

    const unit = dbStore.units.find((u) => u.id === id);
    if (!unit) {
      return apiError('NOT_FOUND', 'Unit not found', 404);
    }

    const parseResult = UnitCreateSchema.partial().safeParse(json);
    if (!parseResult.success) {
      return apiError('VALIDATION_ERROR', 'Invalid update parameters', 400, parseResult.error.format());
    }

    Object.assign(unit, parseResult.data, { updated_at: new Date().toISOString() });
    return apiSuccess(unit);
  } catch (err: unknown) {
    return apiError('INTERNAL_ERROR', 'Failed to update unit', 500, err instanceof Error ? err.message : undefined);
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
      return apiError('VALIDATION_ERROR', 'Unit ID is required', 400);
    }

    const index = dbStore.units.findIndex((u) => u.id === id);
    if (index === -1) {
      return apiError('NOT_FOUND', 'Unit not found', 404);
    }

    dbStore.units.splice(index, 1);
    return apiSuccess({ message: 'Unit deleted successfully' });
  } catch (err: unknown) {
    return apiError('INTERNAL_ERROR', 'Failed to delete unit', 500, err instanceof Error ? err.message : undefined);
  }
}
