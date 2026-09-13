import { dbStore } from '@/lib/db/client';
import {
  University,
  Pattern,
  Branch,
  AcademicYear,
  Semester,
  Subject,
  Unit,
  Topic,
  Question,
} from '@/lib/db/types';

export interface BranchWithOnboardingStatus extends Branch {
  subject_count: number;
  is_supported: boolean;
  onboarding_status: 'ACTIVE' | 'UNSUPPORTED' | 'IN_PREPARATION';
}

export interface AcademicLineage {
  university: University | null;
  pattern: Pattern | null;
  branch: Branch | null;
  academicYear: AcademicYear | null;
  semester: Semester | null;
  subject: Subject | null;
  unit?: Unit | null;
  topic?: Topic | null;
  question?: Question | null;
}

export interface SubjectFilterOptions {
  university_id?: string;
  pattern_id?: string;
  branch_id?: string;
  academic_year_id?: string;
  semester_id?: string;
  is_active?: boolean;
  has_content_only?: boolean;
}

/**
 * Resolves the full 9-tier academic ancestry:
 * University -> Pattern -> Branch -> Academic Year -> Semester -> Subject -> Unit -> Topic -> Question
 */
export function getFullAcademicLineage(target: {
  question_id?: string;
  topic_id?: string;
  unit_id?: string;
  subject_id?: string;
} | string): AcademicLineage {
  const targetId = typeof target === 'string' ? target : null;

  let question: Question | null = null;
  let topic: Topic | null = null;
  let unit: Unit | null = null;
  let subject: Subject | null = null;

  // 1. Resolve Question if provided
  const qId = targetId?.startsWith('q-') || targetId?.startsWith('ques-') ? targetId : typeof target === 'object' ? target.question_id : null;
  if (qId) {
    question = dbStore.questions.find((q) => q.id === qId) || null;
  }

  // 2. Resolve Topic if provided or from question
  const topId = typeof target === 'object' ? target.topic_id : (targetId?.startsWith('top') || targetId?.startsWith('topic') ? targetId : question?.topic_id);
  if (topId) {
    topic = dbStore.topics.find((t) => t.id === topId) || null;
  }

  // 3. Resolve Unit if provided or from question/topic
  const uId = typeof target === 'object' ? target.unit_id : (targetId?.startsWith('unit') || targetId?.startsWith('u-') ? targetId : (question?.unit_id || topic?.unit_id));
  if (uId) {
    unit = dbStore.units.find((u) => u.id === uId) || null;
  }

  // 4. Resolve Subject if provided or from unit/question
  const sId =
    (typeof target === 'object' ? target.subject_id : null) ||
    (targetId?.startsWith('sub-') || targetId === 'dbms' || targetId === 'dsa' ? targetId : null) ||
    question?.subject_id ||
    unit?.subject_id;

  if (sId) {
    subject =
      dbStore.subjects.find(
        (s) => s.id === sId || s.id === `sub-${sId}` || s.code === sId || s.short_name.toLowerCase() === sId.toLowerCase()
      ) || null;
  }

  if (!subject && unit) {
    subject = dbStore.subjects.find((s) => s.id === unit.subject_id) || null;
  }
  if (!subject && question) {
    subject = dbStore.subjects.find((s) => s.id === question.subject_id) || null;
  }

  // 5. Resolve Pattern, Branch, Semester, Academic Year, University
  const pattern = subject ? dbStore.patterns.find((p) => p.id === subject.pattern_id) || null : null;
  const university = pattern ? dbStore.universities.find((u) => u.id === pattern.university_id) || null : null;
  const branch = subject ? dbStore.branches.find((b) => b.id === subject.branch_id) || null : null;
  const semester = subject ? dbStore.semesters.find((s) => s.id === subject.semester_id) || null : null;
  const academicYear = semester ? dbStore.academicYears.find((ay) => ay.id === semester.academic_year_id) || null : null;

  return {
    university,
    pattern,
    branch,
    academicYear,
    semester,
    subject,
    unit,
    topic,
    question,
  };
}

/**
 * Retrieve all registered universities.
 */
export function getRegisteredUniversities(): University[] {
  return [...dbStore.universities];
}

/**
 * Retrieve patterns for a specific university.
 */
export function getPatternsForUniversity(universityId?: string): Pattern[] {
  if (!universityId) return [...dbStore.patterns];
  return dbStore.patterns.filter((p) => p.university_id === universityId && p.is_active);
}

/**
 * Retrieve branches with their active content status.
 * Ensures unsupported branches are NOT automatically populated with fake data.
 */
export function getBranchesWithStatus(options?: {
  universityId?: string;
  hasActiveSubjectsOnly?: boolean;
}): BranchWithOnboardingStatus[] {
  const allSubjects = dbStore.subjects.filter((s) => !s.deleted_at && s.is_active);

  return dbStore.branches
    .filter((b) => b.is_active)
    .map((b) => {
      const activeSubjects = allSubjects.filter((s) => {
        if (s.branch_id !== b.id) return false;
        if (options?.universityId) {
          const pat = dbStore.patterns.find((p) => p.id === s.pattern_id);
          if (pat?.university_id !== options.universityId) return false;
        }
        return true;
      });

      const count = activeSubjects.length;
      const isSupported = count > 0;

      return {
        ...b,
        subject_count: count,
        is_supported: isSupported,
        onboarding_status: isSupported ? ('ACTIVE' as const) : ('UNSUPPORTED' as const),
      };
    })
    .filter((b) => (options?.hasActiveSubjectsOnly ? b.is_supported : true));
}

/**
 * Retrieve academic years for a pattern.
 */
export function getAcademicYearsForPattern(patternId?: string): AcademicYear[] {
  if (!patternId) return [...dbStore.academicYears];
  return dbStore.academicYears.filter((ay) => ay.pattern_id === patternId && ay.is_active);
}

/**
 * Retrieve semesters for an academic year or pattern.
 */
export function getSemesters(academicYearId?: string): Semester[] {
  if (!academicYearId) return [...dbStore.semesters];
  return dbStore.semesters.filter((s) => s.academic_year_id === academicYearId && s.is_active);
}

/**
 * Filter subjects across the multi-tier hierarchy.
 */
export function getFilteredSubjects(filters: SubjectFilterOptions = {}): Subject[] {
  let subjects = dbStore.subjects.filter((s) => !s.deleted_at);

  if (filters.is_active !== undefined) {
    subjects = subjects.filter((s) => s.is_active === filters.is_active);
  }

  if (filters.branch_id) {
    subjects = subjects.filter((s) => s.branch_id === filters.branch_id);
  }

  if (filters.pattern_id) {
    subjects = subjects.filter((s) => s.pattern_id === filters.pattern_id);
  }

  if (filters.semester_id) {
    subjects = subjects.filter((s) => s.semester_id === filters.semester_id);
  }

  if (filters.academic_year_id) {
    const matchingSemIds = new Set(
      dbStore.semesters.filter((sem) => sem.academic_year_id === filters.academic_year_id).map((sem) => sem.id)
    );
    subjects = subjects.filter((s) => matchingSemIds.has(s.semester_id));
  }

  if (filters.university_id) {
    const matchingPatternIds = new Set(
      dbStore.patterns.filter((pat) => pat.university_id === filters.university_id).map((pat) => pat.id)
    );
    subjects = subjects.filter((s) => matchingPatternIds.has(s.pattern_id));
  }

  if (filters.has_content_only) {
    // Only subjects that have at least one unit or question
    const subjectIdsWithUnits = new Set(dbStore.units.map((u) => u.subject_id));
    subjects = subjects.filter((s) => subjectIdsWithUnits.has(s.id));
  }

  return subjects;
}

/**
 * Get full nested curriculum tree for a university/pattern
 */
export function buildCurriculumHierarchyTree(universityId: string = 'uni-sppu') {
  const university = dbStore.universities.find((u) => u.id === universityId) || dbStore.universities[0];
  if (!university) return null;

  const patterns = dbStore.patterns.filter((p) => p.university_id === university.id);

  return {
    university: {
      id: university.id,
      code: university.code,
      name: university.name,
      state: university.state,
      country: university.country,
    },
    patterns: patterns.map((pattern) => {
      const academicYears = dbStore.academicYears.filter((ay) => ay.pattern_id === pattern.id);
      const branches = getBranchesWithStatus({ universityId: university.id });

      return {
        id: pattern.id,
        code: pattern.code,
        name: pattern.name,
        effective_year: pattern.effective_year,
        academic_years: academicYears.map((ay) => {
          const semesters = dbStore.semesters.filter((sem) => sem.academic_year_id === ay.id);
          return {
            id: ay.id,
            code: ay.code,
            name: ay.name,
            year_number: ay.year_number,
            semesters: semesters.map((sem) => {
              const subjects = dbStore.subjects.filter(
                (sub) => sub.pattern_id === pattern.id && sub.semester_id === sem.id && !sub.deleted_at
              );
              return {
                id: sem.id,
                name: sem.name,
                semester_number: sem.semester_number,
                subjects: subjects.map((sub) => {
                  const units = dbStore.units
                    .filter((u) => u.subject_id === sub.id)
                    .sort((a, b) => a.unit_number - b.unit_number);
                  return {
                    id: sub.id,
                    code: sub.code,
                    name: sub.name,
                    short_name: sub.short_name,
                    branch_id: sub.branch_id,
                    total_units: sub.total_units,
                    units_count: units.length,
                    units: units.map((u) => ({
                      id: u.id,
                      unit_number: u.unit_number,
                      title: u.title,
                      topics_count: dbStore.topics.filter((t) => t.unit_id === u.id).length,
                      questions_count: dbStore.questions.filter((q) => q.unit_id === u.id && !q.deleted_at).length,
                    })),
                  };
                }),
              };
            }),
          };
        }),
        supported_branches: branches.filter((b) => b.is_supported).map((b) => ({ id: b.id, code: b.code, name: b.name })),
        unsupported_branches: branches.filter((b) => !b.is_supported).map((b) => ({ id: b.id, code: b.code, name: b.name })),
      };
    }),
  };
}
