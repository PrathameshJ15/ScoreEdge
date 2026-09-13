'use client';

import { AnalyticsEventType } from './types';

const SESSION_STORAGE_ANON_KEY = 'scoreedge_anon_sid';

/**
 * Generate or retrieve an ephemeral session-scoped anonymous ID.
 * This guarantees zero persistent cross-device tracking or invasive fingerprinting.
 */
export function getClientAnonymousId(): string {
  if (typeof window === 'undefined') return 'anon_server_render';

  try {
    let anonId = window.sessionStorage.getItem(SESSION_STORAGE_ANON_KEY);
    if (!anonId) {
      anonId = `vis_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
      window.sessionStorage.setItem(SESSION_STORAGE_ANON_KEY, anonId);
    }
    return anonId;
  } catch {
    return 'anon_session_unavailable';
  }
}

/**
 * Check if the user has enabled Do Not Track (DNT) or Global Privacy Control
 */
export function isClientDntEnabled(): boolean {
  if (typeof window === 'undefined') return false;

  const nav = window.navigator as unknown as {
    doNotTrack?: string;
    globalPrivacyControl?: boolean;
  };

  return (
    nav.doNotTrack === '1' ||
    nav.doNotTrack === 'yes' ||
    nav.globalPrivacyControl === true
  );
}

/**
 * Non-blocking, privacy-preserving client event tracker.
 * Dispatches via lightweight fetch / beacon to /api/analytics/events.
 */
export function trackClientProductEvent(
  eventType: AnalyticsEventType,
  properties: Record<string, unknown> = {},
  userId?: string | null
): void {
  if (typeof window === 'undefined') return;

  // Respect student privacy preference: Do Not Track
  if (isClientDntEnabled()) {
    return;
  }

  const anonymousId = getClientAnonymousId();

  const payload = {
    event_type: eventType,
    anonymous_id: anonymousId,
    user_id: userId || null,
    properties,
  };

  try {
    const serialized = JSON.stringify(payload);

    // Prefer sendBeacon for unblocked telemetry during page transitions
    if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      const blob = new Blob([serialized], { type: 'application/json' });
      const success = navigator.sendBeacon('/api/analytics/events', blob);
      if (success) return;
    }

    // Fallback to fetch with keepalive
    fetch('/api/analytics/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: serialized,
      keepalive: true,
    }).catch(() => {
      // Intentionally silent: Analytics failure must never affect student learning experience
    });
  } catch {
    // Non-blocking catch
  }
}
