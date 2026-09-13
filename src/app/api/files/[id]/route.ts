import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/api/response';
import { getAuthUser } from '@/lib/api/auth';
import { dbStore } from '@/lib/db/client';
import { trackServerEvent } from '@/lib/analytics/service';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getAuthUser(request);
    const userId = user?.id || 'usr-student-1';
    const fileId = params.id;

    const file = dbStore.userStudyFiles.find(
      (f) => f.id === fileId && !f.deleted_at
    );

    if (!file) {
      return apiError('NOT_FOUND', 'File not found or already deleted', 404);
    }

    // Security check: Must belong to user (or admin)
    if (file.user_id !== userId && user?.role !== 'ADMIN') {
      return apiError('FORBIDDEN', 'You do not have permission to delete this file', 403);
    }

    // Soft delete file
    file.deleted_at = new Date().toISOString();
    file.updated_at = new Date().toISOString();

    // Remove file chunks from retrieval pool
    dbStore.studyFileChunks = dbStore.studyFileChunks.filter(
      (c) => c.file_id !== fileId
    );

    trackServerEvent('AI feature used', {
      userId,
      properties: { action: 'file_deleted', fileId, filename: file.filename },
      headers: request.headers,
    });

    return apiSuccess({
      message: 'File and indexed chunks removed successfully',
      deleted_file_id: fileId,
    });
  } catch (err: unknown) {
    return apiError(
      'INTERNAL_ERROR',
      'Failed to delete study material',
      500,
      err instanceof Error ? err.message : undefined
    );
  }
}
