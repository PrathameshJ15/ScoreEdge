import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/api/response';
import { getAuthUser } from '@/lib/api/auth';
import { checkUserEntitlement } from '@/lib/payments/entitlements';
import { dbStore } from '@/lib/db/client';
import {
  validateFilePayload,
  extractTextFromFile,
  chunkDocumentText,
} from '@/lib/files/processor';
import { UserStudyFile } from '@/lib/db/types';
import { trackServerEvent } from '@/lib/analytics/service';

export async function POST(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    const userId = user?.id || 'usr-student-1';
    const entitlement = user ? checkUserEntitlement(user) : { hasAccess: false };

    let filename = '';
    let mimeType = 'application/octet-stream';
    let fileBuffer: Buffer | null = null;
    let sizeBytes = 0;

    const contentType = request.headers.get('content-type') || '';

    // 1. Parse Multipart Form Data
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File | null;

      if (!file) {
        return apiError('VALIDATION_ERROR', 'No file uploaded in form data', 400);
      }

      filename = file.name;
      mimeType = file.type || 'application/octet-stream';
      sizeBytes = file.size;
      const arrayBuffer = await file.arrayBuffer();
      fileBuffer = Buffer.from(arrayBuffer);
    } else {
      // 2. Parse JSON Payload with Base64 / Text content (API & programmatic uploads)
      const json = await request.json().catch(() => null);
      if (!json || !json.filename) {
        return apiError('VALIDATION_ERROR', 'Invalid upload payload. Expected file or filename', 400);
      }

      filename = json.filename;
      mimeType = json.mimeType || 'text/plain';

      if (json.contentBase64) {
        fileBuffer = Buffer.from(json.contentBase64, 'base64');
        sizeBytes = fileBuffer.length;
      } else if (typeof json.textContent === 'string') {
        fileBuffer = Buffer.from(json.textContent, 'utf-8');
        sizeBytes = fileBuffer.length;
      } else {
        return apiError('VALIDATION_ERROR', 'Missing file content (contentBase64 or textContent required)', 400);
      }
    }

    // 3. Server-side Validation
    const validation = validateFilePayload({
      filename,
      sizeBytes,
      mimeType,
      userId,
      isPremium: entitlement.hasAccess,
    });

    if (!validation.valid) {
      return apiError('FILE_VALIDATION_ERROR', validation.error || 'File validation failed', 400);
    }

    // 4. Create Initial UserStudyFile Record (UPLOADING / PROCESSING)
    const fileId = `file-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const ext = filename.split('.').pop()?.toLowerCase() || 'txt';

    const newFile: UserStudyFile = {
      id: fileId,
      user_id: userId,
      filename,
      file_type: ext,
      file_size_bytes: sizeBytes,
      mime_type: mimeType,
      status: 'PROCESSING',
      chunks_count: 0,
      ocr_applied: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    dbStore.userStudyFiles.unshift(newFile);

    // Track upload started
    trackServerEvent('AI feature used', {
      userId,
      properties: { action: 'file_upload_started', fileId, filename, fileType: ext, sizeBytes },
      headers: request.headers,
    });

    // 5. Text Extraction
    try {
      const { text, ocrApplied } = await extractTextFromFile(fileBuffer, filename, mimeType);
      newFile.extracted_text = text;
      newFile.ocr_applied = ocrApplied;

      // 6. Semantic Chunking
      const chunks = chunkDocumentText(text, fileId, userId);
      dbStore.studyFileChunks.push(...chunks);

      newFile.chunks_count = chunks.length;
      newFile.status = 'READY';
      newFile.updated_at = new Date().toISOString();

      trackServerEvent('AI feature used', {
        userId,
        properties: { action: 'file_upload_completed', fileId, filename, chunksCount: chunks.length, ocrApplied },
        headers: request.headers,
      });

      return apiSuccess({
        file: newFile,
        message: 'Study material uploaded, extracted, and indexed successfully.',
      });
    } catch (err: unknown) {
      newFile.status = 'ERROR';
      newFile.error_message = err instanceof Error ? err.message : 'Text extraction failed';
      newFile.updated_at = new Date().toISOString();

      trackServerEvent('AI feature used', {
        userId,
        properties: { action: 'file_processing_failed', fileId, filename, error: newFile.error_message },
        headers: request.headers,
      });

      return apiError(
        'FILE_PROCESSING_ERROR',
        `Failed to extract text from file: ${newFile.error_message}`,
        500
      );
    }
  } catch (err: unknown) {
    return apiError(
      'INTERNAL_ERROR',
      'An unexpected error occurred during file upload processing',
      500,
      err instanceof Error ? err.message : undefined
    );
  }
}
