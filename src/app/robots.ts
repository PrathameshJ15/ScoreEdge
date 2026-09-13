import { MetadataRoute } from 'next';
import { BUSINESS_CONFIG } from '@/lib/config/business';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = BUSINESS_CONFIG.officialWebsite;

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/reset-password',
          '/forgot-password',
          '/_next/',
          '/private/',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/', '/admin/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}