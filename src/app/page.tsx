import dbConnect from '@/lib/db/mongodb';
import { Hotel } from '@/lib/db/models';
import Link from 'next/link';

// Force dynamic to avoid caching issues during development
export const dynamic = 'force-dynamic';

export default async function Home() {
  await dbConnect();
  // Fetch all hotels
  const hotels = await Hotel.find({}).lean();

  return (
    <div>
      <div style={{ marginBottom: '4rem', textAlign: 'center', marginTop: '2rem' }}>
        <h1 className="text-gradient" style={{ fontSize: '3.5rem', marginBottom: '1rem', letterSpacing: '-0.03em' }}>Find Trusted Stays</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem', maxWidth: '600px', margin: '0 auto' }}>
          Discover hotels with reviews verified by real bookings and AI-assisted trust scores.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {hotels.map((hotel: any) => (
          <Link href={`/hotel/${hotel._id}`} key={hotel._id.toString()}>
            <div className="card card-hover" style={{ height: '100%', cursor: 'pointer', display: 'flex', flexDirection: 'column' }}>
              <div style={{ height: '220px', backgroundColor: 'var(--bg-surface-elevated)', overflow: 'hidden', position: 'relative' }}>
                {hotel.imageUrl ? (
                  <img src={hotel.imageUrl} alt={hotel.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg style={{ width: '3rem', height: '3rem', color: 'var(--text-secondary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                )}
              </div>
              <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <h3 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 600 }}>{hotel.name}</h3>
                  <span className="badge badge-info" style={{ fontWeight: 600 }}>${hotel.pricePerNight || 250}/night</span>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <svg className="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {hotel.location}
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: 'auto' }}>
                  {hotel.amenities.slice(0, 3).map((amenity: string, i: number) => (
                    <span key={i} style={{ fontSize: '0.75rem', backgroundColor: 'var(--bg-surface-elevated)', border: '1px solid var(--border)', padding: '0.25rem 0.75rem', borderRadius: '999px', color: 'var(--text-secondary)' }}>
                      {amenity}
                    </span>
                  ))}
                  {hotel.amenities.length > 3 && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', padding: '0.25rem 0.5rem' }}>+{hotel.amenities.length - 3}</span>
                  )}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
