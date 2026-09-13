import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/api/response';
import { requireRole } from '@/lib/api/auth';
import {
  buildCurriculumHierarchyTree,
  getBranchesWithStatus,
} from '@/lib/curriculum/hierarchy';
import {
  auditCurriculumIntegrity,
  onboardUniversity,
  onboardPattern,
  onboardBranch,
  onboardAcademicYear,
  onboardSemester,
  onboardSubject,
  onboardBatchSubjectCurriculum,
  UniversityOnboardSchema,
  PatternOnboardSchema,
  BranchOnboardSchema,
  AcademicYearOnboardSchema,
  SemesterOnboardSchema,
  SubjectOnboardSchema,
  BatchSubjectCurriculumSchema,
} from '@/lib/curriculum/onboarding';

/**
 * GET /api/admin/onboarding
 * Provides curriculum tree structure, branch support status, and multi-tier integrity audit report.
 */
export async function GET(request: NextRequest) {
  try {
    const authCheck = requireRole(request, ['ADMIN', 'REVIEWER']);
    if (!authCheck.authorized) {
      return apiError('FORBIDDEN', authCheck.errorReason || 'Admin access required', 403);
    }

    const { searchParams } = new URL(request.url);
    const universityId = searchParams.get('university_id') || undefined;

    const hierarchyTree = buildCurriculumHierarchyTree(universityId);
    const branches = getBranchesWithStatus();
    const integrityAudit = auditCurriculumIntegrity();

    return apiSuccess({
      hierarchy: hierarchyTree,
      branches_status: branches,
      integrity_audit: integrityAudit,
    });
  } catch (err: unknown) {
    return apiError(
      'INTERNAL_ERROR',
      'Failed to load curriculum onboarding data',
      500,
      err instanceof Error ? err.message : undefined
    );
  }
}

/**
 * POST /api/admin/onboarding
 * Supports validated creation of any entity in the 9-tier hierarchy, or atomic batch onboarding of subject curriculum.
 */
export async function POST(request: NextRequest) {
  try {
    const authCheck = requireRole(request, ['ADMIN']);
    if (!authCheck.authorized) {
      return apiError('FORBIDDEN', authCheck.errorReason || 'Admin access required', 403);
    }

    const json = await request.json().catch(() => null);
    if (!json || typeof json !== 'object') {
      return apiError('VALIDATION_ERROR', 'Invalid JSON payload', 400);
    }

    const action = json.action;

    switch (action) {
      case 'ONBOARD_UNIVERSITY': {
        const parsed = UniversityOnboardSchema.safeParse(json.payload);
        if (!parsed.success) {
          return apiError('VALIDATION_ERROR', 'Invalid university data', 400, parsed.error.format());
        }
        const result = onboardUniversity(parsed.data);
        return apiSuccess(result, undefined, 201);
      }

      case 'ONBOARD_PATTERN': {
        const parsed = PatternOnboardSchema.safeParse(json.payload);
        if (!parsed.success) {
          return apiError('VALIDATION_ERROR', 'Invalid pattern data', 400, parsed.error.format());
        }
        const result = onboardPattern(parsed.data);
        return apiSuccess(result, undefined, 201);
      }

      case 'ONBOARD_BRANCH': {
        const parsed = BranchOnboardSchema.safeParse(json.payload);
        if (!parsed.success) {
          return apiError('VALIDATION_ERROR', 'Invalid branch data', 400, parsed.error.format());
        }
        const result = onboardBranch(parsed.data);
        return apiSuccess(result, undefined, 201);
      }

      case 'ONBOARD_ACADEMIC_YEAR': {
        const parsed = AcademicYearOnboardSchema.safeParse(json.payload);
        if (!parsed.success) {
          return apiError('VALIDATION_ERROR', 'Invalid academic year data', 400, parsed.error.format());
        }
        const result = onboardAcademicYear(parsed.data);
        return apiSuccess(result, undefined, 201);
      }

      case 'ONBOARD_SEMESTER': {
        const parsed = SemesterOnboardSchema.safeParse(json.payload);
        if (!parsed.success) {
          return apiError('VALIDATION_ERROR', 'Invalid semester data', 400, parsed.error.format());
        }
        const result = onboardSemester(parsed.data);
        return apiSuccess(result, undefined, 201);
      }

      case 'ONBOARD_SUBJECT': {
        const parsed = SubjectOnboardSchema.safeParse(json.payload);
        if (!parsed.success) {
          return apiError('VALIDATION_ERROR', 'Invalid subject data', 400, parsed.error.format());
        }
        const result = onboardSubject(parsed.data);
        return apiSuccess(result, undefined, 201);
      }

      case 'BATCH_ONBOARD_SUBJECT_CURRICULUM': {
        const parsed = BatchSubjectCurriculumSchema.safeParse(json.payload);
        if (!parsed.success) {
          return apiError('VALIDATION_ERROR', 'Invalid batch curriculum data', 400, parsed.error.format());
        }
        const result = onboardBatchSubjectCurriculum(parsed.data);
        return apiSuccess(result, undefined, 201);
      }

      default:
        return apiError(
          'VALIDATION_ERROR',
          `Unknown onboarding action: "${action}". Supported actions: ONBOARD_UNIVERSITY, ONBOARD_PATTERN, ONBOARD_BRANCH, ONBOARD_ACADEMIC_YEAR, ONBOARD_SEMESTER, ONBOARD_SUBJECT, BATCH_ONBOARD_SUBJECT_CURRICULUM`,
          400
        );
    }
  } catch (err: unknown) {
    return apiError(
      'INTERNAL_ERROR',
      'Onboarding operation failed',
      500,
      err instanceof Error ? err.message : undefined
    );
  }
}
