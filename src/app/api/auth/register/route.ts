import { NextRequest } from 'next/server';
import { dbStore } from '@/lib/db/client';
import { apiSuccess, apiError } from '@/lib/api/response';
import { hashPassword, createAuthToken, getAuthUser } from '@/lib/api/auth';
import { RegisterRequestSchema } from '@/lib/api/validators';
import { User } from '@/lib/db/types';
import { trackServerEvent } from '@/lib/analytics/service';

export async function POST(request: NextRequest) {
  try {
    const json = await request.json().catch(() => null);
    const parseResult = RegisterRequestSchema.safeParse(json);

    if (!parseResult.success) {
      return apiError('VALIDATION_ERROR', 'Invalid registration parameters', 400, parseResult.error.format());
    }

    const {
      email,
      password,
      full_name,
      role,
      university = 'Savitribai Phule Pune University (SPPU)',
      college_name,
      department = 'Computer Engineering',
      branch_code = 'COMP',
      academic_year = 'SE',
      year_number = 2,
      semester_number = 4,
      pattern = '2024 Pattern (NEP)',
      target_sgpa = 9.0,
      backlog_subjects = [],
    } = parseResult.data;

    // Security Gate: Self-registration for elevated roles (ADMIN, REVIEWER) is strictly forbidden
    // Only existing administrators can register or provision admin/reviewer accounts
    const caller = getAuthUser(request);
    const isCallerAdmin = caller && caller.role === 'ADMIN';

    if (role && role !== 'STUDENT' && !isCallerAdmin) {
      return apiError(
        'FORBIDDEN',
        'Self-registration as administrator or reviewer is forbidden. Contact system admin.',
        403
      );
    }

    const assignedRole = isCallerAdmin && role ? role : 'STUDENT';

    // Check if user already exists
    const existing = dbStore.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return apiError('USER_EXISTS', 'A user with this email already exists', 409);
    }

    const newUser: User = {
      id: `usr-${Date.now()}`,
      email: email.toLowerCase(),
      password_hash: hashPassword(password),
      full_name,
      role: assignedRole,
      department,
      branch_code,
      academic_year,
      year_number,
      semester_number,
      pattern,
      target_sgpa,
      university,
      college_name: college_name || null,
      backlog_subjects_json: JSON.stringify(backlog_subjects),
      avatar_url: null,
      email_verified: false,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    dbStore.users.push(newUser);

    try {
      const { prisma, isDatabaseConfigured } = await import('@/lib/prisma');
      if (isDatabaseConfigured()) {
        await prisma.user.create({
          data: {
            id: newUser.id,
            email: newUser.email,
            passwordHash: newUser.password_hash,
            fullName: newUser.full_name,
            role: newUser.role as any,
            department: newUser.department,
            branchCode: newUser.branch_code,
            academicYear: newUser.academic_year,
            yearNumber: newUser.year_number,
            semesterNumber: newUser.semester_number,
            pattern: newUser.pattern,
            targetSgpa: newUser.target_sgpa,
            university: newUser.university,
            collegeName: newUser.college_name,
            backlogSubjectsJson: newUser.backlog_subjects_json,
            avatarUrl: newUser.avatar_url,
            emailVerified: newUser.email_verified,
            isActive: newUser.is_active,
          },
        });
      }
    } catch (err) {
      console.warn('[Prisma Register Fallback]:', err);
    }

    // Decoupled, privacy-preserving event tracking (no raw PII)
    trackServerEvent('signup', {
      userId: newUser.id,
      properties: { role: newUser.role, branch: branch_code, year: academic_year },
      headers: request.headers,
    });

    const token = createAuthToken({ id: newUser.id, email: newUser.email, role: newUser.role });

    const response = apiSuccess(
      {
        user: {
          id: newUser.id,
          email: newUser.email,
          full_name: newUser.full_name,
          role: newUser.role,
          department: newUser.department,
          branch_code: newUser.branch_code,
          academic_year: newUser.academic_year,
          year_number: newUser.year_number,
          semester_number: newUser.semester_number,
          pattern: newUser.pattern,
          target_sgpa: newUser.target_sgpa,
          university: newUser.university,
          college_name: newUser.college_name,
          backlog_subjects_json: newUser.backlog_subjects_json,
        },
        token,
      },
      undefined,
      201
    );

    response.cookies.set('scoreedge_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (err: unknown) {
    return apiError('INTERNAL_ERROR', 'Failed to register user', 500, err instanceof Error ? err.message : undefined);
  }
}
