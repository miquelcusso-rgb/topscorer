'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { useLang } from '@/contexts/LangContext'
import { t } from '@/lib/i18n'
import { track } from '@/lib/analytics'
import CrestImg from '@/components/saas/CrestImg'

// Clubs agrupados por liga
const CLUBS_BY_LEAGUE: Record<string, { name: string; logo: number }[]> = {
  'La Liga': [
    { name: 'Real Madrid',    logo: 541  },
    { name: 'Barcelona',      logo: 529  },
    { name: 'Atletico Madrid',logo: 530  },
    { name: 'Villarreal',     logo: 533  },
    { name: 'Real Sociedad',  logo: 548  },
    { name: 'Osasuna',        logo: 727  },
    { name: 'Girona',         logo: 547  },
    { name: 'Mallorca',       logo: 798  },
  ],
  'Premier League': [
    { name: 'Arsenal',        logo: 42   },
    { name: 'Man City',       logo: 50   },
    { name: 'Liverpool',      logo: 40   },
    { name: 'Chelsea',        logo: 49   },
    { name: 'Man United',     logo: 33   },
    { name: 'Newcastle',      logo: 34   },
    { name: 'Aston Villa',    logo: 66   },
    { name: 'Brentford',      logo: 55   },
    { name: 'Fulham',         logo: 36   },
    { name: 'Crystal Palace', logo: 52   },
    { name: 'Nottm Forest',   logo: 65   },
  ],
  'Bundesliga': [
    { name: 'Bayern Munich',  logo: 157  },
    { name: 'B. Dortmund',    logo: 165  },
    { name: 'B. Leverkusen',  logo: 168  },
    { name: 'RB Leipzig',     logo: 173  },
    { name: 'Stuttgart',      logo: 172  },
    { name: 'Frankfurt',      logo: 169  },
  ],
  'Serie A': [
    { name: 'Inter Milan',    logo: 505  },
    { name: 'Juventus',       logo: 496  },
    { name: 'Napoli',         logo: 492  },
    { name: 'Atalanta',       logo: 499  },
    { name: 'Lazio',          logo: 487  },
    { name: 'Fiorentina',     logo: 502  },
    { name: 'Genoa',          logo: 495  },
  ],
  'Ligue 1': [
    { name: 'PSG',            logo: 85   },
    { name: 'Marseille',      logo: 81   },
    { name: 'Lyon',           logo: 80   },
    { name: 'Lille',          logo: 79   },
    { name: 'Rennes',         logo: 94   },
    { name: 'Strasbourg',     logo: 95   },
  ],
  'Outros': [
    { name: 'Porto',          logo: 212  },
    { name: 'Sporting CP',    logo: 228  },
    { name: 'Galatasaray',    logo: 645  },
  ],
}

const ALL_CLUBS = Object.values(CLUBS_BY_LEAGUE).flat()

export default function OnboardingPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const { lang } = useLang()
  const [selected, setSelected] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')

  const filtered = search.trim().length > 1
    ? ALL_CLUBS.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
    : null

  // GA4 conversion: this page is the Clerk AFTER_SIGN_UP_URL, so reaching it
  // means the user just completed registration. Fire sign_up exactly once per
  // user — guard with localStorage so a re-render or a later revisit to
  // /onboarding never double-counts.
  useEffect(() => {
    if (!isLoaded || !user) return
    const key = `ts_signup_tracked_${user.id}`
    if (localStorage.getItem(key)) return
    track('sign_up', { method: 'clerk' })
    localStorage.setItem(key, '1')
  }, [isLoaded, user])

  async function handleSave() {
    if (!user || !selected) return
    setSaving(true)
    try {
      await user.update({
        unsafeMetadata: { favoriteClub: selected },
      })
      router.push('/')
    } catch {
      setSaving(false)
    }
  }

  function handleSkip() {
    router.push('/')
  }

  if (!isLoaded) return null

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-10"
      style={{ background: 'linear-gradient(160deg,#0a0908 0%,#100f0d 100%)' }}
    >
      {/* Card */}
      <div
        className="w-full max-w-[560px] rounded-lg overflow-hidden"
        style={{ background: '#15130f', border: '1px solid #2a2620' }}
      >
        {/* Header */}
        <div
          className="px-6 pt-7 pb-5 text-center"
          style={{ borderBottom: '1px solid #2a2620' }}
        >
          <div
            className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-4"
            style={{ background: '#f0c04015', border: '1px solid #f0c04030' }}
          >
            <span style={{ fontSize: 24 }}>⚽</span>
          </div>
          <h1
            className="font-bold mb-1"
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 26, color: '#efe9dc', letterSpacing: 0.5,
            }}
          >
            {t('onb_welcome', lang)}{user?.firstName ? `, ${user.firstName}` : ''}!
          </h1>
          <p className="text-[13px]" style={{ color: '#8a7f68' }}>
            {t('onb_subtitle', lang)}
          </p>
        </div>

        {/* Search */}
        <div className="px-5 pt-4 pb-2">
          <input
            type="text"
            placeholder={t('onb_search', lang)}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded text-[13px] px-3 py-2 outline-none"
            style={{
              background: '#0a0908',
              border: '1px solid #2a2620',
              color: '#f1e8d2',
            }}
          />
        </div>

        {/* Club grid */}
        <div className="px-5 pb-5 max-h-[380px] overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
          {(filtered ? [{ league: 'Resultados', clubs: filtered }] : Object.entries(CLUBS_BY_LEAGUE).map(([league, clubs]) => ({ league, clubs }))).map(({ league, clubs }) => (
            <div key={league} className="mb-4">
              <div
                className="text-[10px] font-bold uppercase tracking-[2px] mb-2 mt-3"
                style={{ color: '#9a917e', fontFamily: "'Barlow Condensed', sans-serif" }}
              >
                {league === 'Resultados' ? t('onb_results', lang) : league === 'Outros' ? t('onb_league_others', lang) : league}
              </div>
              <div className="grid grid-cols-4 gap-2">
                {clubs.map(club => {
                  const active = selected === club.name
                  return (
                    <button
                      key={club.name}
                      onClick={() => setSelected(club.name)}
                      className="flex flex-col items-center gap-1.5 py-3 px-1 rounded cursor-pointer transition-all duration-150"
                      style={{
                        background: active ? '#f0c04018' : 'transparent',
                        border: `1px solid ${active ? '#f0c040' : '#2a2620'}`,
                      }}
                    >
                      <CrestImg
                        src={`https://media.api-sports.io/football/teams/${club.logo}.png`}
                        alt={club.name}
                        size={32}
                      />
                      <span
                        className="text-[10px] text-center leading-tight"
                        style={{
                          color: active ? '#f0c040' : '#9a917e',
                          fontWeight: active ? 700 : 400,
                        }}
                      >
                        {club.name}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div
          className="px-5 py-4 flex items-center gap-3"
          style={{ borderTop: '1px solid #2a2620' }}
        >
          <button
            onClick={handleSave}
            disabled={!selected || saving}
            className="flex-1 py-2.5 rounded font-bold text-[13px] cursor-pointer transition-all duration-150"
            style={{
              background: selected ? '#f0c040' : '#2a2620',
              color: selected ? '#0a0908' : '#9a917e',
              fontFamily: "'Barlow Condensed', sans-serif",
              letterSpacing: 1,
            }}
          >
            {saving ? t('onb_saving', lang) : selected ? `${t('onb_continue_with', lang)} ${selected}` : t('onb_select_club', lang)}
          </button>
          <button
            onClick={handleSkip}
            className="px-4 py-2.5 text-[12px] cursor-pointer transition-colors duration-150"
            style={{ color: '#9a917e' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#9a917e')}
            onMouseLeave={e => (e.currentTarget.style.color = '#9a917e')}
          >
            {t('onb_skip', lang)}
          </button>
        </div>
      </div>
    </div>
  )
}
