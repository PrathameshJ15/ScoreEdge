/**
 * ScoreEdge AI Safety, Boundary Enforcement & Operational Hardening.
 *
 * Enforces rule:
 * AI must NOT control:
 * - login
 * - payments
 * - normal CRUD
 * - syllabus browsing
 * - basic filtering
 * - countdowns
 *
 * AI should be used only where reasoning/generation adds meaningful value.
 */

export type ProhibitedAIDomain =
  | 'LOGIN_AUTH'
  | 'PAYMENTS_ENTITLEMENTS'
  | 'CONTENT_CRUD'
  | 'SYLLABUS_BROWSING'
  | 'BASIC_FILTERING'
  | 'EXAM_COUNTDOWN';

const PROHIBITED_KEYWORDS: Record<ProhibitedAIDomain, string[]> = {
  LOGIN_AUTH: ['login', 'signup', 'reset_password', 'create_token', 'authenticate_user', 'auth_session'],
  PAYMENTS_ENTITLEMENTS: ['create_order', 'verify_payment', 'grant_entitlement', 'process_refund', 'razorpay_checkout'],
  CONTENT_CRUD: ['create_subject', 'update_unit', 'delete_question', 'create_note', 'publish_content'],
  SYLLABUS_BROWSING: ['browse_syllabus_tree', 'get_unit_list', 'list_subjects', 'raw_curriculum_navigation'],
  BASIC_FILTERING: ['simple_year_filter', 'marks_range_filter', 'exact_text_search'],
  EXAM_COUNTDOWN: ['calculate_countdown', 'render_timer', 'clock_ticker'],
};

export class AIBoundaryViolationError extends Error {
  constructor(public domain: ProhibitedAIDomain, message: string) {
    super(message);
    this.name = 'AIBoundaryViolationError';
  }
}

/**
 * Validates that an incoming AI request does NOT attempt to usurp core deterministic system functions.
 */
export function validateAIBoundary(requestedAction: string): { allowed: boolean; violationDomain?: ProhibitedAIDomain } {
  if (!requestedAction) return { allowed: true };

  const normalized = requestedAction.toLowerCase().trim();

  for (const [domain, keywords] of Object.entries(PROHIBITED_KEYWORDS)) {
    for (const kw of keywords) {
      if (normalized === kw || normalized.startsWith(`${kw}:`) || normalized.includes(`action_${kw}`)) {
        return {
          allowed: false,
          violationDomain: domain as ProhibitedAIDomain,
        };
      }
    }
  }

  return { allowed: true };
}

/**
 * Strips secrets, passwords, Bearer tokens, emails, API keys, and sensitive PII from AI log payloads.
 */
export function sanitizeLogContent(payload: any): any {
  if (!payload) return payload;
  if (typeof payload !== 'object') return payload;

  const sensitiveKeys = new Set([
    'password',
    'token',
    'authorization',
    'cookie',
    'apikey',
    'api_key',
    'secret',
    'razorpay_key_secret',
    'razorpay_signature',
    'openai_api_key',
    'groq_api_key',
    'email',
    'phone',
    'whatsappnumber',
  ]);

  if (Array.isArray(payload)) {
    return payload.map((item) => sanitizeLogContent(item));
  }

  const sanitized: Record<string, any> = {};
  for (const [key, value] of Object.entries(payload)) {
    const lowerKey = key.toLowerCase();
    if (sensitiveKeys.has(lowerKey) || lowerKey.includes('secret') || lowerKey.includes('password') || lowerKey.includes('key')) {
      sanitized[key] = '[REDACTED_SENSITIVE]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeLogContent(value);
    } else if (typeof value === 'string' && (value.startsWith('Bearer ') || value.includes('eyJ'))) {
      sanitized[key] = '[REDACTED_JWT_TOKEN]';
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * In-memory sliding-window Rate Limiter for AI queries.
 * Protects server resources & prevents cloud API quota exhaustion.
 */
interface RateLimitRecord {
  timestamps: number[];
}

const rateLimitMap = new Map<string, RateLimitRecord>();

// Clean up stale rate limit entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    rateLimitMap.forEach((record, key) => {
      record.timestamps = record.timestamps.filter((ts: number) => now - ts < 60000);
      if (record.timestamps.length === 0) {
        rateLimitMap.delete(key);
      }
    });
  }, 300000);
}

export function checkAIRateLimit(
  identifier: string,
  isPremium = false
): {
  allowed: boolean;
  remaining: number;
  limit: number;
  retryAfterSeconds?: number;
} {
  const windowMs = 60 * 1000; // 1 minute window
  const limit = isPremium ? 30 : 10; // 30 req/min for premium, 10 for free
  const now = Date.now();

  let record = rateLimitMap.get(identifier);
  if (!record) {
    record = { timestamps: [] };
    rateLimitMap.set(identifier, record);
  }

  // Filter to current window
  record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);

  if (record.timestamps.length >= limit) {
    const oldest = record.timestamps[0];
    const retryAfter = Math.ceil((oldest + windowMs - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      limit,
      retryAfterSeconds: Math.max(1, retryAfter),
    };
  }

  record.timestamps.push(now);
  return {
    allowed: true,
    remaining: limit - record.timestamps.length,
    limit,
  };
}

export function resetRateLimits(): void {
  rateLimitMap.clear();
}

export interface AIOperationTelemetry {
  queryLength: number;
  subjectId?: string;
  unitId?: string;
  provider: string;
  model: string;
  latencyMs: number;
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
  groundedSourcesCount: number;
  isGrounded: boolean;
  status: 'SUCCESS' | 'FALLBACK' | 'ERROR';
  errorMessage?: string;
}

/**
 * Structured telemetry logger ensuring zero sensitive PII or credentials are logged.
 */
export function logAIOperation(telemetry: AIOperationTelemetry): void {
  const sanitized = sanitizeLogContent(telemetry);
  if (process.env.NODE_ENV !== 'test') {
    console.log('[ScoreEdge AI Telemetry]', JSON.stringify(sanitized));
  }
}
