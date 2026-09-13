import { Metadata } from 'next';
import { BUSINESS_CONFIG } from '@/lib/config/business';

export const SITE_URL = BUSINESS_CONFIG.officialWebsite;

export interface PageMetadataProps {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  ogType?: 'website' | 'article';
  noIndex?: boolean;
}

/**
 * Constructs production-grade metadata with title templates, descriptions,
 * canonical URLs, Open Graph, Twitter cards, and robots directives.
 */
export function constructMetadata({
  title,
  description,
  path,
  keywords = [],
  ogType = 'website',
  noIndex = false,
}: PageMetadataProps): Metadata {
  const fullUrl = `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;

  const baseKeywords = [
    'SPPU exam preparation',
    'Pune University engineering',
    'SPPU PYQ questions',
    'SE Computer Engineering SPPU',
    'SPPU solved question papers',
    'ScoreEdge',
    'engineering exam notes',
    'SPPU model answers',
    ...keywords,
  ];

  return {
    title: `${title} | ScoreEdge SPPU`,
    description,
    keywords: baseKeywords,
    authors: [{ name: BUSINESS_CONFIG.legalEntity, url: SITE_URL }],
    creator: BUSINESS_CONFIG.name,
    publisher: BUSINESS_CONFIG.legalEntity,
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical: fullUrl,
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
        }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
          },
        },
    openGraph: {
      type: ogType,
      locale: 'en_IN',
      url: fullUrl,
      title: `${title} | ScoreEdge SPPU`,
      description,
      siteName: 'ScoreEdge',
      images: [
        {
          url: `${SITE_URL}/og-image.png`,
          width: 1200,
          height: 630,
          alt: `${title} - ScoreEdge SPPU Intelligence`,
        },
      ],
    },
    icons: {
      icon: '/logo.png',
      shortcut: '/logo.png',
      apple: '/logo.png',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ScoreEdge SPPU`,
      description,
      creator: '@ScoreEdgeSPPU',
      images: [`${SITE_URL}/logo.png`],
    },
  };
}

/**
 * Generates Schema.org EducationalOrganization structured data JSON-LD.
 */
export function getEducationalOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: BUSINESS_CONFIG.name,
    legalName: BUSINESS_CONFIG.legalEntity,
    url: BUSINESS_CONFIG.officialWebsite,
    logo: `${BUSINESS_CONFIG.officialWebsite}/logo.png`,
    description: BUSINESS_CONFIG.tagline,
    email: BUSINESS_CONFIG.businessEmail,
    telephone: BUSINESS_CONFIG.phoneNumber,
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'FC Road, Shivaji Nagar',
      addressLocality: 'Pune',
      addressRegion: 'Maharashtra',
      postalCode: '411005',
      addressCountry: 'IN',
    },
    sameAs: [
      'https://twitter.com/ScoreEdgeSPPU',
      'https://www.linkedin.com/company/scoreedge',
    ],
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: BUSINESS_CONFIG.phoneNumber,
        contactType: 'customer support',
        areaServed: 'IN',
        availableLanguage: ['English', 'Hindi', 'Marathi'],
      },
      {
        '@type': 'ContactPoint',
        telephone: BUSINESS_CONFIG.mobileNumber,
        contactType: 'technical support',
        areaServed: 'IN',
        availableLanguage: ['English', 'Hindi', 'Marathi'],
      },
    ],
  };
}

/**
 * Generates Schema.org WebSite structured data with SearchAction.
 */
export function getWebSiteSearchSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: BUSINESS_CONFIG.name,
    url: BUSINESS_CONFIG.officialWebsite,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${BUSINESS_CONFIG.officialWebsite}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * Generates Schema.org BreadcrumbList structured data.
 */
export function getBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${BUSINESS_CONFIG.officialWebsite}${item.url}`,
    })),
  };
}