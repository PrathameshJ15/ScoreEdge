import { describe, it, expect, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { dbStore } from '@/lib/db/client';
import { createAuthToken } from '@/lib/api/auth';
import {
  normalizeQuestionText,
  extractContentTokens,
  calculateLexicalSimilarity,
  calculateJaccardSimilarity,
  compareQuestions,
  recomputeClusterStats,
  autoDiscoverClusters,
  approveCluster,
  rejectCluster,
  addMemberToCluster,
  removeMemberFromCluster,
  enrichCluster,
} from '@/lib/intelligence/clusteringEngine';
import { Question } from '@/lib/db/types';

// API Handlers
import { GET as getPublicClustersHandler } from '@/app/api/pyqs/clusters/route';
import {
  GET as getAdminClustersHandler,
  POST as createAdminClusterHandler,
} from '@/app/api/admin/clusters/route';
import {
  GET as getAdminClusterDetailHandler,
  PATCH as patchAdminClusterHandler,
  DELETE as deleteAdminClusterHandler,
} from '@/app/api/admin/clusters/[id]/route';
import { POST as addClusterMemberHandler } from '@/app/api/admin/clusters/[id]/members/route';
import { DELETE as removeClusterMemberHandler } from '@/app/api/admin/clusters/[id]/members/[memberId]/route';

describe('ScoreEdge Repeated-Question Intelligence Engine Suite', () => {
  const adminToken = createAuthToken({ id: 'usr-admin-1', email: 'admin@scoreedge.in', role: 'ADMIN' });
  const studentToken = createAuthToken({ id: 'usr-student-1', email: 'student@sppu.ac.in', role: 'STUDENT' });

  beforeEach(() => {
    dbStore.reset();
  });

  describe('1. Text Normalization & Token Extraction', () => {
    it('strips question numbering, exam labels, and marks brackets cleanly', () => {
      const input = 'Q. 3 (a) Explain 2-Phase Locking protocol in detail with suitable examples. [8 Marks]';
      const normalized = normalizeQuestionText(input);

      expect(normalized).not.toContain('q 3');
      expect(normalized).not.toContain('8 marks');
      expect(normalized).toContain('explain 2 phase locking protocol in detail with suitable examples');
    });

    it('strips exam boilerplate words leaving core conceptual keywords', () => {
      const input = 'Explain the difference between B-Tree and B+ Tree indexing with a neat sketch [6M]';
      const tokens = extractContentTokens(input);

      // Boilerplate stripped: explain, difference, between, and, with, a, neat, sketch
      expect(tokens).not.toContain('explain');
      expect(tokens).not.toContain('between');
      expect(tokens).not.toContain('with');
      expect(tokens).not.toContain('sketch');

      // Core technical concepts retained
      expect(tokens).toContain('tree');
      expect(tokens).toContain('indexing');
    });

    it('handles empty or malformed strings gracefully', () => {
      expect(normalizeQuestionText('')).toBe('');
      expect(extractContentTokens('')).toEqual([]);
    });
  });

  describe('2. Lexical & Jaccard Similarity Algorithms', () => {
    it('returns 1.0 for identical strings and 0.0 for completely disjoint strings', () => {
      expect(calculateLexicalSimilarity('normalization', 'normalization')).toBe(1.0);
      expect(calculateLexicalSimilarity('abc', 'xyz')).toBe(0.0);
    });

    it('computes exact Jaccard token overlap', () => {
      const tokensA = ['bcnf', 'lossless', 'dependency', 'preservation'];
      const tokensB = ['bcnf', 'lossless', 'decomposition'];

      // Intersection: 'bcnf', 'lossless' (2)
      // Union: 'bcnf', 'lossless', 'dependency', 'preservation', 'decomposition' (5)
      // Jaccard = 2 / 5 = 0.4
      const similarity = calculateJaccardSimilarity(tokensA, tokensB);
      expect(similarity).toBeCloseTo(0.4, 2);
    });

    it('handles empty token sets safely', () => {
      expect(calculateJaccardSimilarity([], [])).toBe(1.0);
      expect(calculateJaccardSimilarity(['sql'], [])).toBe(0.0);
    });
  });

  describe('3. Multi-Tier Repetition Classification & Guardrails', () => {
    const baseQuestion: Question = {
      id: 'q-test-1',
      subject_id: 'sub-dbms',
      unit_id: 'unit-dbms-1',
      topic_id: 'top-dbms-er',
      question_text: 'Explain Entity-Relationship (ER) model and its components with suitable examples. [8 Marks]',
      marks: 8,
      difficulty: 'MEDIUM',
      question_type: 'THEORY',
      is_pyq: true,
      verification_status: 'VERIFIED',
      content_status: 'PUBLISHED',
      normalized_question: 'explain entity relationship er model and its components with suitable examples',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    it('classifies identical or normalized exact matches as EXACT_REPETITION', () => {
      const qIdentical: Question = {
        ...baseQuestion,
        id: 'q-test-2',
        question_text: 'Q1(a) Explain Entity-Relationship (ER) model and its components with suitable examples. [8M]',
      };

      const comparison = compareQuestions(baseQuestion, qIdentical);
      expect(comparison.isRepetition).toBe(true);
      expect(comparison.repetitionType).toBe('EXACT_REPETITION');
      expect(comparison.confidenceScore).toBe(1.0);
      expect(comparison.confidenceLevel).toBe('VERY_HIGH');
    });

    it('classifies near-identical wording as NEAR_REPETITION', () => {
      const qNear: Question = {
        ...baseQuestion,
        id: 'q-test-3',
        question_text: 'Describe the Entity-Relationship (ER) model with its basic components. Give suitable examples. [8 Marks]',
      };

      const comparison = compareQuestions(baseQuestion, qNear);
      expect(comparison.isRepetition).toBe(true);
      expect(comparison.repetitionType).toBe('NEAR_REPETITION');
      expect(comparison.confidenceScore).toBeGreaterThanOrEqual(0.85);
    });

    it('classifies same-topic rephrased questions as WORDING_VARIATION', () => {
      const qVariation: Question = {
        ...baseQuestion,
        id: 'q-test-4',
        question_text: 'What are the building blocks of an ER diagram? Explain entities and relationships with examples. [6 Marks]',
        marks: 6,
      };

      const comparison = compareQuestions(baseQuestion, qVariation);
      expect(comparison.isRepetition).toBe(true);
      expect(['WORDING_VARIATION', 'CONCEPT_REPETITION', 'NEAR_REPETITION']).toContain(comparison.repetitionType);
      expect(comparison.confidenceScore).toBeGreaterThanOrEqual(0.6);
    });

    it('rejects questions belonging to different units or subjects (false positive prevention)', () => {
      const qDifferentUnit: Question = {
        ...baseQuestion,
        id: 'q-test-diff-unit',
        unit_id: 'unit-dbms-4', // Transaction management unit
        question_text: 'Explain 2-Phase Locking protocol and serializability with examples. [8 Marks]',
      };

      const comparison = compareQuestions(baseQuestion, qDifferentUnit);
      expect(comparison.isRepetition).toBe(false);
      expect(comparison.confidenceLevel).toBe('LOW');
      expect(comparison.matchExplanation).toContain('different subjects or syllabus units');
    });

    it('rejects completely dissimilar questions within the same unit', () => {
      const qUnrelatedInUnit: Question = {
        ...baseQuestion,
        id: 'q-test-unrelated',
        topic_id: 'top-dbms-arch',
        question_text: 'Illustrate 3-tier database architecture with a neat block diagram. [4 Marks]',
        marks: 4,
      };

      const comparison = compareQuestions(baseQuestion, qUnrelatedInUnit);
      // ER Model vs 3-tier DB architecture have distinct tokens
      expect(comparison.confidenceScore).toBeLessThan(0.75);
    });
  });

  describe('4. Cluster Statistics & Safe Repetition Display', () => {
    it('aggregates distinct verified papers and formats safe display string', () => {
      const cluster = dbStore.questionClusters.find((c) => c.id === 'cluster-acid');
      expect(cluster).toBeDefined();

      const updated = recomputeClusterStats('cluster-acid');
      expect(updated).not.toBeNull();
      expect(updated!.occurrence_count).toBeGreaterThanOrEqual(2);
      expect(updated!.years.length).toBeGreaterThanOrEqual(2);
      // Safe display format: "Repeated/Similar in X verified papers"
      expect(updated!.repetition_summary).toMatch(/^Repeated\/Similar in \d+ verified paper(s)?$/);
      // Never contains unsupported prediction or guaranteed leak language
      expect(updated!.repetition_summary).not.toContain('100%');
      expect(updated!.repetition_summary).not.toContain('guaranteed');
      expect(updated!.repetition_summary).not.toContain('leak');
    });

    it('calculates typical marks range based on member occurrences', () => {
      const cluster = recomputeClusterStats('cluster-acid');
      expect(cluster!.typical_marks).toMatch(/\d+.*Marks/);
    });

    it('supports future AI embedding fields without breaking data model', () => {
      const cluster = dbStore.questionClusters[0];
      expect(cluster.embedding_model).toBeDefined(); // can be null or string
      expect(cluster.clustering_algorithm).toBeDefined();
    });
  });

  describe('5. Cluster Member Management & Admin Verification', () => {
    it('allows admin to approve a cluster with full audit logging', () => {
      // Create a pending cluster
      const pendingClusterId = 'cluster-test-pending';
      dbStore.questionClusters.push({
        id: pendingClusterId,
        subject_id: 'sub-dbms',
        unit_id: 'unit-dbms-1',
        topic_id: 'top-dbms-er',
        canonical_name: 'ER Modeling',
        canonical_question: 'Explain ER Model with diagram',
        occurrence_count: 2,
        years: [2024, 2023],
        typical_marks: '8 Marks',
        confidence_score: 0.9,
        human_approved: false,
        review_status: 'PENDING_REVIEW',
        clustering_algorithm: 'HYBRID',
        embedding_model: null,
        trend: 'HIGH',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      const approved = approveCluster(pendingClusterId, 'usr-admin-1');
      expect(approved.human_approved).toBe(true);
      expect(approved.review_status).toBe('APPROVED');
      expect(approved.approved_by).toBe('usr-admin-1');

      // Check audit record
      const audit = dbStore.verificationRecords.find(
        (v) => v.entity_id === pendingClusterId && v.entity_type === 'CLUSTER'
      );
      expect(audit).toBeDefined();
      expect(audit!.status_to).toBe('APPROVED');
    });

    it('allows admin to reject an inaccurate cluster candidate', () => {
      const testClusterId = 'cluster-test-reject';
      dbStore.questionClusters.push({
        id: testClusterId,
        subject_id: 'sub-dbms',
        unit_id: 'unit-dbms-1',
        topic_id: null,
        canonical_name: 'Dubious Similarity',
        canonical_question: 'Random Question',
        occurrence_count: 1,
        years: [2024],
        typical_marks: '4 Marks',
        confidence_score: 0.5,
        human_approved: false,
        review_status: 'PENDING_REVIEW',
        clustering_algorithm: 'HYBRID',
        embedding_model: null,
        trend: 'STABLE',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      const rejected = rejectCluster(testClusterId, 'usr-admin-1', 'Insufficient conceptual equivalence.');
      expect(rejected.human_approved).toBe(false);
      expect(rejected.review_status).toBe('REJECTED');

      const audit = dbStore.verificationRecords.find(
        (v) => v.entity_id === testClusterId && v.entity_type === 'CLUSTER'
      );
      expect(audit).toBeDefined();
      expect(audit!.status_to).toBe('REJECTED');
      expect(audit!.review_notes).toContain('Insufficient conceptual equivalence');
    });

    it('adds and removes cluster members dynamically', () => {
      const clusterId = 'cluster-acid';
      const questionId = 'q-dbms-2pl'; // question from the bank

      const initialMemberCount = dbStore.questionClusterMembers.filter((m) => m.cluster_id === clusterId).length;

      // Add member
      const member = addMemberToCluster(clusterId, questionId, 'WORDING_VARIATION', 'usr-admin-1');
      expect(member.cluster_id).toBe(clusterId);
      expect(member.question_id).toBe(questionId);

      const afterAddCount = dbStore.questionClusterMembers.filter((m) => m.cluster_id === clusterId).length;
      expect(afterAddCount).toBe(initialMemberCount + 1);

      // Remove member
      const removed = removeMemberFromCluster(clusterId, member.id);
      expect(removed).toBe(true);

      const afterRemoveCount = dbStore.questionClusterMembers.filter((m) => m.cluster_id === clusterId).length;
      expect(afterRemoveCount).toBe(initialMemberCount);
    });

    it('enriches cluster with unit titles and safe display tags', () => {
      const cluster = dbStore.questionClusters[0];
      const enriched = enrichCluster(cluster);

      expect(enriched.display_tag).toMatch(/Repeated\/Similar in \d+ verified paper(s)?/);
      expect(enriched.members).toBeDefined();
      expect(Array.isArray(enriched.members)).toBe(true);
    });
  });

  describe('6. Public & Student Cluster Intelligence API', () => {
    it('returns clusters with safe repetition summaries and respects preview entitlement limits', async () => {
      const req = new NextRequest('http://localhost:3000/api/pyqs/clusters?subject_id=sub-dbms', {
        headers: { Authorization: `Bearer ${studentToken}` },
      });

      const res = await getPublicClustersHandler(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.data.length).toBeGreaterThan(0);

      const firstCluster = json.data[0];
      expect(firstCluster.repetition_summary).toMatch(/^Repeated\/Similar in \d+ verified paper/);
      expect(firstCluster.is_locked).toBe(false); // First 2 free for preview

      if (json.data.length > 2) {
        const thirdCluster = json.data[2];
        expect(thirdCluster.is_locked).toBe(true);
        expect(thirdCluster.lock_message).toContain('Upgrade');
      }
    });

    it('does not expose rejected clusters to public students', async () => {
      // Add a rejected cluster
      dbStore.questionClusters.push({
        id: 'cluster-hidden-rejected',
        subject_id: 'sub-dbms',
        unit_id: 'unit-dbms-1',
        topic_id: null,
        canonical_name: 'Rejected Cluster',
        canonical_question: 'Should not appear in student feed',
        occurrence_count: 1,
        years: [2024],
        typical_marks: '8 Marks',
        confidence_score: 0.3,
        human_approved: false,
        review_status: 'REJECTED',
        clustering_algorithm: 'HYBRID',
        embedding_model: null,
        trend: 'STABLE',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      const req = new NextRequest('http://localhost:3000/api/pyqs/clusters?subject_id=sub-dbms', {
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      const res = await getPublicClustersHandler(req);
      const json = await res.json();

      const foundRejected = json.data.some((c: any) => c.id === 'cluster-hidden-rejected');
      expect(foundRejected).toBe(false);
    });
  });

  describe('7. Admin Cluster Management API & Security', () => {
    it('forbids students from accessing admin cluster routes', async () => {
      const req = new NextRequest('http://localhost:3000/api/admin/clusters', {
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      const res = await getAdminClustersHandler(req);
      expect(res.status).toBe(403);
    });

    it('allows admin to list all clusters including review statuses', async () => {
      const req = new NextRequest('http://localhost:3000/api/admin/clusters', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const res = await getAdminClustersHandler(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data.length).toBeGreaterThan(0);
      expect(json.data[0].review_status).toBeDefined();
    });

    it('allows admin to trigger auto-discovery for subject questions', async () => {
      const req = new NextRequest('http://localhost:3000/api/admin/clusters', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'AUTO_DISCOVER',
          subject_id: 'sub-dbms',
        }),
      });

      const res = await createAdminClusterHandler(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data.message).toContain('Auto-discovery complete');
      expect(json.data.discovered_count).toBeDefined();
    });

    it('allows admin to approve and reject clusters via PATCH /api/admin/clusters/[id]', async () => {
      const clusterId = 'cluster-acid';

      // Approve
      const approveReq = new NextRequest(`http://localhost:3000/api/admin/clusters/${clusterId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'APPROVE' }),
      });
      const approveRes = await patchAdminClusterHandler(approveReq, { params: { id: clusterId } });
      expect(approveRes.status).toBe(200);
      const approveJson = await approveRes.json();
      expect(approveJson.data.review_status).toBe('APPROVED');
      expect(approveJson.data.human_approved).toBe(true);

      // Reject
      const rejectReq = new NextRequest(`http://localhost:3000/api/admin/clusters/${clusterId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'REJECT', reason: 'False repetition candidate' }),
      });
      const rejectRes = await patchAdminClusterHandler(rejectReq, { params: { id: clusterId } });
      expect(rejectRes.status).toBe(200);
      const rejectJson = await rejectRes.json();
      expect(rejectJson.data.review_status).toBe('REJECTED');
      expect(rejectJson.data.human_approved).toBe(false);
    });

    it('allows admin to add and delete question members via API', async () => {
      const clusterId = 'cluster-acid';
      const questionId = 'q-dbms-2pl';

      // Add member
      const addReq = new NextRequest(`http://localhost:3000/api/admin/clusters/${clusterId}/members`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question_id: questionId,
          repetition_type: 'WORDING_VARIATION',
        }),
      });

      const addRes = await addClusterMemberHandler(addReq, { params: { id: clusterId } });
      expect(addRes.status).toBe(201);
      const addJson = await addRes.json();
      expect(addJson.data.question_id).toBe(questionId);
      const createdMemberId = addJson.data.id;

      // Delete member
      const deleteReq = new NextRequest(
        `http://localhost:3000/api/admin/clusters/${clusterId}/members/${createdMemberId}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${adminToken}` },
        }
      );

      const deleteRes = await removeClusterMemberHandler(deleteReq, {
        params: { id: clusterId, memberId: createdMemberId },
      });
      expect(deleteRes.status).toBe(200);
    });

    it('allows admin to archive/delete a cluster', async () => {
      const clusterId = 'cluster-acid';
      const deleteReq = new NextRequest(`http://localhost:3000/api/admin/clusters/${clusterId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      const deleteRes = await deleteAdminClusterHandler(deleteReq, { params: { id: clusterId } });
      expect(deleteRes.status).toBe(200);

      // Verify soft deleted
      const found = dbStore.questionClusters.find((c) => c.id === clusterId && !c.deleted_at);
      expect(found).toBeUndefined();
    });
  });
});
