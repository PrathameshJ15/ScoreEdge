import { NextRequest } from 'next/server';
import { dbStore, paginateArray } from '@/lib/db/client';
import { apiSuccess, apiError } from '@/lib/api/response';
import { PaginationQuerySchema, ContentSourceCreateSchema } from '@/lib/api/validators';
import { requireRole } from '@/lib/api/auth';
import { ContentSource } from '@/lib/db/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sourceType = searchParams.get('source_type');
    const query = searchParams.get('q')?.toLowerCase();

    let sources = [...dbStore.contentSources];

    if (sourceType) {
      sources = sources.filter((s) => s.source_type === sourceType);
    }
    if (query) {
      sources = sources.filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          (s.copyright_notes && s.copyright_notes.toLowerCase().includes(query))
      );
    }

    const pagination = PaginationQuerySchema.parse({
      page: searchParams.get('page') || 1,
      limit: searchParams.get('limit') || 20,
    });

    const result = paginateArray(sources, pagination.page, pagination.limit);
    return apiSuccess(result.data, result.pagination);
  } catch (err: unknown) {
    return apiError('INTERNAL_ERROR', 'Failed to retrieve content sources', 500, err instanceof Error ? err.message : undefined);
  }
}

export async function POST(request: NextRequest) {
  try {
    const authCheck = requireRole(request, ['ADMIN']);
    if (!authCheck.authorized) {
      return apiError('FORBIDDEN', authCheck.errorReason || 'Admin access required', 403);
    }

    const json = await request.json().catch(() => null);
    const parseResult = ContentSourceCreateSchema.safeParse(json);
    if (!parseResult.success) {
      return apiError('VALIDATION_ERROR', 'Invalid source payload', 400, parseResult.error.format());
    }

    const payload = parseResult.data;
    const newSource: ContentSource = {
      id: `src-${Date.now()}`,
      name: payload.name,
      source_type: payload.source_type,
      source_url: payload.source_url || null,
      license_type: payload.license_type,
      copyright_notes: payload.copyright_notes || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    dbStore.contentSources.push(newSource);
    return apiSuccess(newSource, undefined, 201);
  } catch (err: unknown) {
    return apiError('INTERNAL_ERROR', 'Failed to create content source', 500, err instanceof Error ? err.message : undefined);
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
      return apiError('VALIDATION_ERROR', 'Source ID is required', 400);
    }

    const source = dbStore.contentSources.find((s) => s.id === id);
    if (!source) {
      return apiError('NOT_FOUND', 'Content source not found', 404);
    }

    const parseResult = ContentSourceCreateSchema.partial().safeParse(json);
    if (!parseResult.success) {
      return apiError('VALIDATION_ERROR', 'Invalid update parameters', 400, parseResult.error.format());
    }

    Object.assign(source, parseResult.data, { updated_at: new Date().toISOString() });
    return apiSuccess(source);
  } catch (err: unknown) {
    return apiError('INTERNAL_ERROR', 'Failed to update content source', 500, err instanceof Error ? err.message : undefined);
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
      return apiError('VALIDATION_ERROR', 'Source ID is required', 400);
    }

    const index = dbStore.contentSources.findIndex((s) => s.id === id);
    if (index === -1) {
      return apiError('NOT_FOUND', 'Content source not found', 404);
    }

    dbStore.contentSources.splice(index, 1);
    return apiSuccess({ message: 'Content source removed successfully' });
  } catch (err: unknown) {
    return apiError('INTERNAL_ERROR', 'Failed to delete content source', 500, err instanceof Error ? err.message : undefined);
  }
}