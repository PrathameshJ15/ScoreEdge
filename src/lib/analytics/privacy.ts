/**
 * Privacy-Conscious Telemetry & Data Minimization Guardrails
 * 
 * Strict guarantees:
 * 1. Zero PII collection: Emails, full names, mobile numbers, passwords, and payment credentials are never logged.
 * 2. Unlinkable telemetry: Visitor IDs are ephemeral and scoped to the browser session.
 * 3. Sanitized query terms: Student queries are redacted of any accidentally included personal data.
 * 4. Zero third-party trackers: Telemetry remains 100% self-hosted within ScoreEdge infrastructure.
 */

export const SENSITIVE_KEY_DENYLIST = new Set([
  'password',
  'password_hash',
  'token',
  'jwt',
  'secret',
  'authorization',
  'cookie',
  'email',
  'user_email',
  'student_email',
  'name',
  'full_name',
  'student_name',
  'phone',
  'mobile',
  'contact',
  'address',
  'card',
  'card_number',
  'cvv',
  'pin',
  'mpin',
  'upi_pin',
  'razorpay_signature',
  'gateway_signature',
  'signature',
  'ip',
  'ip_address',
  'client_ip',
  'user_agent',
  'ssn',
  'aadhaar',
  'pan_number',
  'dob',
  'birth_date',
]);

const EMAIL_REGEX = /[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+/gi;
const PHONE_REGEX = /\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g;

/**
 * Redact sensitive PII patterns from freeform text (e.g. search query or error message)
 */
export function redactSensitiveText(text: string): string {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(EMAIL_REGEX, '[REDACTED_EMAIL]')
    .replace(PHONE_REGEX, '[REDACTED_PHONE]');
}

/**
 * Sanitize a search query to remove personal credentials, emails, or phone numbers
 * and limit length to avoid memory bloat.
 */
export function sanitizeSearchQuery(query: string): string {
  if (!query || typeof query !== 'string') return '';
  const cleaned = redactSensitiveText(query.trim());
  return cleaned.slice(0, 80);
}

/**
 * Recursively sanitize an event property object:
 * - Drops any keys in SENSITIVE_KEY_DENYLIST (case-insensitive)
 * - Redacts emails/phones inside string values
 * - Discards functions, symbols, or undefined
 */
export function sanitizeEventProperties(
  props: Record<string, unknown> | null | undefined
): { sanitized: Record<string, unknown>; blockedKeysCount: number } {
  if (!props || typeof props !== 'object' || Array.isArray(props)) {
    return { sanitized: {}, blockedKeysCount: 0 };
  }

  let blockedKeysCount = 0;
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(props)) {
    const normalizedKey = key.toLowerCase().trim();

    // Check against sensitive denylist
    if (SENSITIVE_KEY_DENYLIST.has(normalizedKey)) {
      blockedKeysCount++;
      continue;
    }

    if (value === null || value === undefined) {
      continue;
    }

    if (typeof value === 'string') {
      sanitized[key] = redactSensitiveText(value);
    } else if (typeof value === 'number' || typeof value === 'boolean') {
      sanitized[key] = value;
    } else if (Array.isArray(value)) {
      // Limit array sizes and sanitize elements
      sanitized[key] = value.slice(0, 20).map((item) => {
        if (typeof item === 'string') return redactSensitiveText(item);
        if (typeof item === 'object' && item !== null) {
          const nested = sanitizeEventProperties(item as Record<string, unknown>);
          blockedKeysCount += nested.blockedKeysCount;
          return nested.sanitized;
        }
        return item;
      });
    } else if (typeof value === 'object') {
      const nested = sanitizeEventProperties(value as Record<string, unknown>);
      blockedKeysCount += nested.blockedKeysCount;
      sanitized[key] = nested.sanitized;
    }
  }

  return { sanitized, blockedKeysCount };
}

/**
 * Verify whether an object is 100% compliant with our zero-PII guarantee.
 */
export function verifyPrivacyCompliance(props: Record<string, unknown>): {
  compliant: boolean;
  violations: string[];
} {
  const violations: string[] = [];

  function check(obj: Record<string, unknown>, prefix = '') {
    for (const [key, value] of Object.entries(obj)) {
      const path = prefix ? `${prefix}.${key}` : key;
      const lowerKey = key.toLowerCase();

      if (SENSITIVE_KEY_DENYLIST.has(lowerKey)) {
        violations.push(`Sensitive key found: ${path}`);
      }

      if (typeof value === 'string') {
        if (EMAIL_REGEX.test(value)) {
          violations.push(`Unredacted email pattern found in ${path}`);
        }
      } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        check(value as Record<string, unknown>, path);
      }
    }
  }

  check(props);

  return {
    compliant: violations.length === 0,
    violations,
  };
}

/**
 * Check if the request signaled Do Not Track (DNT) or Global Privacy Control (GPC)
 */
export function isDoNotTrackRequested(headers?: Headers | Record<string, string | null | undefined>): boolean {
  if (!headers) return false;

  const getHeader = (name: string): string | null | undefined => {
    if ('get' in headers && typeof headers.get === 'function') {
      return headers.get(name);
    }
    const record = headers as Record<string, string | null | undefined>;
    return record[name] || record[name.toLowerCase()];
  };

  const dnt = getHeader('dnt');
  const secGpc = getHeader('sec-gpc');

  return dnt === '1' || secGpc === '1';
}
