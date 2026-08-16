import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Link from 'next/link';
import { auth, signIn, signOut } from '@/auth';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'TrustHotel - AI Powered Reviews',
  description: 'Trust-aware hotel comparison platform',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

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
              
              {session?.user ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <Link href={`/user/${(session.user as any).username}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500 }}>
                    {session.user.image ? (
                      <img src={session.user.image} alt="Profile" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                    ) : (
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {session.user.name?.charAt(0) || 'U'}
                      </div>
                    )}
                    {session.user.name}
                  </Link>
                  <form action={async () => {
                    'use server';
                    await signOut();
                  }}>
                    <button type="submit" className="btn btn-outline" style={{ padding: '0.375rem 0.75rem', fontSize: '0.875rem' }}>Logout</button>
                  </form>
                </div>
              ) : (
                <form action={async () => {
                  'use server';
                  await signIn("google");
                }}>
                  <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg"><path fill="#fff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#fff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#fff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#fff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                    Sign in
                  </button>
                </form>
              )}
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
