import { NextRequest } from 'next/server';
import { z } from 'zod';
import { apiSuccess, apiError } from '@/lib/api/response';
import { trackServerEvent } from '@/lib/analytics/service';
import { ALL_ANALYTICS_EVENT_TYPES, AnalyticsEventType } from '@/lib/analytics/types';

const ClientEventSchema = z.object({
  event_type: z.enum(ALL_ANALYTICS_EVENT_TYPES as [AnalyticsEventType, ...AnalyticsEventType[]]),
  anonymous_id: z.string().min(1).max(128).default('anon_client'),
  user_id: z.string().nullable().optional(),
  properties: z.record(z.string(), z.unknown()).default({}),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const parseResult = ClientEventSchema.safeParse(body);

    if (!parseResult.success) {
      return apiError(
        'VALIDATION_ERROR',
        'Invalid analytics event payload',
        400,
        parseResult.error.format()
      );
    }

    const { event_type, anonymous_id, user_id, properties } = parseResult.data;

    const recorded = trackServerEvent(event_type, {
      userId: user_id,
      anonymousId: anonymous_id,
      properties,
      headers: request.headers,
    });

    return apiSuccess({
      received: true,
      event_id: recorded ? recorded.id : null,
    });
  } catch (err: unknown) {
    // Return 200/safe response so client beacon never fails aggressively
    return apiSuccess({ received: false, error: err instanceof Error ? err.message : 'Unknown' });
  }
}
