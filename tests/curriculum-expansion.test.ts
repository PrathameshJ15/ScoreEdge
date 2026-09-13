import { describe, it, expect, beforeEach } from 'vitest';
import { dbStore } from '@/lib/db/client';
import {
  getFullAcademicLineage,
  getBranchesWithStatus,
  getFilteredSubjects,
  buildCurriculumHierarchyTree,
} from '@/lib/curriculum/hierarchy';
import {
  onboardUniversity,
  onboardPattern,
  onboardBranch,
  onboardAcademicYear,
  onboardSemester,
  onboardSubject,
  onboardBatchSubjectCurriculum,
  auditCurriculumIntegrity,
  UniversityOnboardSchema,
  SubjectOnboardSchema,
} from '@/lib/curriculum/onboarding';
import { executeUnifiedSearch } from '@/lib/search/searchEngine';
import { calculateSubjectIntelligence } from '@/lib/intelligence/pyqEngine';
import { retrieveGroundedAcademicContext } from '@/lib/ai/retrieval';
import { buildGroundedPromptMessages } from '@/lib/ai/contextBuilder';
import { buildScoreEdgeSystemPrompt } from '@/lib/ai/prompts';
import { checkUserEntitlement } from '@/lib/payments/entitlements';

describe('Curriculum Expansion & Multi-Tier Hierarchy Subsystem', () => {
  beforeEach(() => {
    dbStore.reset();
  });

  describe('1. 9-Tier Academic Lineage Resolution', () => {
    it('resolves full 9-tier lineage for existing SPPU SE Computer Engineering subject', () => {
      // Find an existing subject
      const subject = dbStore.subjects.find((s) => s.code === '210242'); // Data Structures & Algorithms
      expect(subject).toBeDefined();

      const lineage = getFullAcademicLineage(subject!.id);
      expect(lineage).toBeDefined();

      // Verify each tier of the 9-tier hierarchy
      expect(lineage.university?.code).toBe('SPPU');
      expect(lineage.university?.name).toContain('Savitribai Phule Pune University');
      expect(lineage.pattern).toBeDefined();
      expect(lineage.pattern?.code).toBe('2024-pattern');
      expect(lineage.branch?.code).toBe('COMP');
      expect(lineage.academicYear?.code).toBe('SE');
      expect(lineage.semester?.semester_number).toBe(3);
      expect(lineage.subject?.code).toBe('210242');
    });

    it('returns empty null slots for non-existent subject', () => {
      const lineage = getFullAcademicLineage('sub-non-existent');
      expect(lineage.subject).toBeNull();
      expect(lineage.university).toBeNull();
    });

    it('resolves partial lineage from unit and question levels', () => {
      const unit = dbStore.units[0];
      expect(unit).toBeDefined();

      const lineage = getFullAcademicLineage({ unit_id: unit.id });
      expect(lineage).toBeDefined();
      expect(lineage.unit?.id).toBe(unit.id);
      expect(lineage.unit?.unit_number).toBe(unit.unit_number);
      expect(lineage.subject?.id).toBe(unit.subject_id);

      const question = dbStore.questions.find((q) => q.unit_id === unit.id);
      if (question) {
        const fullLineage = getFullAcademicLineage({ question_id: question.id });
        expect(fullLineage.question?.id).toBe(question.id);
        expect(fullLineage.subject?.id).toBe(question.subject_id);
      }
    });
  });

  describe('2. Branch Status & No Automatic Fake Data Enforcement', () => {
    it('marks branches without active subjects as UNSUPPORTED rather than populating fake data', () => {
      const branches = getBranchesWithStatus();

      const compBranch = branches.find((b) => b.code === 'COMP');
      expect(compBranch).toBeDefined();
      expect(compBranch?.is_supported).toBe(true);
      expect(compBranch?.onboarding_status).toBe('ACTIVE');
      expect(compBranch?.subject_count).toBeGreaterThan(0);

      // Verify that branches without active subjects are marked UNSUPPORTED rather than populating fake data
      dbStore.branches.push({
        id: 'branch-civil-temp',
        code: 'CIVIL',
        name: 'Civil Engineering',
        description: 'No active subjects yet',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      const updatedBranches = getBranchesWithStatus();
      const civilBranch = updatedBranches.find((b) => b.code === 'CIVIL');
      expect(civilBranch?.is_supported).toBe(false);
      expect(civilBranch?.onboarding_status).toBe('UNSUPPORTED');
      expect(civilBranch?.subject_count).toBe(0);
    });

    it('filters subjects strictly by hierarchy parameters', () => {
      const sppuUni = dbStore.universities.find((u) => u.code === 'SPPU');
      const compBranch = dbStore.branches.find((b) => b.code === 'COMP');

      const compSubjects = getFilteredSubjects({
        university_id: sppuUni?.id,
        branch_id: compBranch?.id,
      });
      expect(compSubjects.length).toBeGreaterThan(0);

      const unseededSubjects = getFilteredSubjects({
        branch_id: 'branch-civil-temp',
      });
      expect(unseededSubjects.length).toBe(0);
    });

    it('builds a hierarchical curriculum tree representation', () => {
      const tree = buildCurriculumHierarchyTree();
      expect(tree).toBeDefined();
      expect(tree?.university.code).toBe('SPPU');
      expect(tree?.patterns.length).toBeGreaterThan(0);

      const patternNode = tree?.patterns[0];
      expect(patternNode?.academic_years.length).toBeGreaterThan(0);
    });
  });

  describe('3. Curriculum Onboarding Pipeline & Schema Validation', () => {
    it('validates university onboard schema strictly', () => {
      const valid = UniversityOnboardSchema.safeParse({
        name: 'Mumbai University',
        code: 'MU',
        state: 'Maharashtra',
        country: 'India',
      });
      expect(valid.success).toBe(true);

      const invalid = UniversityOnboardSchema.safeParse({
        name: '', // Empty name
        code: 'mu', // Not uppercase
      });
      expect(invalid.success).toBe(false);
    });

    it('onboards new university, pattern, branch, and subject with validated relations', () => {
      const newUni = onboardUniversity({
        name: 'Dr. Babasaheb Ambedkar Technological University',
        code: 'BATU',
        state: 'Maharashtra',
        country: 'India',
      });
      expect(newUni.id).toBeDefined();
      expect(dbStore.universities.some((u) => u.id === newUni.id)).toBe(true);

      const newPattern = onboardPattern({
        university_id: newUni.id,
        name: '2023 DBATU Pattern',
        code: '2023-PAT',
        effective_year: 2023,
      });
      expect(newPattern.id).toBeDefined();

      const newBranch = onboardBranch({
        code: 'MECH',
        name: 'Mechanical Engineering',
        description: 'Mechanical Engineering Department',
      });
      expect(newBranch.id).toBeDefined();

      const newYear = onboardAcademicYear({
        pattern_id: newPattern.id,
        year_number: 2,
        code: 'SE',
        name: 'Second Year Mechanical',
      });
      expect(newYear.id).toBeDefined();

      const newSem = onboardSemester({
        academic_year_id: newYear.id,
        semester_number: 3,
        name: 'Semester 3 Mechanical',
      });
      expect(newSem.id).toBeDefined();

      const newSubject = onboardSubject({
        pattern_id: newPattern.id,
        semester_id: newSem.id,
        branch_id: newBranch.id,
        name: 'Thermodynamics',
        code: 'BTME301',
        short_name: 'TD',
        total_units: 6,
        total_credits: 4,
      });
      expect(newSubject.id).toBeDefined();

      // Verify lineage for this newly onboarded entity
      const newLineage = getFullAcademicLineage(newSubject.id);
      expect(newLineage.university?.code).toBe('BATU');
      expect(newLineage.pattern?.code).toBe('2023-PAT');
      expect(newLineage.branch?.code).toBe('MECH');
      expect(newLineage.subject?.name).toBe('Thermodynamics');
    });

    it('audits curriculum integrity and reports valid state', () => {
      const audit = auditCurriculumIntegrity();
      expect(audit.is_healthy).toBe(true);
      expect(audit.orphans.patterns_missing_university.length).toBe(0);
      expect(audit.orphans.subjects_missing_pattern.length).toBe(0);
      expect(audit.orphans.units_missing_subject.length).toBe(0);
      expect(audit.total_universities).toBeGreaterThan(0);
      expect(audit.total_subjects).toBeGreaterThan(0);
    });

    it('batch onboards subject curriculum with units and topics atomically', () => {
      const pat = dbStore.patterns[0];
      const sem = dbStore.semesters[0];
      const branch = dbStore.branches[0];

      const batchResult = onboardBatchSubjectCurriculum({
        subject: {
          pattern_id: pat.id,
          semester_id: sem.id,
          branch_id: branch.id,
          name: 'Advanced Algorithms',
          code: 'CS9999',
          short_name: 'AA',
          total_units: 2,
          total_credits: 3,
        },
        units: [
          {
            unit_number: 1,
            title: 'Divide and Conquer Advanced',
            description: 'Advanced divide and conquer paradigms',
            topics: [
              { title: 'Strassen Matrix Multiplication', description: 'Matrix complexity analysis', importance_level: 'MUST_STUDY' },
              { title: 'Median of Medians Algorithm', description: 'Selection in worst-case linear time', importance_level: 'HIGH' },
            ],
          },
          {
            unit_number: 2,
            title: 'Dynamic Programming Mastery',
            description: 'Advanced DP formulations and memory management',
            topics: [
              { title: 'Bellman-Ford Dynamic Formulation', description: 'Shortest paths with negative weights', importance_level: 'VERY_HIGH' },
            ],
          },
        ],
      });

      expect(batchResult.subject.id).toBeDefined();
      expect(batchResult.units_count).toBe(2);
      expect(batchResult.topics_count).toBe(3);

      const createdUnits = dbStore.units.filter((u) => u.subject_id === batchResult.subject.id);
      expect(createdUnits.length).toBe(2);
    });
  });

  describe('4. Multi-University Cross-System Compatibility', () => {
    it('filters unified search results by university and branch lineage', () => {
      const sppuUni = dbStore.universities.find((u) => u.code === 'SPPU');
      const compBranch = dbStore.branches.find((b) => b.code === 'COMP');

      // Search within SPPU Computer Engineering
      const results = executeUnifiedSearch('database', {
        university_id: sppuUni?.id,
        branch_id: compBranch?.id,
      });

      expect(results.total_matches).toBeGreaterThan(0);
      // All returned question or topic items match the university filter
      const allItems = [
        ...results.results.topics,
        ...results.results.questions,
        ...results.results.pyqs,
        ...results.results.notes,
        ...results.results.answers,
      ];
      for (const item of allItems) {
        if (item.university_id) {
          expect(item.university_id).toBe(sppuUni?.id);
        }
      }

      // Search with a non-existent university returns 0 matches
      const emptyResults = executeUnifiedSearch('database', {
        university_id: 'uni-non-existent',
      });
      expect(emptyResults.total_matches).toBe(0);
    });

    it('enriches PYQ Intelligence reports with academic lineage', () => {
      const subject = dbStore.subjects[0];
      const intel = calculateSubjectIntelligence(subject.id);

      expect(intel.university_id).toBeDefined();
      expect(intel.university_name).toBeDefined();
      expect(intel.pattern_id).toBeDefined();
      expect(intel.pattern_name).toBeDefined();
      expect(intel.branch_id).toBeDefined();
      expect(intel.branch_name).toBeDefined();
      expect(intel.university_name).toContain('Savitribai Phule Pune University');
    });

    it('enriches AI retrieval context with university and pattern lineage', async () => {
      const subject = dbStore.subjects[0];
      const context = await retrieveGroundedAcademicContext({
        query: 'binary search tree',
        subjectId: subject.id,
      });

      expect(context.university_name).toBeDefined();
      expect(context.pattern_name).toBeDefined();
      expect(context.branch_name).toBeDefined();
      expect(context.university_name).toContain('Savitribai Phule Pune University');

      // Build prompt and verify dynamic system prompt config
      const promptBundle = buildGroundedPromptMessages(context, 'Explain binary search trees for 5 marks');
      expect(promptBundle.messages[0].content).toContain(context.university_name);
      expect(promptBundle.messages[0].content).toContain(context.pattern_name);
    });

    it('supports custom university prompt generation with zero-hallucination rules', () => {
      const customPrompt = buildScoreEdgeSystemPrompt('Mumbai University (MU)', '2023 NEP Pattern', 'Computer Science');
      expect(customPrompt).toContain('Mumbai University (MU)');
      expect(customPrompt).toContain('2023 NEP Pattern');
      expect(customPrompt).toContain('Computer Science');
      expect(customPrompt).toContain('ZERO HALLUCINATION POLICY');
      expect(customPrompt).toContain('STRICT CONTEXT GROUNDING');
    });

    it('verifies entitlement checks remain independent of branch or university hardcoding', () => {
      const adminUser = { id: 'admin-1', role: 'ADMIN' };
      const access = checkUserEntitlement(adminUser, 'any-subject-id');
      expect(access.hasAccess).toBe(true);
      expect(access.accessType).toBe('ADMIN');

      const regularUser = { id: 'student-1', role: 'STUDENT' };
      const unauthenticated = checkUserEntitlement(null);
      expect(unauthenticated.hasAccess).toBe(false);

      const noPass = checkUserEntitlement(regularUser, 'any-subject-id');
      expect(noPass.hasAccess).toBe(false);
    });
  });
});
