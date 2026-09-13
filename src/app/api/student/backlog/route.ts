import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/api/response';
import { getAuthUser } from '@/lib/api/auth';
import { dbStore } from '@/lib/db/client';
import { BacklogSubjectItem } from '@/lib/backlog/backlogStore';

export async function GET(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user) {
      return apiError('UNAUTHORIZED', 'Please log in to access backlogs', 401);
    }

    let backlogs: BacklogSubjectItem[] = [];
    try {
      if (user.backlog_subjects_json) {
        backlogs = JSON.parse(user.backlog_subjects_json);
      }
    } catch {
      backlogs = [];
    }

    return apiSuccess({ backlogs });
  } catch (err: unknown) {
    return apiError('INTERNAL_ERROR', 'Failed to fetch backlogs', 500, err instanceof Error ? err.message : undefined);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user) {
      return apiError('UNAUTHORIZED', 'Please log in to add backlogs', 401);
    }

    const body = await request.json().catch(() => null);
    if (!body || !body.subjectId || !body.name) {
      return apiError('VALIDATION_ERROR', 'Subject details required', 400);
    }

    let existing: BacklogSubjectItem[] = [];
    try {
      if (user.backlog_subjects_json) {
        existing = JSON.parse(user.backlog_subjects_json);
      }
    } catch {
      existing = [];
    }

    const newBacklog: BacklogSubjectItem = {
      id: `bklg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      subjectId: body.subjectId,
      code: body.code || '210240',
      name: body.name,
      shortName: body.shortName || body.name,
      academicYear: body.academicYear || 'FE',
      semester: Number(body.semester) || 1,
      pattern: body.pattern || '2024 Pattern (NEP)',
      department: body.department || user.department || 'Computer Engineering',
      resourceScope: body.resourceScope || 'all',
      targetClearanceSession: body.targetClearanceSession || 'Nov/Dec 2026 Examination',
      readiness: body.readiness || 45,
      enrolledAt: new Date().toISOString(),
      priority: body.priority || 'CRITICAL_ATKT',
    };

    // Filter out duplicates with same code
    const updated = [newBacklog, ...existing.filter((b) => b.code !== newBacklog.code)];
    const jsonString = JSON.stringify(updated);

    // Update in-memory user
    user.backlog_subjects_json = jsonString;
    const storeUser = dbStore.users.find((u) => u.id === user.id);
    if (storeUser) {
      storeUser.backlog_subjects_json = jsonString;
    }

    // Persist to Neon DB
    try {
      const { prisma, isDatabaseConfigured } = await import('@/lib/prisma');
      if (isDatabaseConfigured()) {
        await prisma.user.update({
          where: { id: user.id },
          data: { backlogSubjectsJson: jsonString },
        });
      }
    } catch (dbErr) {
      console.warn('[Prisma Backlog Update Fallback]:', dbErr);
    }

    return apiSuccess({
      message: `${newBacklog.name} successfully added to your Backlog Workspace`,
      backlog: newBacklog,
      backlogs: updated,
    });
  } catch (err: unknown) {
    return apiError('INTERNAL_ERROR', 'Failed to add backlog', 500, err instanceof Error ? err.message : undefined);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user) {
      return apiError('UNAUTHORIZED', 'Please log in', 401);
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return apiError('VALIDATION_ERROR', 'Backlog ID required', 400);
    }

    let existing: BacklogSubjectItem[] = [];
    try {
      if (user.backlog_subjects_json) {
        existing = JSON.parse(user.backlog_subjects_json);
      }
    } catch {
      existing = [];
    }

    const updated = existing.filter((b) => b.id !== id);
    const jsonString = JSON.stringify(updated);

    user.backlog_subjects_json = jsonString;
    const storeUser = dbStore.users.find((u) => u.id === user.id);
    if (storeUser) {
      storeUser.backlog_subjects_json = jsonString;
    }

    try {
      const { prisma, isDatabaseConfigured } = await import('@/lib/prisma');
      if (isDatabaseConfigured()) {
        await prisma.user.update({
          where: { id: user.id },
          data: { backlogSubjectsJson: jsonString },
        });
      }
    } catch (dbErr) {
      console.warn('[Prisma Backlog Delete Fallback]:', dbErr);
    }

    return apiSuccess({
      message: 'Backlog subject removed',
      backlogs: updated,
    });
  } catch (err: unknown) {
    return apiError('INTERNAL_ERROR', 'Failed to remove backlog', 500, err instanceof Error ? err.message : undefined);
  }
}
