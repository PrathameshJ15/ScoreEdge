import {
  AnalyticsEvent,
  FunnelAnalysis,
  FunnelStage,
  FunnelStepStats,
  FUNNEL_STAGES,
} from './types';

export const STUDY_ACTIVITY_EVENTS = new Set([
  'subject opened',
  'topic opened',
  'PYQ viewed',
  'question practiced',
  'quiz started',
  'quiz completed',
  'syllabus progress',
  'Exam Mode started',
  'Exam Mode completed',
  'AI feature used',
]);

/**
 * Filter events by a timeframe relative to current time.
 */
export function filterEventsByTimeframe(
  events: AnalyticsEvent[],
  timeframe: '24h' | '7d' | '30d' | 'all' = 'all'
): AnalyticsEvent[] {
  if (timeframe === 'all') return events;

  const now = Date.now();
  const durations: Record<'24h' | '7d' | '30d', number> = {
    '24h': 24 * 60 * 60 * 1000,
    '7d': 7 * 24 * 60 * 60 * 1000,
    '30d': 30 * 24 * 60 * 60 * 1000,
  };

  const cutoff = now - durations[timeframe];
  return events.filter((e) => new Date(e.created_at).getTime() >= cutoff);
}

/**
 * Calculate standard conversion funnel metrics:
 * visitor -> signup -> study activity -> premium interest -> checkout -> purchase
 */
export function calculateFunnelAnalysis(
  events: AnalyticsEvent[],
  timeframe: '24h' | '7d' | '30d' | 'all' = 'all'
): FunnelAnalysis {
  const filteredEvents = filterEventsByTimeframe(events, timeframe);

  // Group events by entity identifier (unify anonymous_id with user_id if present)
  const entityToUserIdMap = new Map<string, string>();
  for (const event of filteredEvents) {
    if (event.user_id && event.anonymous_id) {
      entityToUserIdMap.set(event.anonymous_id, event.user_id);
    }
  }

  const getCanonicalId = (e: AnalyticsEvent): string => {
    if (e.user_id) return e.user_id;
    if (e.anonymous_id && entityToUserIdMap.has(e.anonymous_id)) {
      return entityToUserIdMap.get(e.anonymous_id)!;
    }
    return e.anonymous_id || 'anonymous_unknown';
  };

  const entitiesAtStage: Record<FunnelStage, Set<string>> = {
    visitor: new Set<string>(),
    signup: new Set<string>(),
    study_activity: new Set<string>(),
    premium_interest: new Set<string>(),
    checkout: new Set<string>(),
    purchase: new Set<string>(),
  };

  for (const event of filteredEvents) {
    const entityId = getCanonicalId(event);

    // Any interaction counts as platform visitation
    entitiesAtStage.visitor.add(entityId);

    if (event.event_type === 'signup') {
      entitiesAtStage.signup.add(entityId);
    }

    if (STUDY_ACTIVITY_EVENTS.has(event.event_type)) {
      entitiesAtStage.study_activity.add(entityId);
    }

    if (event.event_type === 'premium page viewed') {
      entitiesAtStage.premium_interest.add(entityId);
    }

    if (event.event_type === 'checkout started') {
      entitiesAtStage.checkout.add(entityId);
    }

    if (event.event_type === 'payment completed') {
      entitiesAtStage.purchase.add(entityId);
    }
  }

  const totalVisitors = entitiesAtStage.visitor.size;
  const totalPurchases = entitiesAtStage.purchase.size;

  const steps: FunnelStepStats[] = [];
  let previousStageCount = totalVisitors;

  for (let i = 0; i < FUNNEL_STAGES.length; i++) {
    const config = FUNNEL_STAGES[i];
    const stageCount = entitiesAtStage[config.stage].size;

    const conversionFromPrevious =
      i === 0
        ? 100
        : previousStageCount > 0
        ? Math.round((stageCount / previousStageCount) * 1000) / 10
        : 0;

    const conversionFromTop =
      totalVisitors > 0
        ? Math.round((stageCount / totalVisitors) * 1000) / 10
        : 0;

    const dropOffCount =
      i === 0 ? 0 : Math.max(0, previousStageCount - stageCount);

    const dropOffPercent =
      i === 0
        ? 0
        : previousStageCount > 0
        ? Math.round((dropOffCount / previousStageCount) * 1000) / 10
        : 0;

    steps.push({
      stage: config.stage,
      label: config.label,
      description: config.description,
      count: stageCount,
      conversion_from_previous_percent: conversionFromPrevious,
      conversion_from_top_percent: conversionFromTop,
      drop_off_count: dropOffCount,
      drop_off_percent: dropOffPercent,
    });

    previousStageCount = stageCount;
  }

  const overallConversionRate =
    totalVisitors > 0
      ? Math.round((totalPurchases / totalVisitors) * 1000) / 10
      : 0;

  return {
    timeframe,
    total_visitors: totalVisitors,
    total_purchases: totalPurchases,
    overall_conversion_rate_percent: overallConversionRate,
    steps,
  };
}
