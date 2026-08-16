import Link from 'next/link';

export const dynamic = 'force-dynamic';

async function getAIPrinciples() {
  try {
    const res = await fetch('http://localhost:3000/api/ai/principles', { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed');
    return await res.json();
  } catch (e) {
    return {
      model: 'nvidia/nemotron-3.5-lightning:free',
      principles: [
        "1. Specificity & Detail: Reward reviews containing rich, experience-specific observations over vague generalities.",
        "2. Factual Consistency: Cross-examine review claims against verified hotel amenities and structural metadata.",
        "3. Anti-Spam & Template Detection: Flag repetitive phrasing, excessive promotional language, or copy-pasted templates.",
        "4. Non-Discriminatory Evaluation: Assess content behavior exclusively, ignoring user demographics."
      ],
      generatedByAI: false
    };
  }
}

export default async function AIPrinciplesPage() {
  const data = await getAIPrinciples();

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ padding: '1rem', background: 'linear-gradient(135deg, var(--primary), var(--accent))', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.4)' }}>
            <svg style={{ width: '2.5rem', height: '2.5rem' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
          <div>
            <h1 style={{ fontSize: '2rem', margin: 0, letterSpacing: '-0.02em' }} className="text-gradient">AI Transparency</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Powered by OpenRouter Gateway</p>
          </div>
        </div>

        <div style={{ padding: '1rem', backgroundColor: 'var(--bg-color)', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Active Model</div>
          <code style={{ fontSize: '1.1rem', color: 'var(--primary-color)' }}>{data.model}</code>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            OpenRouter Provider: NVIDIA Nemotron 3.5 Lightning (Free Tier)
          </div>
        </div>

        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', fontWeight: 600 }}>Evaluation Principles</h2>
        <div style={{ color: 'var(--primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500 }}>
          {data.generatedByAI ? (
            <>
              <svg style={{width:'1.25rem',height:'1.25rem'}} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              These principles were dynamically generated live by the NVIDIA LLM:
            </>
          ) : 'Core evaluation methodology:'}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {data.principles.map((principle: string, idx: number) => (
            <div key={idx} style={{ padding: '1.25rem', border: '1px solid var(--border)', borderRadius: '0.75rem', background: 'var(--bg-surface-elevated)' }}>
              <div style={{ fontWeight: 'bold', color: 'var(--primary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '1.5rem', height: '1.5rem', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.1)', fontSize: '0.875rem' }}>{idx + 1}</span>
                Core Principle
              </div>
              <p style={{ margin: 0, color: 'var(--text-primary)', lineHeight: '1.6' }}>{principle}</p>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <Link href="/" className="btn btn-primary">
            ← Back to Hotels
          </Link>
        </div>
      </div>
    </div>
  );
}
