'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export default function ReviewFilter({ totalReviews }: { totalReviews: number }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentFilter = searchParams.get('filter') || 'all';

  const handleFilterChange = (filterValue: string) => {
    router.push(`?filter=${filterValue}`, { scroll: false });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
       <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: currentFilter === 'all' ? 'var(--primary)' : 'var(--text-primary)' }}>
         <input type="radio" name="filter" checked={currentFilter === 'all'} onChange={() => handleFilterChange('all')} style={{ cursor: 'pointer' }} /> 
         All Reviews ({totalReviews})
       </label>
       <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: currentFilter === 'verified' ? 'var(--primary)' : 'var(--text-primary)' }}>
         <input type="radio" name="filter" checked={currentFilter === 'verified'} onChange={() => handleFilterChange('verified')} style={{ cursor: 'pointer' }} /> 
         Verified Users Only
       </label>
       <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: currentFilter === 'trusted' ? 'var(--primary)' : 'var(--text-primary)' }}>
         <input type="radio" name="filter" checked={currentFilter === 'trusted'} onChange={() => handleFilterChange('trusted')} style={{ cursor: 'pointer' }} /> 
         Trusted Network
       </label>
       <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: currentFilter === 'high_trust' ? 'var(--primary)' : 'var(--text-primary)' }}>
         <input type="radio" name="filter" checked={currentFilter === 'high_trust'} onChange={() => handleFilterChange('high_trust')} style={{ cursor: 'pointer' }} /> 
         High AI Trust
       </label>
    </div>
  );
}
