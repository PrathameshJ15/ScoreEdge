import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ScoreEdge — SPPU Exam Intelligence Platform',
  description: 'Study smarter. Score better. An SPPU-focused exam preparation platform combining PYQ frequency intelligence, 2/5/10-mark solved answers, and 5-hour emergency preparation plans.',
  keywords: ['SPPU', 'Pune University', 'PYQ', 'Engineering Notes', 'SE Computer', 'DBMS', 'Exam Preparation', 'PYQ Analysis'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        {children}
      </body>
    </html>
  );
}
