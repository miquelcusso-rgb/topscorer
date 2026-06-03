import type { ApiPlayerResponse } from './api-football'
import type { PlayerData, Season, Tab } from '@/types'
import { EXT } from '@/data/players'
import { flagFor } from '@/lib/flags'

const LEAGUE_NAME: Record<number, string> = {
  140: 'La Liga',
  39:  'Premier League',
  78:  'Bundesliga',
  135: 'Serie A',
  61:  'Ligue 1',
  94:  'Primeira Liga',
  203: 'Sueper Lig',
  197: 'Super Liga Grecia',
  // 2nd division
  40:  'Championship',
  79:  '2. Bundesliga',
  136: 'Serie B',
  62:  'Ligue 2',
  141: 'Segunda División',
  95:  'Liga Portugal 2',
  204: '1. Lig',
  // European
  2:   'Champions League',
  3:   'Europa League',
  848: 'Conference League',
}

const SEASON_MAP: Record<number, Season> = {
  2025: '2526',
  2024: '2425',
  2023: '2324',
  2022: '2223',
  2021: '2122',
  2020: '2021',
}

const POS_MAP: Record<string, string> = {
  Forward:    'FW',
  Midfielder: 'MF',
  Defender:   'DF',
  Goalkeeper: 'GK',
}

const FLAG_MAP: Record<string, string> = {
  Spanish:      '🇪🇸',
  English:      '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  French:       '🇫🇷',
  German:       '🇩🇪',
  Brazilian:    '🇧🇷',
  Argentine:    '🇦🇷',
  Portuguese:   '🇵🇹',
  Italian:      '🇮🇹',
  Norwegian:    '🇳🇴',
  Swedish:      '🇸🇪',
  Egyptian:     '🇪🇬',
  Dutch:        '🇳🇱',
  Belgian:      '🇧🇪',
  Croatian:     '🇭🇷',
  Polish:       '🇵🇱',
  Serbian:      '🇷🇸',
  Slovenian:    '🇸🇮',
  Czech:        '🇨🇿',
  Moroccan:     '🇲🇦',
  Senegalese:   '🇸🇳',
  Ivorian:      '🇨🇮',
  Ghanaian:     '🇬🇭',
  Nigerian:     '🇳🇬',
  Guinean:      '🇬🇳',
  Colombian:    '🇨🇴',
  Uruguayan:    '🇺🇾',
  Mexican:      '🇲🇽',
  Canadian:     '🇨🇦',
  Australian:   '🇦🇺',
  'South Korean': '🇰🇷',
  Japanese:     '🇯🇵',
  Turkish:      '🇹🇷',
  Greek:        '🇬🇷',
  Swiss:        '🇨🇭',
  Austrian:     '🇦🇹',
  Danish:       '🇩🇰',
  Finnish:      '🇫🇮',
  Slovak:       '🇸🇰',
  Hungarian:    '🇭🇺',
  Romanian:     '🇷🇴',
  Albanian:     '🇦🇱',
  Ukrainian:    '🇺🇦',
  Russian:      '🇷🇺',
}

export function transformApiPlayer(res: ApiPlayerResponse, tab: Tab): PlayerData | null {
  const stat = res.statistics[0]
  if (!stat) return null
  const leagueName = LEAGUE_NAME[stat.league.id]
  if (!leagueName) return null
  const season = SEASON_MAP[stat.league.season] ?? '2526'
  const ext = EXT[res.player.name] ?? {}
  return {
    name:        res.player.name,
    apiId:       res.player.id,
    photo:       res.player.photo,
    club:        stat.team.name,
    league:      leagueName,
    age:         res.player.age,
    pj:          stat.games.appearences ?? 0,
    goles:       stat.goals.total ?? 0,
    asist:       stat.goals.assists ?? 0,
    season,
    src:         'live' as const,
    tab,
    nationality: res.player.nationality,
    flag:        FLAG_MAP[res.player.nationality] ?? flagFor(res.player.nationality) ?? ext.flag,
    position:    (POS_MAP[stat.games.position] as PlayerData['position']) ?? ext.position,
    minutes:     stat.games.minutes ?? undefined,
    ...ext,
  }
}
