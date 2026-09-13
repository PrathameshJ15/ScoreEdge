import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/api/response';
import { requireRole } from '@/lib/api/auth';
import { getProductAnalyticsDashboard } from '@/lib/analytics/service';

export async function GET(request: NextRequest) {
  try {
    const authCheck = requireRole(request, ['ADMIN', 'REVIEWER']);
    if (!authCheck.authorized) {
      return apiError(
        'FORBIDDEN',
        authCheck.errorReason || 'Admin or Reviewer access required to view product analytics',
        403
      );
    }

    const { searchParams } = new URL(request.url);
    const rawTimeframe = searchParams.get('timeframe') || 'all';
    const timeframe: '24h' | '7d' | '30d' | 'all' =
      rawTimeframe === '24h' || rawTimeframe === '7d' || rawTimeframe === '30d'
        ? rawTimeframe
        : 'all';

    const dashboard = getProductAnalyticsDashboard(timeframe);

    return apiSuccess(dashboard);
  } catch (err: unknown) {
    return apiError(
      'INTERNAL_ERROR',
      'Failed to generate product analytics insights',
      500,
      err instanceof Error ? err.message : undefined
    );
  }
}
