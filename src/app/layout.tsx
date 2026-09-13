import type { Metadata } from 'next';
import { Inter, Source_Serif_4 } from 'next/font/google';
import './globals.css';
import { MobileBottomNav } from '@/components/navigation/MobileBottomNav';
import { AuthProvider } from '@/context/AuthContext';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
});

const sourceSerif = Source_Serif_4({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-source-serif',
  display: 'swap',
});

import { constructMetadata, getEducationalOrganizationSchema, getWebSiteSearchSchema } from '@/lib/seo/metadata';

export const metadata: Metadata = constructMetadata({
  title: 'SPPU Exam Intelligence & Solved PYQ Repository',
  description:
    "Don't study everything. Study what matters. Authoritative SPPU Pune University exam preparation powered by PYQ intelligence, repeated question clusters, model answers, and high-yield notes.",
  path: '/',
  keywords: [
    'SPPU Pune University',
    'SPPU PYQ questions',
    'SE Computer Engineering 2019 pattern',
    'DBMS solved papers',
    'DSA questions SPPU',
    'Insem Endsem preparation',
    'ScoreEdge',
  ],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const orgSchema = getEducationalOrganizationSchema();
  const searchSchema = getWebSiteSearchSchema();

  return (
    <html lang="en" className={`${inter.variable} ${sourceSerif.variable} scroll-smooth`}>
      <body className={`${inter.className} min-h-screen flex flex-col bg-[#faf9f5] text-[#0f172a] dark:bg-[#0a1120] dark:text-[#f8fafc] antialiased font-sans selection:bg-teal-600/15 selection:text-teal-800`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(searchSchema) }}
        />
        <AuthProvider>
          <div className="flex-1 flex flex-col pb-16 md:pb-0">
            {children}
          </div>
          <MobileBottomNav />
        </AuthProvider>
      </body>
    </html>
  );
}
