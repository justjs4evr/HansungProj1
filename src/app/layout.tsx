import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Link from 'next/link';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'TrustHotel - AI Powered Reviews',
  description: 'Trust-aware hotel comparison platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <header className="glass-nav" style={{ padding: '1.25rem 0' }}>
          <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Link href="/" style={{ fontSize: '1.5rem', fontWeight: 'bold' }} className="text-gradient">
              TrustHotel
            </Link>
            <nav style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
              <Link href="/" style={{ fontWeight: 500, fontSize: '0.95rem' }}>Hotels</Link>
              <Link href="/ai-principles" style={{ fontWeight: 500, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.95rem' }}>
                <svg className="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                AI Principles
              </Link>
              <Link href="/user/alice" style={{ fontWeight: 500, fontSize: '0.95rem' }}>Profile</Link>
            </nav>
          </div>
        </header>
        <main className="container" style={{ padding: '2rem 1rem' }}>
          {children}
        </main>
      </body>
    </html>
  );
}
