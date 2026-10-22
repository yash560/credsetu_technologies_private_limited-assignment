import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://credsetutechnologiesprivatelimited.vercel.app'),
  title: 'MiniLedger — Peer Debt & Money Lent Tracker | Credsetu Technologies',
  description:
    'MiniLedger tracks money lent to friends with polite WhatsApp reminders, Cloudinary receipt verification, overdue debt diagnostics, and zero awkwardness. Powered by TheWebVale.',
  keywords: [
    'MiniLedger',
    'Peer Lending',
    'Debt Tracker',
    'Money Lent to Friends',
    'Split Bills',
    'Polite WhatsApp Reminders',
    'Credsetu Technologies',
    'TheWebVale',
    'Next.js 15',
    'TypeScript',
  ],
  authors: [{ name: 'Credsetu Technologies & TheWebVale' }],
  creator: 'TheWebVale',
  publisher: 'Credsetu Technologies Private Limited',
  robots: {
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
    type: 'website',
    locale: 'en_IN',
    url: 'https://credsetutechnologiesprivatelimited.vercel.app',
    siteName: 'MiniLedger by Credsetu Technologies',
    title: 'MiniLedger — Peer Debt & Money Lent Tracker | Powered by TheWebVale',
    description:
      'Keep friendly loans and shared bills crystal clear. Courteous automated WhatsApp and SMTP reminders, receipt proof vault, and strict zero-leak security.',
    images: [
      {
        url: 'https://credsetutechnologiesprivatelimited.vercel.app/og-image.png',
        width: 1200,
        height: 630,
        alt: 'MiniLedger Peer Debt Tracker',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MiniLedger — Peer Debt Tracker | Powered by TheWebVale',
    description:
      'Courteous peer debt tracking with zero awkwardness, receipt proofs, and strict auth security. Powered by TheWebVale.',
    images: ['https://credsetutechnologiesprivatelimited.vercel.app/og-image.png'],
    creator: '@TheWebVale',
  },
  alternates: {
    canonical: 'https://credsetutechnologiesprivatelimited.vercel.app',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>✦</text></svg>" />
      </head>
      <body className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 antialiased selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
