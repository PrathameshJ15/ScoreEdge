import { NextRequest } from 'next/server';
import { dbStore, paginateArray } from '@/lib/db/client';
import { apiSuccess, apiError } from '@/lib/api/response';
import { PaginationQuerySchema, NoteCreateSchema } from '@/lib/api/validators';
import { getAuthUser, requireRole } from '@/lib/api/auth';
import { checkUserEntitlement } from '@/lib/payments/entitlements';
import { Note } from '@/lib/db/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get('subject_id');
    const unitId = searchParams.get('unit_id');
    const slug = searchParams.get('slug');

    const currentUser = getAuthUser(request);
    const isAdminOrReviewer = currentUser && (currentUser.role === 'ADMIN' || currentUser.role === 'REVIEWER');
    const status = searchParams.get('status');

    let notes = dbStore.notes.filter((n) => !n.deleted_at);

    if (!isAdminOrReviewer) {
      notes = notes.filter((n) => n.content_status === 'PUBLISHED');
    } else if (status) {
      notes = notes.filter((n) => n.content_status === status);
    }

    if (subjectId) {
      notes = notes.filter((n) => n.subject_id === subjectId);
    }
    if (unitId) {
      notes = notes.filter((n) => n.unit_id === unitId);
    }
    if (slug) {
      notes = notes.filter((n) => n.slug === slug);
    }

    const maskedNotes = notes.map((n) => {
      const entitlementCheck = checkUserEntitlement(currentUser, n.subject_id);
      const isUnlocked = isAdminOrReviewer || entitlementCheck.hasAccess;

      if (n.is_premium && !n.is_free_preview && !isUnlocked) {
        return {
          id: n.id,
          subject_id: n.subject_id,
          unit_id: n.unit_id,
          topic_id: n.topic_id,
          title: n.title,
          slug: n.slug,
          summary: n.summary,
          read_time_minutes: n.read_time_minutes,
          is_free_preview: false,
          is_premium: true,
          is_locked: true,
          message: 'Premium note content locked. Upgrade to Single Subject Pass (₹49) or Semester Pass (₹199) to unlock full chapter notes.',
        };
      }
      return {
        ...n,
        is_locked: false,
      };
    });

    const pagination = PaginationQuerySchema.parse({
      page: searchParams.get('page') || 1,
      limit: searchParams.get('limit') || 20,
    });

    const result = paginateArray(maskedNotes, pagination.page, pagination.limit);
    return apiSuccess(result.data, result.pagination);
  } catch (err: unknown) {
    return apiError('INTERNAL_ERROR', 'Failed to retrieve notes', 500, err instanceof Error ? err.message : undefined);
  }
}

export async function POST(request: NextRequest) {
  try {
    const authCheck = requireRole(request, ['ADMIN', 'REVIEWER']);
    if (!authCheck.authorized) {
      return apiError('FORBIDDEN', authCheck.errorReason || 'Admin or Reviewer access required', 403);
    }

    const json = await request.json().catch(() => null);
    const parseResult = NoteCreateSchema.safeParse(json);

    if (!parseResult.success) {
      return apiError('VALIDATION_ERROR', 'Invalid note payload', 400, parseResult.error.format());
    }

    const payload = parseResult.data;
    const newNote: Note = {
      id: `note-${Date.now()}`,
      subject_id: payload.subject_id,
      unit_id: payload.unit_id,
      topic_id: payload.topic_id || null,
      title: payload.title,
      slug: payload.slug,
      summary: payload.summary,
      content_body: payload.content_body,
      read_time_minutes: payload.read_time_minutes,
      is_free_preview: payload.is_free_preview,
      is_premium: payload.is_premium,
      content_status: payload.content_status,
      author_id: authCheck.user?.id || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    dbStore.notes.push(newNote);
    return apiSuccess(newNote, undefined, 201);
  } catch (err: unknown) {
    return apiError('INTERNAL_ERROR', 'Failed to create note', 500, err instanceof Error ? err.message : undefined);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authCheck = requireRole(request, ['ADMIN', 'REVIEWER']);
    if (!authCheck.authorized) {
      return apiError('FORBIDDEN', authCheck.errorReason || 'Admin or Reviewer access required', 403);
    }

    const json = await request.json().catch(() => null);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id') || json?.id;

    if (!id) {
      return apiError('VALIDATION_ERROR', 'Note ID is required', 400);
    }

    const note = dbStore.notes.find((n) => n.id === id && !n.deleted_at);
    if (!note) {
      return apiError('NOT_FOUND', 'Note not found', 404);
    }

    const parseResult = NoteCreateSchema.partial().safeParse(json);
    if (!parseResult.success) {
      return apiError('VALIDATION_ERROR', 'Invalid update parameters', 400, parseResult.error.format());
    }

    Object.assign(note, parseResult.data, { updated_at: new Date().toISOString() });
    return apiSuccess(note);
  } catch (err: unknown) {
    return apiError('INTERNAL_ERROR', 'Failed to update note', 500, err instanceof Error ? err.message : undefined);
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
      return apiError('VALIDATION_ERROR', 'Note ID is required', 400);
    }

    const note = dbStore.notes.find((n) => n.id === id);
    if (!note) {
      return apiError('NOT_FOUND', 'Note not found', 404);
    }

    note.deleted_at = new Date().toISOString();
    note.content_status = 'ARCHIVED';
    return apiSuccess({ message: 'Note archived successfully' });
  } catch (err: unknown) {
    return apiError('INTERNAL_ERROR', 'Failed to delete note', 500, err instanceof Error ? err.message : undefined);
  }
}
