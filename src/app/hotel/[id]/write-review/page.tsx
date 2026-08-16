'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function WriteReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();

  const [text, setText] = useState('');
  const [rating, setRating] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setStatusMessage('Analyzing review with NVIDIA Nemotron 3.5 AI...');

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hotelId: resolvedParams.id,
          text,
          rating,
          username: 'alice' // Current user context
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit review');
      }

      setStatusMessage('Review analyzed & posted! Redirecting...');
      setTimeout(() => {
        router.push(`/hotel/${resolvedParams.id}`);
        router.refresh();
      }, 1500);

    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div className="card" style={{ padding: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', marginBottom: '1.5rem' }}>Write a Review</h1>

        {error && (
          <div style={{ padding: '0.75rem', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '0.375rem', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        {statusMessage && !error && (
          <div style={{ padding: '1rem', backgroundColor: 'rgba(59, 130, 246, 0.1)', border: '1px solid var(--primary)', color: 'var(--primary)', borderRadius: '0.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <svg style={{width:'1.25rem',height:'1.25rem'}} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            {statusMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontWeight: 500, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>Rating</label>
            <select 
              value={rating} 
              onChange={(e) => setRating(Number(e.target.value))}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)', fontSize: '1rem', background: 'var(--bg-surface)', color: 'var(--text-primary)' }}
            >
              <option value={5}>5 Stars - Excellent</option>
              <option value={4}>4 Stars - Good</option>
              <option value={3}>3 Stars - Average</option>
              <option value={2}>2 Stars - Poor</option>
              <option value={1}>1 Star - Terrible</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 500, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>Your Review</label>
            <textarea
              rows={6}
              required
              placeholder="Describe your stay experience in detail (e.g. room cleanliness, staff service, specific amenities)..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              style={{ width: '100%', padding: '1rem', borderRadius: '0.5rem', border: '1px solid var(--border)', fontSize: '1rem', fontFamily: 'inherit', background: 'var(--bg-surface)', color: 'var(--text-primary)', resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <Link href={`/hotel/${resolvedParams.id}`} className="btn btn-outline" style={{ padding: '0.75rem 2rem' }}>
              Cancel
            </Link>
            <button type="submit" disabled={loading} className="btn btn-primary" style={{ padding: '0.75rem 2.5rem' }}>
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <svg className="icon" style={{ animation: 'spin 1s linear infinite' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                  Analyzing...
                </span>
              ) : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
