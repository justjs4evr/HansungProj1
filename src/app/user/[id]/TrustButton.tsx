'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function TrustButton({
  targetUserId,
  isInitiallyTrusted,
  isSelf
}: {
  targetUserId: string;
  isInitiallyTrusted: boolean;
  isSelf: boolean;
}) {
  const router = useRouter();
  const [isTrusted, setIsTrusted] = useState(isInitiallyTrusted);
  const [loading, setLoading] = useState(false);

  if (isSelf) {
    return (
      <span className="badge badge-info" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
        Your Profile
      </span>
    );
  }

  const handleToggleTrust = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/user/trust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId, currentUsername: 'alice' })
      });

      const data = await res.json();
      if (res.ok) {
        setIsTrusted(data.isTrusted);
        router.refresh();
      }
    } catch (err) {
      console.error('Failed to update trust status:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggleTrust}
      disabled={loading}
      className={`btn ${isTrusted ? 'btn-outline' : 'btn-primary'}`}
      style={{
        display: 'flex',
        gap: '0.5rem',
        alignItems: 'center',
        padding: '0.75rem 1.75rem',
        borderColor: isTrusted ? 'var(--success)' : undefined,
        color: isTrusted ? 'var(--success)' : undefined
      }}
    >
      {loading ? (
        <span>Updating...</span>
      ) : isTrusted ? (
        <>
          <svg className="icon" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Trusted Reviewer
        </>
      ) : (
        <>
          <svg className="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Trust Reviewer
        </>
      )}
    </button>
  );
}
