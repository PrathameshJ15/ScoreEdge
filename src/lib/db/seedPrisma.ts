import { prisma } from '@/lib/prisma';
import {
  SEED_UNIVERSITIES,
  SEED_PATTERNS,
  SEED_BRANCHES,
  SEED_ACADEMIC_YEARS,
  SEED_SEMESTERS,
  SEED_SUBJECTS,
  SEED_UNITS,
  SEED_TOPICS,
  SEED_QUESTIONS,
  SEED_USERS,
} from './seedData';

export async function seedNeonDatabase() {
  if (!process.env.DATABASE_URL) {
    console.log('[Seed] DATABASE_URL is not defined in environment. Skipping database seed.');
    return { success: false, message: 'DATABASE_URL missing' };
  }

  try {
    console.log('[Seed] Starting database seeding for SPPU curriculum...');

    // 1. Seed Universities
    for (const u of SEED_UNIVERSITIES) {
      await prisma.university.upsert({
        where: { code: u.code },
        update: { name: u.name, state: u.state, country: u.country },
        create: {
          id: u.id,
          code: u.code,
          name: u.name,
          state: u.state,
          country: u.country,
          isActive: true,
        },
      });
    }

    // 2. Seed Patterns
    for (const p of SEED_PATTERNS) {
      await prisma.pattern.upsert({
        where: {
          universityId_code: {
            universityId: p.university_id,
            code: p.code,
          },
        },
        update: { name: p.name, startYear: 2024, isCurrent: true },
        create: {
          id: p.id,
          universityId: p.university_id,
          code: p.code,
          name: p.name,
          startYear: 2024,
          isCurrent: true,
        },
      });
    }

    // 3. Seed Branches
    for (const b of SEED_BRANCHES) {
      await prisma.branch.upsert({
        where: {
          patternId_code: {
            patternId: 'pat-2024',
            code: b.code,
          },
        },
        update: { name: b.name, shortName: b.code, description: b.description },
        create: {
          id: b.id,
          patternId: 'pat-2024',
          code: b.code,
          name: b.name,
          shortName: b.code,
          description: b.description,
        },
      });
    }

    // 4. Seed Academic Years
    for (const ay of SEED_ACADEMIC_YEARS) {
      const bId = ay.branch_id || 'branch-comp';
      await prisma.academicYear.upsert({
        where: {
          branchId_yearCode: {
            branchId: bId,
            yearCode: ay.code,
          },
        },
        update: { yearName: ay.name, yearNumber: ay.year_number },
        create: {
          id: ay.id,
          branchId: bId,
          yearCode: ay.code,
          yearName: ay.name,
          yearNumber: ay.year_number,
        },
      });
    }

    // 5. Seed Semesters
    for (const sem of SEED_SEMESTERS) {
      await prisma.semester.upsert({
        where: {
          academicYearId_semesterNumber: {
            academicYearId: sem.academic_year_id,
            semesterNumber: sem.semester_number,
          },
        },
        update: { name: sem.name },
        create: {
          id: sem.id,
          academicYearId: sem.academic_year_id,
          semesterNumber: sem.semester_number,
          name: sem.name,
        },
      });
    }

    // 6. Seed Subjects
    for (const sub of SEED_SUBJECTS) {
      await prisma.subject.upsert({
        where: { code: sub.code },
        update: {
          name: sub.name,
          shortName: sub.short_name,
          credits: sub.total_credits || 4,
          inSemMarks: 30,
          endSemMarks: 70,
          totalMarks: 100,
        },
        create: {
          id: sub.id,
          semesterId: sub.semester_id,
          branchId: sub.branch_id,
          code: sub.code,
          name: sub.name,
          shortName: sub.short_name,
          credits: sub.total_credits || 4,
          inSemMarks: 30,
          endSemMarks: 70,
          totalMarks: 100,
          isActive: sub.is_active,
        },
      });
    }

    // 7. Seed Units
    for (const u of SEED_UNITS) {
      await prisma.unit.upsert({
        where: {
          subjectId_unitNumber: {
            subjectId: u.subject_id,
            unitNumber: u.unit_number,
          },
        },
        update: { title: u.title, description: u.description, weightagePercentage: u.weightage_percentage },
        create: {
          id: u.id,
          subjectId: u.subject_id,
          unitNumber: u.unit_number,
          title: u.title,
          description: u.description,
          weightagePercentage: u.weightage_percentage,
        },
      });
    }

    // 8. Seed Topics
    for (const t of SEED_TOPICS) {
      await prisma.topic.upsert({
        where: { id: t.id },
        update: { title: t.title, description: t.description, importanceLevel: t.importance_level as any },
        create: {
          id: t.id,
          unitId: t.unit_id,
          title: t.title,
          description: t.description,
          sequenceOrder: 1,
          importanceLevel: t.importance_level as any,
        },
      });
    }

    // 9. Seed Questions
    for (const q of SEED_QUESTIONS) {
      await prisma.question.upsert({
        where: { id: q.id },
        update: { questionText: q.question_text, isPyq: q.is_pyq, defaultMarks: 5 },
        create: {
          id: q.id,
          subjectId: q.subject_id,
          unitId: q.unit_id,
          topicId: q.topic_id || undefined,
          questionText: q.question_text,
          questionType: (q.question_type as any) || 'THEORY',
          defaultMarks: 5,
          difficulty: 'MEDIUM',
          isPyq: q.is_pyq,
          contentStatus: (q.content_status as any) || 'PUBLISHED',
        },
      });
    }

    // 10. Seed Users (5 students + admin)
    for (const user of SEED_USERS) {
      await prisma.user.upsert({
        where: { email: user.email },
        update: {
          fullName: user.full_name,
          role: user.role as any,
          department: user.department,
          branchCode: user.branch_code,
          academicYear: user.academic_year,
          yearNumber: user.year_number,
          semesterNumber: user.semester_number,
          pattern: user.pattern,
          targetSgpa: user.target_sgpa,
        },
        create: {
          id: user.id,
          email: user.email,
          passwordHash: user.password_hash,
          fullName: user.full_name,
          role: user.role as any,
          department: user.department,
          branchCode: user.branch_code,
          academicYear: user.academic_year,
          yearNumber: user.year_number,
          semesterNumber: user.semester_number,
          pattern: user.pattern,
          targetSgpa: user.target_sgpa,
          emailVerified: user.email_verified,
          isActive: user.is_active,
        },
      });
    }

    console.log('[Seed] Database successfully seeded with SPPU curriculum!');
    return { success: true, message: 'Database seeded successfully' };
  } catch (error) {
    console.error('[Seed Error]:', error);
    return { success: false, error: String(error) };
  }
}
