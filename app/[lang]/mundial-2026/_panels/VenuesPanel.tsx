'use client'

import { useLang } from '@/contexts/LangContext'
import { t, VENUES, flagOf } from './shared'

// ─── Venues panel (Sedes) ─────────────────────────────────────────────────────

export default function VenuesPanel() {
  const { lang } = useLang()
  const countries = ['USA', 'Mexico', 'Canada']
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {countries.map(country => (
        <div key={country}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10, color: 'var(--ts-muted)', fontFamily: "'Barlow Condensed', sans-serif" }}>
            <span style={{ fontSize: 16 }}>{flagOf(country)}</span>
            {country}
          </div>
          <div style={{ display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
            {VENUES.filter(v => v.country === country).map(venue => (
              <div key={venue.stadium} style={{
                borderRadius: 12, padding: '14px 16px', background: 'var(--ts-card)',
                border: `1px solid ${venue.final ? 'var(--ts-border-hot)' : 'var(--ts-border)'}`,
              }}>
                {venue.final && (
                  <span style={{ display: 'inline-block', fontSize: 8, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', padding: '2px 6px', borderRadius: 5, marginBottom: 8, background: 'var(--ts-primary-soft)', color: 'var(--ts-primary)', border: '1px solid var(--ts-border-hot)' }}>
                    {t(lang, 'SEDE FINAL', 'FINAL VENUE')}
                  </span>
                )}
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ts-text)', fontFamily: "'Barlow Condensed', sans-serif" }}>{venue.stadium}</div>
                <div style={{ fontSize: 12, marginTop: 2, color: 'var(--ts-muted)' }}>{venue.city}</div>
                <div style={{ fontSize: 10, marginTop: 4, color: 'var(--ts-faint)' }}>{t(lang, 'Cap.', 'Cap.')} {venue.capacity}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
