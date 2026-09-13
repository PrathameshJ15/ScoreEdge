import { describe, it, expect, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { dbStore } from '@/lib/db/client';
import {
  calculateSubjectIntelligence,
  getDistinctVerifiedPapers,
  sanitizeIntelligenceText,
  TopicPriorityReport,
  UnitAnalysisReport,
} from '@/lib/intelligence/pyqEngine';
import { GET as getIntelligenceHandler } from '@/app/api/pyqs/intelligence/route';
import { GET as getFrequencyHandler } from '@/app/api/pyqs/frequency/route';
import { GET as getUnitsHandler } from '@/app/api/pyqs/units/route';
import { GET as getTopicsHandler } from '@/app/api/pyqs/topics/route';

describe('ScoreEdge PYQ Intelligence Engine Suite', () => {
  beforeEach(() => {
    // Ensure standard DBMS test data exists
    if (!dbStore.subjects.some((s) => s.id === 'sub-dbms')) {
      dbStore.subjects.push({
        id: 'sub-dbms',
        pattern_id: 'pat-2024',
        branch_id: 'branch-comp',
        semester_id: 'sem-3',
        code: '210241',
        name: 'Database Management Systems',
        short_name: 'DBMS',
        total_units: 6,
        total_credits: 3,
        is_popular: true,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
  });

  describe('Core Statistical Signals & Calculations', () => {
    it('calculates occurrence frequency and distinct papers accurately', () => {
      const report = calculateSubjectIntelligence('sub-dbms');

      expect(report.total_papers_analyzed).toBeGreaterThanOrEqual(1);
      expect(report.total_occurrences).toBeGreaterThanOrEqual(5);
      expect(report.years_analyzed.length).toBeGreaterThanOrEqual(1);

      // Verify each topic has calculated signals
      for (const topic of report.topics_priority) {
        expect(topic.signals.occurrenceFrequency).toBeDefined();
        expect(topic.signals.occurrenceFrequency.totalPapersAnalyzed).toBe(report.total_papers_analyzed);
        expect(topic.signals.occurrenceFrequency.frequencyRatio).toBeGreaterThanOrEqual(0);
        expect(topic.signals.occurrenceFrequency.frequencyRatio).toBeLessThanOrEqual(1);
      }
    });

    it('identifies distinct verified papers by year, session, and pattern', () => {
      const distinctPapers = getDistinctVerifiedPapers(
        dbStore.questionOccurrences.filter((o) => o.subject_id === 'sub-dbms')
      );

      expect(distinctPapers.length).toBeGreaterThanOrEqual(2);
      // All papers must have a valid year and session
      for (const paper of distinctPapers) {
        expect(paper.year).toBeGreaterThanOrEqual(2020);
        expect(['IN_SEM', 'END_SEM', 'RE_EXAM', 'SUPPLEMENTARY']).toContain(paper.session);
      }
    });

    it('computes marks patterns, typical ranges, and unit weightages', () => {
      const report = calculateSubjectIntelligence('sub-dbms');

      const normTopic = report.topics_priority.find((t) => t.topic_id === 'topic-norm-3nf');
      expect(normTopic).toBeDefined();

      if (normTopic) {
        expect(normTopic.signals.marksPattern.minMarks).toBeGreaterThanOrEqual(6);
        expect(normTopic.signals.marksPattern.avgMarks).toBeGreaterThanOrEqual(6);
        expect(normTopic.signals.marksPattern.typicalMarksRange).toMatch(/Marks/);
        expect(normTopic.signals.unitWeightage.unitNumber).toBe(3);
        expect(normTopic.signals.unitWeightage.unitMarksPercentage).toBeGreaterThan(0);
      }
    });

    it('determines recurrence and trend trajectories', () => {
      const report = calculateSubjectIntelligence('sub-dbms');
      const highFreqTopic = report.topics_priority.find(
        (t) => t.signals.occurrenceFrequency.distinctPapersCount >= 2
      );

      if (highFreqTopic) {
        expect(highFreqTopic.signals.recurrence.isRecurring).toBe(true);
        expect(['HIGH', 'STABLE', 'EMERGING']).toContain(highFreqTopic.signals.trend.direction);
        expect(highFreqTopic.signals.trend.trendExplanation).toBeTruthy();
      }
    });
  });

  describe('Priority Categories Generation', () => {
    it('generates five distinct priority categories: MUST STUDY, VERY HIGH, HIGH, MEDIUM, LOW', () => {
      const report = calculateSubjectIntelligence('sub-dbms');

      const validPriorities = new Set(['MUST_STUDY', 'VERY_HIGH', 'HIGH', 'MEDIUM', 'LOW']);

      for (const topic of report.topics_priority) {
        expect(validPriorities.has(topic.priority)).toBe(true);
        expect(topic.composite_score).toBeGreaterThanOrEqual(0);
        expect(topic.composite_score).toBeLessThanOrEqual(100);
      }

      // Must be sorted in descending order of composite score
      for (let i = 0; i < report.topics_priority.length - 1; i++) {
        expect(report.topics_priority[i].composite_score).toBeGreaterThanOrEqual(
          report.topics_priority[i + 1].composite_score
        );
      }
    });

    it('correctly partitions topics into important topic lists', () => {
      const report = calculateSubjectIntelligence('sub-dbms');

      expect(report.important_topic_lists).toBeDefined();
      expect(report.important_topic_lists.must_study).toBeDefined();
      expect(report.important_topic_lists.very_high).toBeDefined();
      expect(report.important_topic_lists.high).toBeDefined();
      expect(report.important_topic_lists.medium).toBeDefined();
      expect(report.important_topic_lists.low).toBeDefined();
      expect(report.important_topic_lists.summary_text).toContain('MUST STUDY');
    });
  });

  describe('Explainability & Academic Recommendations', () => {
    it('provides transparent evidence explanations for every topic', () => {
      const report = calculateSubjectIntelligence('sub-dbms');

      for (const topic of report.topics_priority) {
        expect(topic.explanation).toBeTruthy();
        if (topic.signals.occurrenceFrequency.distinctPapersCount > 0) {
          expect(topic.explanation).toMatch(/Appeared in|Recorded in/);
          expect(topic.explanation).toMatch(/verified paper|verified exam/);
        }
      }
    });

    it('provides academic revision recommendations matching priority levels', () => {
      const report = calculateSubjectIntelligence('sub-dbms');

      for (const topic of report.topics_priority) {
        expect(topic.recommendation).toBeTruthy();
        if (topic.priority === 'MUST_STUDY') {
          expect(topic.recommendation).toContain('High priority based on historical PYQ patterns');
        } else if (topic.priority === 'VERY_HIGH') {
          expect(topic.recommendation).toContain('Frequently examined concept based on past papers');
        }
      }
    });
  });

  describe('Safety Guardrails & Disclaimer Enforcement', () => {
    it('includes mandatory ethical disclaimer preventing false guarantees', () => {
      const report = calculateSubjectIntelligence('sub-dbms');

      expect(report.disclaimer).toContain(
        'Historical pattern analysis for strategic revision. ScoreEdge provides academic trend analysis based on verified past papers and does not guarantee specific exam questions.'
      );
    });

    it('never claims guaranteed questions or 100% predictions in any generated text', () => {
      const report = calculateSubjectIntelligence('sub-dbms');
      const allTexts = [
        report.overall_text_interpretation,
        report.marks_trends.text_interpretation,
        ...report.unit_analysis.map((u) => u.text_interpretation),
        ...report.topics_priority.map((t) => `${t.explanation} ${t.recommendation}`),
        ...report.pyq_frequency.map((f) => f.explanation),
      ];

      const forbiddenRegex = /guaranteed|100%\s+prediction|certain\s+exam\s+question|sure[\s-]shot|leak/i;

      for (const text of allTexts) {
        expect(text).not.toMatch(forbiddenRegex);
      }
    });

    it('sanitizes any unintended prohibited claim words', () => {
      const rawText = 'This is a guaranteed question with 100% prediction and paper leak.';
      const sanitized = sanitizeIntelligenceText(rawText);

      expect(sanitized).not.toContain('guaranteed question');
      expect(sanitized).not.toContain('100% prediction');
      expect(sanitized).not.toContain('paper leak');
    });
  });

  describe('Visual Breakdown & Text Interpretation', () => {
    it('provides rich text interpretation for every unit analysis chart', () => {
      const report = calculateSubjectIntelligence('sub-dbms');

      expect(report.unit_analysis.length).toBeGreaterThanOrEqual(1);

      for (const unit of report.unit_analysis) {
        expect(unit.text_interpretation).toBeTruthy();
        expect(unit.text_interpretation).toContain(`Unit ${unit.unit_number}`);
        expect(unit.text_interpretation).toMatch(/accounts for approximately|marks concentration/);
      }
    });

    it('provides text interpretation for marks distribution trends', () => {
      const report = calculateSubjectIntelligence('sub-dbms');

      expect(report.marks_trends).toBeDefined();
      expect(report.marks_trends.marks_buckets.length).toBe(6);
      expect(report.marks_trends.text_interpretation).toBeTruthy();
      expect(report.marks_trends.text_interpretation).toContain('Historical marks distribution');
    });

    it('ranks recurring questions with frequency and years', () => {
      const report = calculateSubjectIntelligence('sub-dbms');

      expect(report.pyq_frequency.length).toBeGreaterThan(0);
      const topQ = report.pyq_frequency[0];

      expect(topQ.frequency).toBeGreaterThanOrEqual(1);
      expect(topQ.years.length).toBeGreaterThanOrEqual(1);
      expect(topQ.explanation).toBeTruthy();
    });
  });

  describe('Intelligence API Endpoints', () => {
    it('GET /api/pyqs/intelligence returns 200 with complete subject report', async () => {
      const req = new NextRequest('http://localhost:3000/api/pyqs/intelligence?subject_id=sub-dbms');
      const res = await getIntelligenceHandler(req);

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data).toBeDefined();
      expect(json.data.subject_id).toBe('sub-dbms');
      expect(json.data.topics_priority.length).toBeGreaterThan(0);
      expect(json.data.unit_analysis.length).toBeGreaterThan(0);
      expect(json.data.marks_trends).toBeDefined();
      expect(json.data.disclaimer).toBeTruthy();
    });

    it('GET /api/pyqs/intelligence supports filtering by priority', async () => {
      const req = new NextRequest(
        'http://localhost:3000/api/pyqs/intelligence?subject_id=sub-dbms&priority=MUST_STUDY'
      );
      const res = await getIntelligenceHandler(req);
      const json = await res.json();

      for (const topic of json.data.topics_priority) {
        expect(topic.priority).toBe('MUST_STUDY');
      }
    });

    it('GET /api/pyqs/frequency returns ranked recurring questions', async () => {
      const req = new NextRequest('http://localhost:3000/api/pyqs/frequency?subject_id=sub-dbms');
      const res = await getFrequencyHandler(req);

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data.items.length).toBeGreaterThan(0);
      expect(json.data.items[0].frequency).toBeGreaterThanOrEqual(1);
    });

    it('GET /api/pyqs/units returns unit weightages with text interpretations', async () => {
      const req = new NextRequest('http://localhost:3000/api/pyqs/units?subject_id=sub-dbms');
      const res = await getUnitsHandler(req);

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data.units.length).toBeGreaterThan(0);
      expect(json.data.units[0].text_interpretation).toBeTruthy();
    });

    it('GET /api/pyqs/topics returns topic priorities and important lists', async () => {
      const req = new NextRequest('http://localhost:3000/api/pyqs/topics?subject_id=sub-dbms');
      const res = await getTopicsHandler(req);

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data.topics.length).toBeGreaterThan(0);
      expect(json.data.important_lists).toBeDefined();
    });
  });
});
