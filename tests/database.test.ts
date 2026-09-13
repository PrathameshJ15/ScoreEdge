import { describe, it, expect, beforeEach } from 'vitest';
import { dbStore, paginateArray } from '../src/lib/db/client';

describe('Database Store & Academic Data Model', () => {
  beforeEach(() => {
    dbStore.reset();
  });

  it('initializes academic hierarchy with SPPU and 2024 Pattern', () => {
    expect(dbStore.universities.length).toBeGreaterThan(0);
    expect(dbStore.universities[0].code).toBe('SPPU');

    const pattern2024 = dbStore.patterns.find((p) => p.code === '2024-pattern');
    expect(pattern2024).toBeDefined();
    expect(pattern2024?.effective_year).toBe(2024);

    const compBranch = dbStore.branches.find((b) => b.code === 'COMP');
    expect(compBranch).toBeDefined();
    expect(compBranch?.name).toBe('Computer Engineering');
  });

  it('has all 5 SE Computer subjects configured', () => {
    const subjects = dbStore.subjects.filter(
      (s) => s.branch_id === 'branch-comp' && ['sem-3', 'sem-4'].includes(s.semester_id) && !s.deleted_at
    );
    expect(subjects.length).toBe(5);

    const shortNames = subjects.map((s) => s.short_name);
    expect(shortNames).toContain('DBMS');
    expect(shortNames).toContain('DSA');
    expect(shortNames).toContain('OOP');
    expect(shortNames).toContain('OS');
    expect(shortNames).toContain('TOC');
  });

  it('supports units, topics, and syllabus items correctly linked', () => {
    const dbmsUnits = dbStore.units.filter((u) => u.subject_id === 'sub-dbms');
    expect(dbmsUnits.length).toBe(6);

    const unit3 = dbmsUnits.find((u) => u.unit_number === 3);
    expect(unit3).toBeDefined();

    const topicsInUnit3 = dbStore.topics.filter((t) => t.unit_id === unit3?.id);
    expect(topicsInUnit3.length).toBeGreaterThan(0);
    expect(topicsInUnit3[0].importance_level).toBe('MUST_STUDY');
  });

  it('supports PYQ questions, occurrences and clusters', () => {
    const pyqs = dbStore.questions.filter((q) => q.is_pyq);
    expect(pyqs.length).toBeGreaterThan(0);

    const question = pyqs[0];
    const occurrences = dbStore.questionOccurrences.filter((o) => o.question_id === question.id);
    expect(occurrences.length).toBeGreaterThan(0);
    expect(occurrences[0].year).toBeGreaterThanOrEqual(2020);

    const clusters = dbStore.questionClusters.filter((c) => c.subject_id === question.subject_id);
    expect(clusters.length).toBeGreaterThan(0);
    expect(clusters[0].occurrence_count).toBeGreaterThan(0);
  });

  it('enforces soft deletion on subjects and questions', () => {
    const testSubject = dbStore.subjects[0];
    expect(testSubject.deleted_at).toBeUndefined();

    // Soft delete
    testSubject.deleted_at = new Date().toISOString();
    testSubject.is_active = false;

    const activeSubjects = dbStore.subjects.filter((s) => s.is_active && !s.deleted_at);
    expect(activeSubjects.find((s) => s.id === testSubject.id)).toBeUndefined();
  });

  it('correctly paginates arrays', () => {
    const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const page1 = paginateArray(items, 1, 4);

    expect(page1.data).toEqual([1, 2, 3, 4]);
    expect(page1.pagination.page).toBe(1);
    expect(page1.pagination.limit).toBe(4);
    expect(page1.pagination.total).toBe(10);
    expect(page1.pagination.totalPages).toBe(3);

    const page3 = paginateArray(items, 3, 4);
    expect(page3.data).toEqual([9, 10]);
  });
});
