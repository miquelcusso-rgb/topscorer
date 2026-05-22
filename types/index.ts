export type Season = '2526' | '2425' | '2324' | '2223' | '2122' | '2021'
export type Tab = 's' | 'a'
export type SrcType = 'live' | 'srch' | 'est'
export type Position = 'FW' | 'MF' | 'DF' | 'GK'
export type PlayerStatus = 'injured' | 'loan' | 'questionable' | 'transfer' | null
export type Plan = 'free' | 'pro' | 'team' | 'scout'

export interface PlayerData {
  name: string
  club: string
  league: string
  age: number
  pj: number
  goles: number
  asist: number
  season: Season
  src: SrcType
  tab: Tab
  nationality?: string
  flag?: string
  photo?: string
  position?: Position
  marketValue?: string
  releaseClause?: string | null
  contractUntil?: string
  status?: PlayerStatus
  statusDetail?: string
  prevClub?: string
  elo?: number
  fantasyPoints?: number
  fantasyPrice?: number
  // Midfielder-specific stats
  passes?: number
  passAccuracy?: number
  minutes?: number
  recoveries?: number
  ballsLost?: number
  keyPasses?: number
  progressivePasses?: number
  // Enhanced physical & API data
  height?: string
  weight?: string
  birthPlace?: string
  birthDate?: string
  rating?: number
  shotsTotal?: number
  shotsOn?: number
  passesKey?: number
  passesAccuracy?: number
  tacklesTotal?: number
  duelsWon?: number
  dribblesSuccess?: number
  yellowCards?: number
  redCards?: number
  penaltiesScored?: number
}

export interface EnrichedPlayer extends PlayerData {
  coef: number
  ratio_g: number
  ratio_a: number
  val_sin: number
  val_con: number
  isFiller?: boolean
  isPinned?: boolean
}

export type SortKey =
  | 'val_sin'
  | 'val_con'
  | 'goles'
  | 'asist'
  | 'ratio_g'
  | 'ratio_a'
  | 'age'
  | 'elo'
  | 'fantasyPoints'

export interface PanelState {
  season: Season
  age: number
  showEsp: boolean
  showEng: boolean
  showGer: boolean
  showIta: boolean
  showFra: boolean
  showPt: boolean
  showTr: boolean
  showGr: boolean
  sort: SortKey
  dir: 1 | -1
  pinned: Record<string, boolean>
  showElo: boolean
  showFantasy: boolean
  show2nd: boolean
  showEuro: boolean
  // Pro-only
  showTop50: boolean
  showPj: boolean
  showRatios: boolean
  showValCoef: boolean
  showValSin: boolean
}
