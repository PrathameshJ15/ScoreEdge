import { NextRequest } from 'next/server';
import { dbStore, paginateArray } from '@/lib/db/client';
import { apiSuccess, apiError } from '@/lib/api/response';
import { PaginationQuerySchema, BranchCreateSchema } from '@/lib/api/validators';
import { requireRole, getAuthUser } from '@/lib/api/auth';
import { Branch } from '@/lib/db/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('include_inactive') === 'true';

    const currentUser = getAuthUser(request);
    const isAdmin = currentUser?.role === 'ADMIN';

    let branches = dbStore.branches;
    if (!isAdmin || !includeInactive) {
      branches = branches.filter((b) => b.is_active);
    }

    const pagination = PaginationQuerySchema.parse({
      page: searchParams.get('page') || 1,
      limit: searchParams.get('limit') || 20,
    });

    const result = paginateArray(branches, pagination.page, pagination.limit);
    return apiSuccess(result.data, result.pagination);
  } catch (err: unknown) {
    return apiError('INTERNAL_ERROR', 'Failed to retrieve branches', 500, err instanceof Error ? err.message : undefined);
  }
}

export async function POST(request: NextRequest) {
  try {
    const authCheck = requireRole(request, ['ADMIN']);
    if (!authCheck.authorized) {
      return apiError('FORBIDDEN', authCheck.errorReason || 'Admin access required', 403);
    }

    const json = await request.json().catch(() => null);
    const parseResult = BranchCreateSchema.safeParse(json);
    if (!parseResult.success) {
      return apiError('VALIDATION_ERROR', 'Invalid branch payload', 400, parseResult.error.format());
    }

    const payload = parseResult.data;
    const newBranch: Branch = {
      id: `branch-${Date.now()}`,
      code: payload.code.toUpperCase(),
      name: payload.name,
      description: payload.description,
      is_active: payload.is_active,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    dbStore.branches.push(newBranch);
    return apiSuccess(newBranch, undefined, 201);
  } catch (err: unknown) {
    return apiError('INTERNAL_ERROR', 'Failed to create branch', 500, err instanceof Error ? err.message : undefined);
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
      return apiError('VALIDATION_ERROR', 'Branch ID is required', 400);
    }

    const branch = dbStore.branches.find((b) => b.id === id);
    if (!branch) {
      return apiError('NOT_FOUND', 'Branch not found', 404);
    }

    const parseResult = BranchCreateSchema.partial().safeParse(json);
    if (!parseResult.success) {
      return apiError('VALIDATION_ERROR', 'Invalid update parameters', 400, parseResult.error.format());
    }

    Object.assign(branch, parseResult.data, { updated_at: new Date().toISOString() });
    return apiSuccess(branch);
  } catch (err: unknown) {
    return apiError('INTERNAL_ERROR', 'Failed to update branch', 500, err instanceof Error ? err.message : undefined);
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
      return apiError('VALIDATION_ERROR', 'Branch ID is required', 400);
    }

    const branch = dbStore.branches.find((b) => b.id === id);
    if (!branch) {
      return apiError('NOT_FOUND', 'Branch not found', 404);
    }

    branch.is_active = false;
    branch.updated_at = new Date().toISOString();
    return apiSuccess({ message: 'Branch deactivated successfully' });
  } catch (err: unknown) {
    return apiError('INTERNAL_ERROR', 'Failed to deactivate branch', 500, err instanceof Error ? err.message : undefined);
  }
}
