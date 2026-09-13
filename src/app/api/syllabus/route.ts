import { NextRequest } from 'next/server';
import { dbStore, paginateArray } from '@/lib/db/client';
import { apiSuccess, apiError } from '@/lib/api/response';
import { PaginationQuerySchema, SyllabusCreateSchema } from '@/lib/api/validators';
import { requireRole, getAuthUser } from '@/lib/api/auth';
import { SyllabusItem } from '@/lib/db/types';
import { getFilteredSubjects } from '@/lib/curriculum/hierarchy';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get('subject_id');
    const unitId = searchParams.get('unit_id');
    const topicId = searchParams.get('topic_id');
    const status = searchParams.get('status');
    const query = searchParams.get('q')?.toLowerCase();

    // Hierarchy parameters
    const universityId = searchParams.get('university_id') || undefined;
    const patternId = searchParams.get('pattern_id') || undefined;
    const branchId = searchParams.get('branch_id') || undefined;
    const semesterId = searchParams.get('semester_id') || undefined;

    const currentUser = getAuthUser(request);
    const isAdminOrReviewer = currentUser && (currentUser.role === 'ADMIN' || currentUser.role === 'REVIEWER');

    let items = [...dbStore.syllabusItems];

    if (!isAdminOrReviewer) {
      items = items.filter((s) => !s.content_status || s.content_status === 'PUBLISHED');
    } else if (status) {
      items = items.filter((s) => (s.content_status || 'PUBLISHED') === status);
    }

    // Hierarchy subject filtering
    if (universityId || patternId || branchId || semesterId) {
      const allowedSubjectIds = new Set(
        getFilteredSubjects({
          university_id: universityId,
          pattern_id: patternId,
          branch_id: branchId,
          semester_id: semesterId,
        }).map((s) => s.id)
      );
      const allowedUnitIds = new Set(
        dbStore.units.filter((u) => allowedSubjectIds.has(u.subject_id)).map((u) => u.id)
      );
      items = items.filter((s) => allowedUnitIds.has(s.unit_id));
    }

    if (subjectId) {
      const subjectUnitIds = new Set(dbStore.units.filter((u) => u.subject_id === subjectId).map((u) => u.id));
      items = items.filter((s) => subjectUnitIds.has(s.unit_id));
    }
    if (unitId) {
      items = items.filter((s) => s.unit_id === unitId);
    }
    if (topicId) {
      items = items.filter((s) => s.topic_id === topicId);
    }

    // Enrich syllabus items with unit, topic, and subject details
    let enriched = items.map((s) => {
      const unit = dbStore.units.find((u) => u.id === s.unit_id);
      const topic = s.topic_id ? dbStore.topics.find((t) => t.id === s.topic_id) : null;
      const subject = unit ? dbStore.subjects.find((sub) => sub.id === unit.subject_id) : null;
      return {
        ...s,
        unit: unit ? { id: unit.id, unit_number: unit.unit_number, title: unit.title } : null,
        topic: topic ? { id: topic.id, title: topic.title, importance_level: topic.importance_level } : null,
        subject: subject ? { id: subject.id, name: subject.name, short_name: subject.short_name, code: subject.code } : null,
      };
    });

    if (query) {
      enriched = enriched.filter(
        (s) =>
          s.content.toLowerCase().includes(query) ||
          (s.reference_materials && s.reference_materials.toLowerCase().includes(query)) ||
          (s.unit && s.unit.title.toLowerCase().includes(query)) ||
          (s.topic && s.topic.title.toLowerCase().includes(query))
      );
    }

    const pagination = PaginationQuerySchema.parse({
      page: searchParams.get('page') || 1,
      limit: searchParams.get('limit') || 20,
    });

    const result = paginateArray(enriched, pagination.page, pagination.limit);
    return apiSuccess(result.data, result.pagination);
  } catch (err: unknown) {
    return apiError('INTERNAL_ERROR', 'Failed to retrieve syllabus items', 500, err instanceof Error ? err.message : undefined);
  }
}

export async function POST(request: NextRequest) {
  try {
    const authCheck = requireRole(request, ['ADMIN']);
    if (!authCheck.authorized) {
      return apiError('FORBIDDEN', authCheck.errorReason || 'Admin access required', 403);
    }

    const json = await request.json().catch(() => null);
    const parseResult = SyllabusCreateSchema.safeParse(json);

    if (!parseResult.success) {
      return apiError('VALIDATION_ERROR', 'Invalid syllabus payload', 400, parseResult.error.format());
    }

    const payload = parseResult.data;
    const newItem: SyllabusItem = {
      id: `syl-${Date.now()}`,
      unit_id: payload.unit_id,
      topic_id: payload.topic_id || null,
      content: payload.content,
      reference_materials: payload.reference_materials || null,
      hours_allocated: payload.hours_allocated,
      content_status: payload.content_status || 'PUBLISHED',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    dbStore.syllabusItems.push(newItem);
    return apiSuccess(newItem, undefined, 201);
  } catch (err: unknown) {
    return apiError('INTERNAL_ERROR', 'Failed to create syllabus item', 500, err instanceof Error ? err.message : undefined);
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
      return apiError('VALIDATION_ERROR', 'Syllabus item ID is required', 400);
    }

    const item = dbStore.syllabusItems.find((s) => s.id === id);
    if (!item) {
      return apiError('NOT_FOUND', 'Syllabus item not found', 404);
    }

    const parseResult = SyllabusCreateSchema.partial().safeParse(json);
    if (!parseResult.success) {
      return apiError('VALIDATION_ERROR', 'Invalid update parameters', 400, parseResult.error.format());
    }

    Object.assign(item, parseResult.data, { updated_at: new Date().toISOString() });
    return apiSuccess(item);
  } catch (err: unknown) {
    return apiError('INTERNAL_ERROR', 'Failed to update syllabus item', 500, err instanceof Error ? err.message : undefined);
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
      return apiError('VALIDATION_ERROR', 'Syllabus item ID is required', 400);
    }

    const index = dbStore.syllabusItems.findIndex((s) => s.id === id);
    if (index === -1) {
      return apiError('NOT_FOUND', 'Syllabus item not found', 404);
    }

    dbStore.syllabusItems.splice(index, 1);
    return apiSuccess({ message: 'Syllabus item deleted successfully' });
  } catch (err: unknown) {
    return apiError('INTERNAL_ERROR', 'Failed to delete syllabus item', 500, err instanceof Error ? err.message : undefined);
  }
}
