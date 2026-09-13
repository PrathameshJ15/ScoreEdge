import { NextRequest } from 'next/server';
import { dbStore, paginateArray } from '@/lib/db/client';
import { apiSuccess, apiError } from '@/lib/api/response';
import { PaginationQuerySchema, TopicCreateSchema } from '@/lib/api/validators';
import { requireRole, getAuthUser } from '@/lib/api/auth';
import { trackServerEvent } from '@/lib/analytics/service';
import { Topic, PriorityLevel } from '@/lib/db/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get('subject_id');
    const unitId = searchParams.get('unit_id');
    const importance = searchParams.get('importance') as PriorityLevel | null;

    let topics = [...dbStore.topics];
    if (subjectId) {
      const subjectUnitIds = new Set(dbStore.units.filter((u) => u.subject_id === subjectId).map((u) => u.id));
      topics = topics.filter((t) => subjectUnitIds.has(t.unit_id));
    }
    if (unitId) {
      topics = topics.filter((t) => t.unit_id === unitId);
    }
    if (importance) {
      topics = topics.filter((t) => t.importance_level === importance);
    }

    topics.sort((a, b) => a.order_index - b.order_index);

    if (unitId || searchParams.get('topic_id')) {
      const caller = getAuthUser(request);
      trackServerEvent('topic opened', {
        userId: caller?.id,
        properties: {
          unit_id: unitId,
          topic_id: searchParams.get('topic_id'),
          subject_id: subjectId,
        },
        headers: request.headers,
      });
    }

    const pagination = PaginationQuerySchema.parse({
      page: searchParams.get('page') || 1,
      limit: searchParams.get('limit') || 20,
    });

    const result = paginateArray(topics, pagination.page, pagination.limit);
    return apiSuccess(result.data, result.pagination);
  } catch (err: unknown) {
    return apiError('INTERNAL_ERROR', 'Failed to retrieve topics', 500, err instanceof Error ? err.message : undefined);
  }
}

export async function POST(request: NextRequest) {
  try {
    const authCheck = requireRole(request, ['ADMIN', 'REVIEWER']);
    if (!authCheck.authorized) {
      return apiError('FORBIDDEN', authCheck.errorReason || 'Admin or Reviewer access required', 403);
    }

    const json = await request.json().catch(() => null);
    const parseResult = TopicCreateSchema.safeParse(json);

    if (!parseResult.success) {
      return apiError('VALIDATION_ERROR', 'Invalid topic payload', 400, parseResult.error.format());
    }

    const payload = parseResult.data;
    const newTopic: Topic = {
      id: `topic-${Date.now()}`,
      unit_id: payload.unit_id,
      title: payload.title,
      description: payload.description,
      order_index: payload.order_index,
      importance_level: payload.importance_level,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    dbStore.topics.push(newTopic);
    return apiSuccess(newTopic, undefined, 201);
  } catch (err: unknown) {
    return apiError('INTERNAL_ERROR', 'Failed to create topic', 500, err instanceof Error ? err.message : undefined);
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
      return apiError('VALIDATION_ERROR', 'Topic ID is required', 400);
    }

    const topic = dbStore.topics.find((t) => t.id === id);
    if (!topic) {
      return apiError('NOT_FOUND', 'Topic not found', 404);
    }

    const parseResult = TopicCreateSchema.partial().safeParse(json);
    if (!parseResult.success) {
      return apiError('VALIDATION_ERROR', 'Invalid update parameters', 400, parseResult.error.format());
    }

    Object.assign(topic, parseResult.data, { updated_at: new Date().toISOString() });
    return apiSuccess(topic);
  } catch (err: unknown) {
    return apiError('INTERNAL_ERROR', 'Failed to update topic', 500, err instanceof Error ? err.message : undefined);
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
      return apiError('VALIDATION_ERROR', 'Topic ID is required', 400);
    }

    const index = dbStore.topics.findIndex((t) => t.id === id);
    if (index === -1) {
      return apiError('NOT_FOUND', 'Topic not found', 404);
    }

    dbStore.topics.splice(index, 1);
    return apiSuccess({ message: 'Topic deleted successfully' });
  } catch (err: unknown) {
    return apiError('INTERNAL_ERROR', 'Failed to delete topic', 500, err instanceof Error ? err.message : undefined);
  }
}
