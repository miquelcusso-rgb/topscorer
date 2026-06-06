import SaasShell from '@/components/saas/SaasShell'

export interface LegalBlock { h?: string; p?: string }

// Shared renderer for the legal/static pages (Terms, Cookies, Disclaimer…).
// Server component — content is passed in already localized.
export default function LegalDoc({
  lang, breadcrumb, title, updated, intro, blocks,
}: {
  lang: 'es' | 'en'
  breadcrumb: string[]
  title: string
  updated?: string
  intro?: string
  blocks: LegalBlock[]
}) {
  return (
    <SaasShell activeKey="stats" breadcrumb={breadcrumb}>
      <main style={{ maxWidth: 760, margin: '0 auto', padding: '32px 4px 64px', color: 'var(--ts-text)' }}>
        <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(32px,6vw,48px)', fontWeight: 800, lineHeight: 1.05, margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.01em' }}>
          {title}
        </h1>
        {updated && <div style={{ fontSize: 12, color: 'var(--ts-faint)', marginBottom: 18 }}>{lang === 'en' ? 'Last updated' : 'Última actualización'}: {updated}</div>}
        {intro && <p style={{ fontSize: 15, lineHeight: 1.65, color: 'var(--ts-muted)', marginBottom: 8 }}>{intro}</p>}
        {blocks.map((b, i) => (
          <div key={i}>
            {b.h && <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 20, fontWeight: 800, color: 'var(--ts-text)', margin: '22px 0 8px' }}>{b.h}</h2>}
            {b.p && <p style={{ fontSize: 14.5, lineHeight: 1.65, color: 'var(--ts-muted)', margin: '0 0 8px' }}>{b.p}</p>}
          </div>
        ))}
        <p style={{ fontSize: 12, color: 'var(--ts-faint)', marginTop: 32 }}>
          {lang === 'en' ? 'Operated by Furiosa Studio · ' : 'Operado por Furiosa Studio · '}
          <a href="mailto:hello@top-scorers.com" style={{ color: 'var(--ts-primary)' }}>hello@top-scorers.com</a>
        </p>
      </main>
    </SaasShell>
  )
}
