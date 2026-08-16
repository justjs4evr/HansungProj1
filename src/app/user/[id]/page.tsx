import dbConnect from '@/lib/db/mongodb';
import { User, Review } from '@/lib/db/models';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function UserProfile({ params }: { params: Promise<{ id: string }> }) {
  await dbConnect();

  const resolvedParams = await params;
  // The id is the username in our current URL structure
  const user = await User.findOne({ username: resolvedParams.id }).populate('trustedUsers', 'username displayName verificationStatus').lean();

  if (!user) {
    return <div>User not found</div>;
  }

  // Fetch their reviews
  const reviews = await Review.find({ userId: user._id })
    .populate('hotelId', 'name')
    .sort({ createdAt: -1 })
    .lean();

  return (
    <div style={{ paddingBottom: '4rem' }}>
      <div className="card" style={{ padding: '2.5rem', marginBottom: '2.5rem', display: 'flex', gap: '2.5rem', alignItems: 'center' }}>
        <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--accent))', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3.5rem', fontWeight: 'bold', boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.4)' }}>
          {user.displayName.charAt(0).toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', letterSpacing: '-0.02em' }}>
            {user.displayName}
            {user.verificationStatus && (
               <span className="badge badge-success" style={{ fontSize: '0.875rem', padding: '0.375rem 0.875rem' }}>
                 <svg className="icon" viewBox="0 0 20 20" fill="currentColor">
                   <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                 </svg>
                 Verified Identity
               </span>
            )}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.125rem' }}>@{user.username}</p>
          <div style={{ marginTop: '1.25rem', display: 'flex', gap: '1.5rem' }}>
            <span style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>{reviews.length}</span> Reviews
            </span>
            <span style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent)' }}>{user.trustedUsers?.length || 0}</span> Trusted Reviewers
            </span>
          </div>
        </div>
        <div>
          {/* Trust Action Button - mocked for UI */}
          <button className="btn btn-primary" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', padding: '0.75rem 2rem' }}>
            <svg className="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
            Trust Reviewer
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '2rem' }}>
        <main>
          <h2 style={{ marginBottom: '1.5rem' }}>Recent Reviews</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {reviews.length === 0 ? (
              <p>No reviews written.</p>
            ) : (
              reviews.map((review: any) => (
                <div key={review._id.toString()} className="card" style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                    <div>
                      <Link href={`/hotel/${review.hotelId._id}`} style={{ fontWeight: 'bold', fontSize: '1.35rem', display: 'inline-block', marginBottom: '0.25rem' }} className="text-gradient">
                        {review.hotelId.name}
                      </Link>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        {review.verifiedBooking ? (
                           <>
                             <svg style={{width:'1rem',height:'1rem',color:'var(--success)'}} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                             Verified Booking
                           </>
                        ) : 'Unverified Booking'}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.125rem', color: 'var(--warning)', justifyContent: 'flex-end', height: 'fit-content' }}>
                       {Array.from({ length: 5 }).map((_, i) => (
                         <svg key={i} style={{ width: '1.25rem', height: '1.25rem' }} fill={i < review.rating ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={i < review.rating ? 0 : 1.5}>
                           <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                         </svg>
                       ))}
                    </div>
                  </div>
                  <p style={{ color: 'var(--text-primary)', lineHeight: '1.7' }}>{review.text}</p>
                </div>
              ))
            )}
          </div>
        </main>

        <aside>
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>Trusted Network</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {(!user.trustedUsers || user.trustedUsers.length === 0) ? (
                <p style={{ color: 'var(--text-secondary)' }}>No trusted users yet.</p>
              ) : (
                user.trustedUsers.map((tu: any) => (
                  <Link href={`/user/${tu.username}`} key={tu._id.toString()} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: '0.5rem', transition: 'background 0.2s ease' }} className="card-hover">
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--bg-surface-elevated), var(--border))', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                      {tu.displayName.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{tu.displayName}</div>
                      {tu.verificationStatus && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.125rem', marginTop: '0.125rem' }}>
                          <svg style={{width:'0.875rem',height:'0.875rem'}} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          Verified
                        </div>
                      )}
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
