'use client';

import { useEffect } from 'react';
import { AnalyticsEventType } from '@/lib/analytics/types';
import { trackClientProductEvent } from '@/lib/analytics/client';

interface TrackPageViewProps {
  eventType?: AnalyticsEventType;
  properties?: Record<string, unknown>;
}

export function TrackPageView({
  eventType = 'visitor',
  properties = {},
}: TrackPageViewProps) {
  useEffect(() => {
    trackClientProductEvent(eventType, properties);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventType]);

  return null;
}
