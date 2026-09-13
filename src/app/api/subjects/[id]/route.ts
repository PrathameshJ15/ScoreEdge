import { NextRequest } from 'next/server';
import { dbStore } from '@/lib/db/client';
import { apiSuccess, apiError } from '@/lib/api/response';
import { requireRole } from '@/lib/api/auth';
import { SubjectCreateSchema } from '@/lib/api/validators';
import { trackServerEvent } from '@/lib/analytics/service';
import { getAuthUser } from '@/lib/api/auth';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const subject = dbStore.subjects.find(
      (s) => (s.id === params.id || s.code === params.id || s.short_name.toLowerCase() === params.id.toLowerCase()) && !s.deleted_at
    );

    if (!subject) {
      return apiError('NOT_FOUND', 'Subject not found', 404);
    }

    const units = dbStore.units
      .filter((u) => u.subject_id === subject.id)
      .sort((a, b) => a.unit_number - b.unit_number);

    const questions = dbStore.questions.filter((q) => q.subject_id === subject.id && !q.deleted_at);
    const clusters = dbStore.questionClusters.filter((c) => c.subject_id === subject.id);
    const notes = dbStore.notes.filter((n) => n.subject_id === subject.id && !n.deleted_at);
    const quizzes = dbStore.quizzes.filter((qz) => qz.subject_id === subject.id);

    const currentUser = getAuthUser(request);
    trackServerEvent('subject opened', {
      userId: currentUser?.id,
      properties: {
        subject_id: subject.id,
        code: subject.code,
        name: subject.name,
      },
      headers: request.headers,
    });

    return apiSuccess({
      subject,
      units,
      stats: {
        total_questions: questions.length,
        total_pyqs: questions.filter((q) => q.is_pyq).length,
        total_clusters: clusters.length,
        total_notes: notes.length,
        total_quizzes: quizzes.length,
      },
    });
  } catch (err: unknown) {
    return apiError('INTERNAL_ERROR', 'Failed to retrieve subject detail', 500, err instanceof Error ? err.message : undefined);
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authCheck = requireRole(request, ['ADMIN']);
    if (!authCheck.authorized) {
      return apiError('FORBIDDEN', authCheck.errorReason || 'Admin access required', 403);
    }

    const subject = dbStore.subjects.find((s) => s.id === params.id && !s.deleted_at);
    if (!subject) {
      return apiError('NOT_FOUND', 'Subject not found', 404);
    }

    const json = await request.json().catch(() => null);
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

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authCheck = requireRole(request, ['ADMIN']);
    if (!authCheck.authorized) {
      return apiError('FORBIDDEN', authCheck.errorReason || 'Admin access required', 403);
    }

    const subject = dbStore.subjects.find((s) => s.id === params.id);
    if (!subject) {
      return apiError('NOT_FOUND', 'Subject not found', 404);
    }

    // Soft delete
    subject.deleted_at = new Date().toISOString();
    subject.is_active = false;

    return apiSuccess({ message: 'Subject soft-deleted successfully' });
  } catch (err: unknown) {
    return apiError('INTERNAL_ERROR', 'Failed to delete subject', 500, err instanceof Error ? err.message : undefined);
  }
}
