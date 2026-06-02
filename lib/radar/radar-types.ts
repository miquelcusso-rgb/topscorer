// radar-types.ts
// Tipos del esquema de radares de jugador. Sincronizados con radar-schema.json (v3).
// Fuentes activas: Understat + API-Football. EXT (Opta/Sportmonks) desactivada.

export type PositionTag = "POR" | "DEF" | "MID" | "ST" | "WAM";

export type Source = "understat" | "api_football" | "external_advanced" | "fbref";

export type ResolutionStatus = "optimal" | "good_proxy" | "weak_proxy" | "unavailable";

/** Un escalón de la cascada de prioridad de un eje. */
export interface PriorityTier {
  tier: number;
  source: Source;
  metric: string;
  status: Exclude<ResolutionStatus, "unavailable">;
  note?: string;
}

/** Definición de un eje del radar. */
export interface AxisDef {
  id: string;
  label: string;
  ideal: string;
  priority: PriorityTier[];
}

export interface PositionDef {
  tag: PositionTag;
  label: string;
  axis_count: number;
  note?: string;
  axes: AxisDef[];
}

export interface SourceConfig {
  code: string;
  available: boolean;
  covers_leagues?: string[] | "all";
  fields?: string[];
  note?: string;
}

export interface RadarSchema {
  version: string;
  scale: string;
  resolution_rule: string;
  sources: Record<Source, SourceConfig>;
  positions: Record<PositionTag, PositionDef>;
}

/** Fila cruda por jugador-temporada-liga, ya unida entre fuentes. */
export interface PlayerSeasonRaw {
  player_id: number;        // id canónico interno
  season: string;
  league_id: number;
  position_group: PositionTag;
  league_has_understat: boolean;

  // --- Understat (null si la liga no está cubierta) ---
  us_minutes?: number | null;
  us_npxG?: number | null;
  us_xG?: number | null;
  us_xA?: number | null;
  us_key_passes?: number | null;
  us_xGChain?: number | null;
  us_xGBuildup?: number | null;
  us_shots?: number | null;
  us_goals?: number | null;
  us_assists?: number | null;
  us_npg?: number | null;

  // --- API-Football ---
  af_minutes?: number | null;
  af_shots_total?: number | null;
  af_shots_on?: number | null;
  af_goals?: number | null;
  af_conceded?: number | null;
  af_assists?: number | null;
  af_saves?: number | null;
  af_passes_total?: number | null;
  af_passes_key?: number | null;
  af_passes_accuracy?: number | null; // 0-100
  af_tackles?: number | null;
  af_blocks?: number | null;
  af_interceptions?: number | null;
  af_duels_total?: number | null;
  af_duels_won?: number | null;
  af_dribbles_att?: number | null;
  af_dribbles_succ?: number | null;
  af_dribbles_past?: number | null;
  af_fouls_committed?: number | null;
  af_cards_yellow?: number | null;
  af_cards_red?: number | null;
}

/** Resultado de resolver un eje: valor crudo + metadatos para UI. */
export interface ResolvedAxis {
  axisId: string;
  label: string;
  rawValue: number | null;     // valor crudo en su unidad; null si no resoluble
  source: Source | null;
  tier: number | null;
  status: ResolutionStatus;
  isProxy: boolean;            // true => mostrar badge "aprox." en la UI
  note?: string;
}

/** Lo que consume el componente de radar (un valor por eje, ya en percentil). */
export interface RadarAxisPoint extends ResolvedAxis {
  percentile: number | null;   // 0-100, calculado en la vista de Supabase
}
