import { describe, it, expect, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { dbStore } from '../src/lib/db/client';
import {
  hashPassword,
  verifyPassword,
  createAuthToken,
  verifyAuthToken,
  createPasswordResetToken,
  verifyPasswordResetToken,
  consumePasswordResetToken,
  getAuthUser,
  requireAdmin,
} from '../src/lib/api/auth';
import { POST as registerHandler } from '../src/app/api/auth/register/route';
import { POST as loginHandler } from '../src/app/api/auth/login/route';
import { POST as logoutHandler } from '../src/app/api/auth/logout/route';
import { GET as meHandler } from '../src/app/api/auth/me/route';
import { POST as forgotPasswordHandler } from '../src/app/api/auth/forgot-password/route';
import { POST as resetPasswordHandler } from '../src/app/api/auth/reset-password/route';
import { GET as getAdminStatsHandler } from '../src/app/api/admin/route';

describe('Production Authentication & Authorization Suite', () => {
  beforeEach(() => {
    dbStore.reset();
  });

  describe('Cryptographic & Token Engine', () => {
    it('hashes passwords with unique salts using scrypt', () => {
      const password = 'SecurePassword@2026';
      const hash1 = hashPassword(password);
      const hash2 = hashPassword(password);

      expect(hash1).not.toBe(hash2); // Different salts
      expect(verifyPassword(password, hash1)).toBe(true);
      expect(verifyPassword(password, hash2)).toBe(true);
      expect(verifyPassword('WrongPassword', hash1)).toBe(false);
    });

    it('creates, signs, and verifies auth tokens correctly', () => {
      const token = createAuthToken({
        id: 'usr-student-1',
        email: 'student@sppu.ac.in',
        role: 'STUDENT',
      });

      expect(token).toBeDefined();
      const verified = verifyAuthToken(token);
      expect(verified).not.toBeNull();
      expect(verified?.id).toBe('usr-student-1');
      expect(verified?.email).toBe('student@sppu.ac.in');
      expect(verified?.role).toBe('STUDENT');
    });

    it('rejects tampered auth tokens', () => {
      const token = createAuthToken({
        id: 'usr-student-1',
        email: 'student@sppu.ac.in',
        role: 'STUDENT',
      });

      const [payload, signature] = token.split('.');
      const tampered = `${payload}.tampered_sig_${signature.slice(13)}`;
      expect(verifyAuthToken(tampered)).toBeNull();
    });
  });

  describe('Registration & Signup Flow', () => {
    it('successfully registers a new student with role STUDENT', async () => {
      const req = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: 'neha.shinde@sppu.ac.in',
          password: 'Password@2026',
          full_name: 'Neha Shinde',
          role: 'STUDENT',
        }),
      });

      const res = await registerHandler(req);
      expect(res.status).toBe(201);

      const json = await res.json();
      expect(json.data.user.email).toBe('neha.shinde@sppu.ac.in');
      expect(json.data.user.role).toBe('STUDENT');
      expect(json.data.token).toBeDefined();

      // Check cookie was set
      const cookie = res.cookies.get('scoreedge_token');
      expect(cookie).toBeDefined();
    });

    it('rejects duplicate email registrations with USER_EXISTS 409', async () => {
      const req = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: 'student@sppu.ac.in',
          password: 'Password@2026',
          full_name: 'Existing Student',
          role: 'STUDENT',
        }),
      });

      const res = await registerHandler(req);
      expect(res.status).toBe(409);
      const json = await res.json();
      expect(json.error.code).toBe('USER_EXISTS');
    });

    it('rejects invalid email or short password', async () => {
      const req = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: 'not-an-email',
          password: '123',
          full_name: 'Invalid',
        }),
      });

      const res = await registerHandler(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('Login & Logout Flow', () => {
    it('logs in student with valid credentials and sets session cookie', async () => {
      const req = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'student@sppu.ac.in',
          password: 'Student@1234',
        }),
      });

      const res = await loginHandler(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.data.user.email).toBe('student@sppu.ac.in');
      expect(json.data.user.role).toBe('STUDENT');
      expect(json.data.token).toBeDefined();

      const cookie = res.cookies.get('scoreedge_token');
      expect(cookie).toBeDefined();
      expect(cookie?.value).toBe(json.data.token);
    });

    it('logs in admin with ADMIN role', async () => {
      const req = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'admin@scoreedge.in',
          password: 'Admin@1234',
        }),
      });

      const res = await loginHandler(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data.user.role).toBe('ADMIN');
    });

    it('rejects incorrect password with 401 INVALID_CREDENTIALS', async () => {
      const req = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'student@sppu.ac.in',
          password: 'WrongPassword999',
        }),
      });

      const res = await loginHandler(req);
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.error.code).toBe('INVALID_CREDENTIALS');
    });

    it('logs out and clears session cookie', async () => {
      const res = await logoutHandler();
      expect(res.status).toBe(200);
      const cookie = res.cookies.get('scoreedge_token');
      expect(cookie?.value).toBe('');
    });
  });

  describe('Password Reset Lifecycle', () => {
    it('generates reset token, resets password, and allows login with new password', async () => {
      // 1. Request password reset
      const forgotReq = new NextRequest('http://localhost:3000/api/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email: 'student@sppu.ac.in' }),
      });

      const forgotRes = await forgotPasswordHandler(forgotReq);
      expect(forgotRes.status).toBe(200);
      const forgotJson = await forgotRes.json();
      const resetToken = forgotJson.data.resetToken;
      expect(resetToken).toBeDefined();

      // 2. Perform password reset with token
      const resetReq = new NextRequest('http://localhost:3000/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({
          token: resetToken,
          password: 'NewBrandPassword@2026',
        }),
      });

      const resetRes = await resetPasswordHandler(resetReq);
      expect(resetRes.status).toBe(200);

      // 3. Login with new password
      const loginReq = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'student@sppu.ac.in',
          password: 'NewBrandPassword@2026',
        }),
      });

      const loginRes = await loginHandler(loginReq);
      expect(loginRes.status).toBe(200);
      const loginJson = await loginRes.json();
      expect(loginJson.data.user.email).toBe('student@sppu.ac.in');

      // 4. Token cannot be reused
      const reuseReq = new NextRequest('http://localhost:3000/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({
          token: resetToken,
          password: 'AnotherPassword@2026',
        }),
      });

      const reuseRes = await resetPasswordHandler(reuseReq);
      expect(reuseRes.status).toBe(400);
    });

    it('rejects password reset with invalid or nonexistent token', async () => {
      const resetReq = new NextRequest('http://localhost:3000/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({
          token: 'invalid-nonexistent-token',
          password: 'NewPassword@2026',
        }),
      });

      const resetRes = await resetPasswordHandler(resetReq);
      expect(resetRes.status).toBe(400);
      const json = await resetRes.json();
      expect(json.error.code).toBe('INVALID_TOKEN');
    });
  });

  describe('Authorization & Role Guard Checks', () => {
    it('retrieves user profile from session cookie or bearer token via /api/auth/me', async () => {
      const token = createAuthToken({
        id: 'usr-student-1',
        email: 'student@sppu.ac.in',
        role: 'STUDENT',
      });

      const req = new NextRequest('http://localhost:3000/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const res = await meHandler(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data.user.email).toBe('student@sppu.ac.in');
      expect(json.data.user.role).toBe('STUDENT');
    });

    it('rejects unauthenticated requests to /api/auth/me with 401', async () => {
      const req = new NextRequest('http://localhost:3000/api/auth/me');
      const res = await meHandler(req);
      expect(res.status).toBe(401);
    });

    it('allows ADMIN to access admin endpoints and blocks STUDENT', async () => {
      const adminToken = createAuthToken({
        id: 'usr-admin-1',
        email: 'admin@scoreedge.in',
        role: 'ADMIN',
      });

      const studentToken = createAuthToken({
        id: 'usr-student-1',
        email: 'student@sppu.ac.in',
        role: 'STUDENT',
      });

      // Admin request
      const adminReq = new NextRequest('http://localhost:3000/api/admin', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const adminRes = await getAdminStatsHandler(adminReq);
      expect(adminRes.status).toBe(200);

      // Student request
      const studentReq = new NextRequest('http://localhost:3000/api/admin', {
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      const studentRes = await getAdminStatsHandler(studentReq);
      expect(studentRes.status).toBe(403);
    });
  });
});
