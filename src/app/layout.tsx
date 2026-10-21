import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MiniLedger — Peer Debt & Money Lent Tracker | Credsetu Technologies',
  description:
    'MiniLedger tracks money lent to friends with mock OTP authentication, overdue debt highlighting, receipt verification, and real-time financial summaries. Engineered for Credsetu Technologies.',
  keywords: ['MiniLedger', 'Peer Lending', 'Debt Tracker', 'React Native', 'Node.js', 'PostgreSQL', 'TypeScript'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 antialiased selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
