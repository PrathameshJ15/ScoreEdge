import { describe, it, expect, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { dbStore } from '@/lib/db/client';
import {
  executeUnifiedSearch,
  POPULAR_SPPU_SEARCHES,
} from '@/lib/search/searchEngine';
import { GET as searchGetHandler, POST as searchPostHandler } from '@/app/api/search/route';

describe('ScoreEdge Unified Search Suite', () => {
  beforeEach(() => {
    dbStore.reset();
  });

  describe('1. Search Across All Required Academic Entities', () => {
    it('searches topics and returns structured topic results', () => {
      const results = executeUnifiedSearch('Normalization');
      expect(results.results.topics.length).toBeGreaterThan(0);
      const topTopic = results.results.topics[0];
      expect(topTopic.category).toBe('TOPIC');
      expect(topTopic.title.toLowerCase()).toContain('normal');
      expect(topTopic.url).toContain('topic_id=');
      expect(topTopic.score).toBeGreaterThan(0);
    });

    it('searches previous year questions (PYQs) and returns paper recurrence metadata', () => {
      const results = executeUnifiedSearch('3NF');
      expect(results.results.pyqs.length).toBeGreaterThan(0);
      const pyq = results.results.pyqs[0];
      expect(pyq.category).toBe('PYQ');
      expect(pyq.is_pyq).toBe(true);
      expect(pyq.occurrences_count).toBeGreaterThanOrEqual(1);
    });

    it('searches practice questions from question bank', () => {
      const results = executeUnifiedSearch('Relational Algebra');
      expect(results.total_matches).toBeGreaterThan(0);
      const allQ = [...results.results.questions, ...results.results.pyqs];
      expect(allQ.length).toBeGreaterThan(0);
    });

    it('searches verified study notes', () => {
      const results = executeUnifiedSearch('Normalization');
      expect(results.results.notes.length).toBeGreaterThan(0);
      const note = results.results.notes[0];
      expect(note.category).toBe('NOTE');
      expect(note.subtitle).toContain('min read');
      expect(note.snippet.length).toBeGreaterThan(10);
    });

    it('searches solved model answers including evaluator points', () => {
      const results = executeUnifiedSearch('3NF');
      expect(results.results.answers.length).toBeGreaterThan(0);
      const answer = results.results.answers[0];
      expect(answer.category).toBe('ANSWER');
      expect(answer.title).toContain('Model Answer');
      expect(answer.marks).toBeDefined();
    });

    it('searches question clusters, units, and subjects as auxiliary facets', () => {
      const results = executeUnifiedSearch('DBMS');
      expect(results.matched_subjects.length).toBeGreaterThan(0);
      expect(results.matched_subjects[0].code).toBe('210241');
      expect(results.matched_subjects[0].short_name).toBe('DBMS');

      const clusterResults = executeUnifiedSearch('BCNF');
      expect(clusterResults.matched_clusters.length).toBeGreaterThan(0);
      expect(clusterResults.matched_clusters[0].canonical_name).toBeDefined();
    });
  });

  describe('2. Exact vs Partial Matching & Relevance Ranking', () => {
    it('ranks exact phrase matches higher than partial or body matches', () => {
      const results = executeUnifiedSearch('3NF and BCNF');
      const allMatches = [
        ...results.results.topics,
        ...results.results.pyqs,
        ...results.results.questions,
      ];
      expect(allMatches.length).toBeGreaterThan(1);

      // Top result should have EXACT match type and highest score
      expect(allMatches[0].score).toBeGreaterThanOrEqual(allMatches[1].score);
      expect(allMatches[0].match_type).toBe('EXACT');
    });

    it('supports partial token and prefix matching', () => {
      // "transact" should match transaction-related questions, units, or notes
      const results = executeUnifiedSearch('transact');
      expect(results.total_matches).toBeGreaterThan(0);
      const allFound = [
        ...results.results.topics,
        ...results.results.questions,
        ...results.results.pyqs,
        ...results.results.notes,
      ];
      expect(allFound.length).toBeGreaterThan(0);
      const matched = allFound.some((item) =>
        item.title.toLowerCase().includes('transact') ||
        item.subtitle.toLowerCase().includes('transact') ||
        item.snippet.toLowerCase().includes('transact')
      );
      expect(matched).toBe(true);
    });

    it('applies priority and paper recurrence boost to ranking', () => {
      const results = executeUnifiedSearch('Normalization');
      // Verify MUST_STUDY items or questions with multiple paper occurrences receive higher scores
      const topItems = results.results.pyqs;
      if (topItems.length > 1) {
        expect(topItems[0].score).toBeGreaterThanOrEqual(topItems[topItems.length - 1].score);
      }
    });
  });

  describe('3. Filtering Capabilities', () => {
    it('filters results by subject_id', () => {
      const results = executeUnifiedSearch('Relational', { subject_id: 'sub-dbms' });
      for (const t of results.results.topics) {
        expect(t.subject_id).toBe('sub-dbms');
      }
      for (const p of results.results.pyqs) {
        expect(p.subject_id).toBe('sub-dbms');
      }
    });

    it('filters results by category', () => {
      const results = executeUnifiedSearch('Normalization', { category: 'PYQS' });
      expect(results.results.pyqs.length).toBeGreaterThan(0);
      expect(results.results.topics.length).toBe(0);
      expect(results.results.notes.length).toBe(0);
      expect(results.results.answers.length).toBe(0);
    });

    it('filters results by marks target', () => {
      const results = executeUnifiedSearch('Normalization', { marks: 5 });
      for (const a of results.results.answers) {
        expect(a.marks).toBe(5);
      }
    });
  });

  describe('4. Result Grouping & Schema Compliance', () => {
    it('strictly returns results grouped into Topics, Questions, PYQs, Notes, Answers', () => {
      const results = executeUnifiedSearch('Normalization');
      expect(results.results).toHaveProperty('topics');
      expect(results.results).toHaveProperty('questions');
      expect(results.results).toHaveProperty('pyqs');
      expect(results.results).toHaveProperty('notes');
      expect(results.results).toHaveProperty('answers');
    });
  });

  describe('5. Empty Query & No-Result States', () => {
    it('returns popular SPPU searches when query is empty', () => {
      const results = executeUnifiedSearch('');
      expect(results.total_matches).toBe(0);
      expect(results.popular_searches.length).toBeGreaterThanOrEqual(5);
      expect(results.popular_searches).toContain('3NF vs BCNF');
      expect(results.popular_searches).toContain('ACID Properties');
    });

    it('returns helpful spelling & refinement suggestions when 0 matches found', () => {
      const results = executeUnifiedSearch('xyznonexistentquery999');
      expect(results.total_matches).toBe(0);
      expect(results.suggestions).toBeDefined();
      expect(results.suggestions?.length).toBeGreaterThan(0);
    });
  });

  describe('6. Performance & Non-Mandatory AI', () => {
    it('executes search deterministically and rapidly in under 25ms', () => {
      const results = executeUnifiedSearch('Database Management');
      expect(results.search_time_ms).toBeLessThan(25);
    });

    it('supports future natural-language semantic vector hooks without breaking basic search', () => {
      const mockVector = [0.12, 0.45, -0.22];
      const results = executeUnifiedSearch(
        'Database',
        {},
        {
          vectorEmbedding: mockVector,
          semanticReranker: (items) => items, // identity hook
        }
      );
      expect(results.total_matches).toBeGreaterThan(0);
    });
  });

  describe('7. API Route Integration (/api/search)', () => {
    it('processes GET /api/search with query parameters successfully', async () => {
      const req = new NextRequest('http://localhost:3000/api/search?q=Normalization&subject_id=sub-dbms', {
        method: 'GET',
      });

      const res = await searchGetHandler(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data.results).toBeDefined();
      expect(json.data.total_matches).toBeGreaterThan(0);
      expect(json.data.results.topics.length).toBeGreaterThan(0);
    });

    it('processes POST /api/search with optional vector payload', async () => {
      const req = new NextRequest('http://localhost:3000/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          q: 'ACID properties',
          category: 'ALL',
          vector_embedding: [0.1, 0.2, 0.3],
        }),
      });

      const res = await searchPostHandler(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data.total_matches).toBeGreaterThan(0);
    });
  });
});
