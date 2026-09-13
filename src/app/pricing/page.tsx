import React from 'react';
import { Metadata } from 'next';
import { PricingClientView } from '@/components/pricing/PricingClientView';
import { constructMetadata, getBreadcrumbSchema } from '@/lib/seo/metadata';

export const metadata: Metadata = constructMetadata({
  title: 'Pricing & Passes — Single Subject & Semester All-Access',
  description:
    'Choose your SPPU engineering pass. Flexible pricing for single subject passes or complete semester all-access passes with instant UPI activation.',
  path: '/pricing',
  keywords: ['SPPU pass pricing', 'DBMS pass price', 'SE Computer semester pass', 'engineering exam notes cost'],
});

export default function PricingPage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Pricing & Passes', url: '/pricing' },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <PricingClientView />
    </>
  );
}

