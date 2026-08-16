import dbConnect from '@/lib/db/mongodb';
import { Hotel, Review, User } from '@/lib/db/models';
import Link from 'next/link';
import ReviewFilter from './ReviewFilter';

export const dynamic = 'force-dynamic';

function TrustBadge({ score }: { score: number }) {
  let badgeClass = 'badge-success';
  let label = 'High Trust';
  if (score < 50) {
    badgeClass = 'badge-danger';
    label = 'Low Trust';
  } else if (score < 80) {
    badgeClass = 'badge-warning';
    label = 'Moderate Trust';
  }
  
  return (
    <span className={`badge ${badgeClass}`} title="AI-assisted trust estimate based on consistency, specificity, and authenticity signals">
      AI Score: {score}/100 ({label})
    </span>
  );
}

export default async function HotelDetail({ params, searchParams }: { params: Promise<{ id: string }>, searchParams: Promise<{ filter?: string }> }) {
  await dbConnect();
  
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const filter = resolvedSearchParams.filter || 'all';

  const hotel = await Hotel.findById(resolvedParams.id).lean();
  
  if (!hotel) {
    return <div>Hotel not found</div>;
  }

  // Determine query based on filter
  let query: any = { hotelId: resolvedParams.id };

  if (filter === 'verified') {
    query.verifiedBooking = true;
  } else if (filter === 'high_trust') {
    query.aiTrustScore = { $gte: 80 };
  } else if (filter === 'trusted') {
    // For demo: filter by Alice's trusted network
    const alice = await User.findOne({ username: 'alice' }).lean();
    if (alice && alice.trustedUsers && alice.trustedUsers.length > 0) {
      query.userId = { $in: alice.trustedUsers };
    } else {
      // If no trusted users, return no reviews for this filter
      query.userId = null; 
    }
  }

  // Get total review count unconditionally for the filter UI
  const totalReviews = await Review.countDocuments({ hotelId: resolvedParams.id });

  // Fetch filtered reviews and populate user details
  const reviews = await Review.find(query)
    .populate({ path: 'userId', select: 'username displayName verificationStatus trustedUsers' })
    .sort({ createdAt: -1 })
    .lean();

  return (
    <div>
      {hotel.imageUrl && (
        <div style={{ width: '100%', height: '400px', borderRadius: '1rem', overflow: 'hidden', marginBottom: '2rem', border: '1px solid var(--border)', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)' }}>
          <img src={hotel.imageUrl} alt={hotel.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      )}
      <div style={{ marginBottom: '3rem' }}>
        <h1 className="text-gradient" style={{ fontSize: '3rem', marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>{hotel.name}</h1>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', color: 'var(--text-secondary)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <svg className="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {hotel.location}
          </span>
          <span className="badge badge-info" style={{ fontWeight: 600 }}>${hotel.pricePerNight || 250}/night</span>
        </div>
        
        <div style={{ marginTop: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
           {hotel.amenities.map((amenity: string, idx: number) => (
             <span key={idx} style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border)', padding: '0.375rem 1rem', borderRadius: '999px', fontSize: '0.875rem' }}>{amenity}</span>
           ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '2rem' }}>
        <aside>
          <div className="card" style={{ padding: '1.5rem', position: 'sticky', top: '100px' }}>
            <h3 style={{ marginBottom: '1.25rem', fontSize: '1.25rem' }}>Review Filters</h3>
            <ReviewFilter totalReviews={totalReviews} />
            
            <hr style={{ margin: '1rem 0', borderColor: 'var(--border-color)', borderTop: 'none' }}/>
            
            <Link href={`/hotel/${hotel._id}/write-review`} className="btn btn-primary" style={{ width: '100%' }}>
              Write a Review
            </Link>
          </div>
        </aside>
        
        <main style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {reviews.length === 0 ? (
            <p>No reviews yet.</p>
          ) : (
             reviews.map((review: any) => (
               <div key={review._id.toString()} className="card" style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                   <div>
                     <Link href={`/user/${review.userId.username}`} style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.125rem' }}>
                       {review.userId.displayName} 
                       {review.userId.verificationStatus && (
                         <span style={{ color: 'var(--success)' }} title="Identity Verified">
                           <svg className="icon" viewBox="0 0 20 20" fill="currentColor">
                             <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                           </svg>
                         </span>
                       )}
                     </Link>
                     <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
                       {review.verifiedBooking ? (
                         <>
                           <svg style={{width:'1rem',height:'1rem',color:'var(--success)'}} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                           Verified Booking
                         </>
                       ) : 'Unverified Booking'}
                     </div>
                   </div>
                   <div style={{ textAlign: 'right' }}>
                     <div style={{ display: 'flex', gap: '0.125rem', color: 'var(--warning)', justifyContent: 'flex-end' }}>
                       {Array.from({ length: 5 }).map((_, i) => (
                         <svg key={i} style={{ width: '1.25rem', height: '1.25rem' }} fill={i < review.rating ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={i < review.rating ? 0 : 1.5}>
                           <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                         </svg>
                       ))}
                     </div>
                     <div style={{ marginTop: '0.75rem' }}>
                       {review.aiTrustScore !== null && <TrustBadge score={review.aiTrustScore} />}
                     </div>
                   </div>
                 </div>
                 
                 <p style={{ whiteSpace: 'pre-line', fontSize: '1.05rem', lineHeight: '1.7', color: 'var(--text-primary)' }}>{review.text}</p>
                 
                 {review.aiAnalysis && review.aiAnalysis.reasoning_summary && (
                   <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: 'var(--bg-surface-elevated)', border: '1px solid var(--border)', borderRadius: '0.75rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                     <strong style={{ color: 'var(--text-primary)' }}>AI Analysis:</strong> {review.aiAnalysis.reasoning_summary}
                   </div>
                 )}
               </div>
             ))
          )}
        </main>
      </div>
    </div>
  );
}
