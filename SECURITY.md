# ScoreEdge Production Security Architecture & Audit Report

## 1. Overview & Security Architecture

ScoreEdge is an engineering academic examination intelligence and exam preparation platform for Savitribai Phule Pune University (SPPU). The system operates on a zero-trust, server-authoritative security model:
* **Server-Authoritative Entitlements**: Client applications cannot unlock premium study resources (full model answers, 10-mark solutions, chapter notes, emergency crash plans) through local state manipulation.
* **Defense-in-Depth RBAC**: Administrative operations and data access are verified both at the Edge Middleware layer and independently inside individual API Route Handlers.
* **Cryptographic Guarantees**: Payment verifications, webhook callbacks, and session authentication tokens use constant-time cryptographic comparisons (`crypto.timingSafeEqual`) to prevent side-channel timing attacks.
* **Bounded AI Operations**: Grounded AI is sandboxed strictly to academic reasoning; deterministic workflows (authentication, payments, syllabus hierarchies, and CRUD mutations) are prohibited from AI control.

---

## 2. Threat Model & Audit Matrix

| Security Domain | Vulnerability Vector | Remediation & Production Policy | Status |
| :--- | :--- | :--- | :--- |
| **Authentication** | Timing attack on JWT HMAC signatures | Verified using `crypto.timingSafeEqual` over byte buffers. Forged tokens immediately discarded. | **VERIFIED** |
| **Authentication** | Unverified Edge Middleware token parsing | Replaced simple base64 parsing with Web Crypto `crypto.subtle` HMAC-SHA256 verification in middleware. | **VERIFIED** |
| **Authentication** | Insecure password bypass / weak hashing | All passwords use salted `scrypt` (`${salt}:${derivedKey}`); removed all hardcoded/substring bypasses in `/api/auth/login`. | **VERIFIED** |
| **Authentication** | Open redirect in OAuth callback | Sanitized `redirect` query parameter to permit only relative paths, blocking protocol-relative URLs (`//evil.com`). | **VERIFIED** |
| **Authentication** | Password reset token disclosure | Omitted `resetToken` in `/api/auth/forgot-password` in production; token dispatched only via verified external communication channels. | **VERIFIED** |
| **Authorization** | Privilege escalation via self-registration | `/api/auth/register` strictly forces `role: 'STUDENT'` unless the request is authenticated by an active administrator. | **VERIFIED** |
| **Authorization** | Student access to CMS/Admin endpoints | All `/api/admin/*` and administrative mutation endpoints enforce `requireRole(['ADMIN'])`. | **VERIFIED** |
| **Authorization** | Unauthorized payment refund execution | `/api/payments/refund` restricted strictly to administrators, checking role prior to order lookups to prevent enumeration. | **VERIFIED** |
| **Entitlements** | Paywall bypass via `/api/questions/[id]` | Server-side masking in `GET /api/questions/[id]`: unentitled users receive locked answers with stripped `key_points` and solutions. | **VERIFIED** |
| **Payments** | Gateway payment tampering | Gateway signatures verified server-side with HMAC-SHA256 against `RAZORPAY_KEY_SECRET` using timing-safe comparisons. | **VERIFIED** |
| **Webhooks** | Webhook spoofing & replay attacks | Raw body verified against `x-razorpay-signature` using `RAZORPAY_WEBHOOK_SECRET`; idempotent state transitions for orders & entitlements. | **VERIFIED** |
| **Secrets & Env** | Server secret leakage in client code | Verified no private keys (`RAZORPAY_KEY_SECRET`, `AUTH_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`) are exposed with `NEXT_PUBLIC_`. | **VERIFIED** |
| **Input Validation** | API injection & malformed payloads | Universal Zod schema validation (`safeParse`) on all mutation and query routes. | **VERIFIED** |
| **Injection / ReDoS** | Regex injection in unified search | Special regex metacharacters (`C++`, `O(n)`, `*`, `[`, `]`) escaped using `escapeRegex` before `RegExp` construction. | **VERIFIED** |
| **User Isolation** | Cross-student progress snooping | Student progress, revision history, study sessions, and exam mode records strictly isolate access by `callingUser.id === requestedUserId`. | **VERIFIED** |
| **AI Abuse** | Autonomous prompt injection / CRUD usurpation | Hard negative boundaries reject requests attempting auth, payments, raw syllabus browsing, and CRUD mutations. | **VERIFIED** |
| **Sensitive Logging** | PII and credential leakage in logs | `sanitizeLogContent` systematically redacts passwords, Bearer tokens, secrets, API keys, and phone numbers. | **VERIFIED** |
| **HTTP Headers** | Clickjacking, MIME sniffing, XSS | Production security headers configured in `next.config.js` (`X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, `HSTS`, `CSP`). | **VERIFIED** |

---

## 3. Detailed Security Implementation Decisions

### 3.1 Authentication & Session Integrity
1. **Password Storage**: Passwords are hashed using Node.js `scryptSync` with a 16-byte random salt and 64-byte key length. Stored hashes follow the format `${salt}:${derivedKey}`. Passwords are never stored in plaintext or reversible formats.
2. **Session Tokens**: JWT-equivalent compact tokens consist of `${base64url(payload)}.${hmacSha256(payload, AUTH_SECRET)}`.
3. **Timing Attack Immunity**: Verification compares signature buffers with `crypto.timingSafeEqual`, preventing byte-by-byte timing inference.
4. **Cookie Configuration**: Session cookies (`scoreedge_token`) are marked `httpOnly: true`, `sameSite: 'lax'`, `path: '/'`, and `secure: true` in production environments.

### 3.2 Authorization & Defense-in-Depth
1. **Middleware Enforcement**: `src/middleware.ts` intercepts requests matching `/admin/:path*` and `/api/admin/:path*`, cryptographically verifying token signatures and role claims.
2. **Route Handler Enforcement**: Every administrative route handler (`/api/admin/*`, `/api/subjects`, `/api/questions`, etc.) invokes `requireRole(request, ['ADMIN'])` or `requireRole(request, ['ADMIN', 'REVIEWER'])` as an independent barrier, guaranteeing security even if middleware is circumvented.
3. **Privilege Escalation Gate**: Public registration through `/api/auth/register` rejects non-student roles (`ADMIN`, `REVIEWER`) with `403 FORBIDDEN` unless called with a valid admin token.

### 3.3 Paywall & Entitlement Integrity
1. **Zero-Trust Response Payloads**: When a user queries `/api/notes`, `/api/answers`, or `/api/questions/[id]`, server code verifies user entitlements with `checkUserEntitlement(currentUser, subjectId)`.
2. **Payload Redaction**: If the content is premium and the user lacks an active pass:
   - `content_body` is completely removed from note objects.
   - `key_points`, `diagram_description`, `example_text`, and `evaluator_tips` are completely removed from answer objects.
   - `is_locked: true` and an academic upgrade message are attached.
   - Client applications receive no hidden premium content in HTML or JSON.

### 3.4 Financial & Payment Security
1. **HMAC-SHA256 Verification**: Payments submitted via `/api/payments/verify` are checked against `${razorpay_order_id}|${razorpay_payment_id}` using `RAZORPAY_KEY_SECRET`.
2. **Webhook Verification**: Incoming webhook notifications from Razorpay require `x-razorpay-signature` calculated over the raw request payload with `RAZORPAY_WEBHOOK_SECRET`.
3. **Idempotency Defense**: Duplicate order creation requests sharing an `idempotency_key` return the existing order without creating duplicate database rows or payment requests.
4. **Refund Authorization**: Financial reversals are restricted strictly to authenticated administrators.

### 3.5 Student Privacy & User Data Isolation
1. **Private Access Boundaries**: Endpoints for student progress (`/api/progress`), study sessions (`/api/progress/session`), revision records (`/api/progress/revision`), and exam mode records (`/api/progress/exam-mode`) reject cross-student queries.
2. **Enforcement Rule**: If `callingUser.id !== requestedUserId` and `callingUser.role !== 'ADMIN'`, access is terminated with `403 ACCESS_DENIED`.
3. **Order Privacy**: `/api/orders` enforces that regular students only retrieve orders where `order.user_id === user.id`.

### 3.6 Search Engine Hardening & ReDoS Prevention
1. **Input Sanitization**: Search tokens undergo character escaping via `escapeRegex()` before passing to regular expression constructors.
2. **Safe Tokenization**: Prevents runtime `SyntaxError` and catastrophic backtracking (ReDoS) when searching engineering abbreviations such as `C++`, `O(n)`, `(a+b)*`, or `[8 Marks]`.

### 3.7 AI Safety & Operational Boundaries
1. **Negative Boundaries**: `validateAIBoundary` blocks AI execution if the requested action targets core deterministic domains:
   - `LOGIN_AUTH` (login, signup, token issuance)
   - `PAYMENTS_ENTITLEMENTS` (checkout, verification, refunds)
   - `CONTENT_CRUD` (entity creation, modification, deletion)
   - `SYLLABUS_BROWSING` & `BASIC_FILTERING` (raw database navigation)
   - `EXAM_COUNTDOWN` (countdown calculations)
2. **Log Sanitization**: `sanitizeLogContent` redacts tokens, passwords, API keys, and personal identifiers before telemetry logging.
3. **Sliding-Window Rate Limiting**: AI endpoints apply rate limits (10 req/min for free students, 30 req/min for premium students) using in-memory sliding-window trackers.

---

## 4. Verification & Testing

The security architecture is verified with an automated test suite in `tests/security-audit.test.ts`:
* **25 dedicated security test specifications** covering all attack vectors.
* **215 total tests passing** across 13 test suites (`vitest run`).
* **Zero TypeScript errors** (`tsc --noEmit`).
* **Zero ESLint warnings or errors** (`next lint`).
