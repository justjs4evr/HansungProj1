import dbConnect from '@/lib/db/mongodb';
import { User } from '@/lib/db/models';
import Link from 'next/link';
import TrustButton from '../user/[id]/TrustButton';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';

export default async function ReviewersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await dbConnect();
  
  const resolvedParams = await searchParams;
  const query = resolvedParams.q || '';
  
  // Find current session user
  const session = await auth();
  let currentUser = null;
  if (session?.user?.email) {
    currentUser = await User.findOne({ email: session.user.email }).lean();
  }

  // Build MongoDB query
  let dbQuery = {};
  if (query) {
    dbQuery = {
      $or: [
        { displayName: { $regex: query, $options: 'i' } },
        { username: { $regex: query, $options: 'i' } }
      ]
    };
  }

  // Fetch users (limit to 50 for performance)
  const users = await User.find(dbQuery).limit(50).lean();

  return (
    <div style={{ paddingBottom: '4rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>Reviewer Network</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.125rem' }}>Find other reviewers and build your Trusted Network to get better recommendations.</p>
      </div>

      <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <form method="GET" action="/reviewers" style={{ display: 'flex', gap: '1rem' }}>
          <input 
            type="text" 
            name="q" 
            defaultValue={query}
            placeholder="Search reviewers by name or username..." 
            style={{ flex: 1, padding: '0.75rem 1rem', borderRadius: '0.5rem', border: '1px solid var(--border)', background: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: '1rem' }}
          />
          <button type="submit" className="btn btn-primary" style={{ padding: '0 2rem' }}>Search</button>
        </form>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
        {users.length === 0 ? (
          <p>No reviewers found.</p>
        ) : (
          users.map((user: any) => {
            const isSelf = currentUser ? currentUser.username === user.username : false;
            const isInitiallyTrusted = currentUser?.trustedUsers?.some(
              (id: any) => id.toString() === user._id.toString()
            ) || false;

            return (
              <div key={user._id.toString()} className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Link href={`/user/${user.username}`} style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.displayName} style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--accent))', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold' }}>
                      {user.displayName?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '1.125rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                      {user.displayName}
                      {user.verificationStatus && (
                         <span style={{ color: 'var(--success)' }} title="Identity Verified">
                           <svg style={{width:'1.125rem',height:'1.125rem'}} viewBox="0 0 20 20" fill="currentColor">
                             <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                           </svg>
                         </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>@{user.username}</div>
                  </div>
                </Link>

                <div style={{ marginLeft: '1rem' }}>
                  <TrustButton
                    targetUserId={user._id.toString()}
                    isInitiallyTrusted={isInitiallyTrusted}
                    isSelf={isSelf}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
