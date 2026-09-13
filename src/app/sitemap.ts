import { MetadataRoute } from 'next';
import { BUSINESS_CONFIG } from '@/lib/config/business';
import { dbStore } from '@/lib/db/client';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = BUSINESS_CONFIG.officialWebsite;
  const now = new Date();

  // Static core routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/explore`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/syllabus`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/pyqs`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/questions`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/exam-mode`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.75,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/refund`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.4,
    },
  ];

  // Dynamic Subject routes
  const subjectRoutes: MetadataRoute.Sitemap = dbStore.subjects.map((subject) => ({
    url: `${baseUrl}/subject/${subject.code.toLowerCase()}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // Dynamic Question detail routes (published only)
  const questionRoutes: MetadataRoute.Sitemap = dbStore.questions
    .filter((q) => q.content_status === 'PUBLISHED' && !q.deleted_at)
    .slice(0, 100) // Keep sitemap balanced
    .map((q) => ({
      url: `${baseUrl}/questions/${q.id}`,
      lastModified: q.updated_at ? new Date(q.updated_at) : now,
      changeFrequency: 'monthly',
      priority: 0.7,
    }));

  return [...staticRoutes, ...subjectRoutes, ...questionRoutes];
}