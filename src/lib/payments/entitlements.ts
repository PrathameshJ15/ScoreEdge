import { dbStore } from '@/lib/db/client';
import { Entitlement, Order, Product, User } from '@/lib/db/types';

export interface EntitlementCheckResult {
  hasAccess: boolean;
  accessType: 'ADMIN' | 'SEMESTER_PASS' | 'SUBJECT_PASS' | 'NONE';
  expiresAt?: string | null;
  entitlementId?: string;
  reason?: string;
}

/**
 * Server-side entitlement check for a specific user and optional subject.
 * Returns true if user is ADMIN, has active SEMESTER_ALL pass, or has active SINGLE_SUBJECT pass for the subject.
 */
export function checkUserEntitlement(
  user: User | { id: string; role?: string } | null,
  subjectId?: string | null
): EntitlementCheckResult {
  if (!user) {
    return {
      hasAccess: false,
      accessType: 'NONE',
      reason: 'Authentication required for premium content',
    };
  }

  // Administrators have full academic access
  if (user.role === 'ADMIN') {
    return {
      hasAccess: true,
      accessType: 'ADMIN',
      reason: 'Academic Administrator Clearance',
    };
  }

  const now = new Date();
  const userEntitlements = dbStore.entitlements.filter(
    (e) => e.user_id === user.id && e.is_active && (!e.expires_at || new Date(e.expires_at) > now)
  );

  // 1. Check for Semester Pass (unlocks all subjects in semester)
  const semesterPass = userEntitlements.find((e) => e.access_scope === 'SEMESTER_ALL');
  if (semesterPass) {
    return {
      hasAccess: true,
      accessType: 'SEMESTER_PASS',
      expiresAt: semesterPass.expires_at,
      entitlementId: semesterPass.id,
      reason: 'Full Semester Pass Active',
    };
  }

  // 2. Check for Single Subject Pass
  if (subjectId) {
    const subjectPass = userEntitlements.find(
      (e) => e.access_scope === 'SINGLE_SUBJECT' && e.subject_id === subjectId
    );
    if (subjectPass) {
      return {
        hasAccess: true,
        accessType: 'SUBJECT_PASS',
        expiresAt: subjectPass.expires_at,
        entitlementId: subjectPass.id,
        reason: 'Single Subject Pass Active',
      };
    }
  }

  return {
    hasAccess: false,
    accessType: 'NONE',
    reason: 'Upgrade required to unlock complete exam solutions & notes',
  };
}

/**
 * Idempotently creates an entitlement for a paid order.
 * If an entitlement already exists for this order_id, returns it without creating a duplicate.
 */
export function createEntitlementForOrder(order: Order, user: User): Entitlement {
  // Idempotency check 1: Exact order ID match
  const existingByOrder = dbStore.entitlements.find((e) => e.order_id === order.id);
  if (existingByOrder) {
    if (!existingByOrder.is_active) {
      existingByOrder.is_active = true;
      existingByOrder.updated_at = new Date().toISOString();
    }
    return existingByOrder;
  }

  const product = dbStore.products.find((p) => p.id === order.product_id);
  if (!product) {
    throw new Error(`Product not found for order ${order.id}`);
  }

  const isSemesterPass = product.product_type === 'SEMESTER_PASS';
  const scope = isSemesterPass ? 'SEMESTER_ALL' : 'SINGLE_SUBJECT';

  // 180-day semester validity (6 months)
  const expiresAt = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString();

  // Idempotency check 2: Check if user already has an active entitlement for the same scope and subject
  const existingActive = dbStore.entitlements.find(
    (e) =>
      e.user_id === user.id &&
      e.access_scope === scope &&
      (scope === 'SEMESTER_ALL' || e.subject_id === product.subject_id) &&
      e.is_active
  );

  if (existingActive) {
    // Extend expiry if existing
    existingActive.expires_at = expiresAt;
    existingActive.order_id = order.id;
    existingActive.updated_at = new Date().toISOString();
    return existingActive;
  }

  const newEntitlement: Entitlement = {
    id: `ent-${Date.now()}`,
    user_id: user.id,
    product_id: product.id,
    subject_id: product.subject_id || null,
    semester_id: product.semester_id || null,
    access_scope: scope,
    expires_at: expiresAt,
    is_active: true,
    order_id: order.id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  dbStore.entitlements.push(newEntitlement);
  return newEntitlement;
}

/**
 * Revokes all entitlements linked to an order (e.g., on refund or payment reversal).
 */
export function revokeEntitlementsForOrder(orderId: string): number {
  let count = 0;
  dbStore.entitlements.forEach((e) => {
    if (e.order_id === orderId) {
      e.is_active = false;
      e.updated_at = new Date().toISOString();
      count++;
    }
  });
  return count;
}
