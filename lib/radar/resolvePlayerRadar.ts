// resolvePlayerRadar.ts
// Aplica la cascada de prioridad del esquema usando solo fuentes activas (Understat + API-Football).
// El valor devuelto es CRUDO (en su unidad). El percentil se calcula en Supabase (ver schema.sql).
//
// Regla: por cada eje recorre priority[] en orden de tier y elige el primer tier cuya fuente
// esté activa y, si es Understat, la liga esté cubierta. Devuelve metadatos para el badge de UI.

import type {
  PlayerSeasonRaw,
  PositionTag,
  ResolvedAxis,
  RadarSchema,
  Source,
} from "./radar-types";
import schemaJson from "./radar-schema.json";

const SCHEMA = schemaJson as unknown as RadarSchema;

const per90 = (total?: number | null, minutes?: number | null): number | null =>
  total == null || !minutes ? null : (total / minutes) * 90;

const ratio = (num?: number | null, den?: number | null): number | null =>
  num == null || den == null || den === 0 ? null : num / den;

// Sum of two per-90 components where the axis is meaningful only if AT LEAST ONE
// component is populated. Returns null (→ caller falls back to the next priority
// tier) when BOTH are null. This is the fix for the "always 0 because the source
// field is empty" bug: e.g. a creator whose Understat row didn't match would get
// xA=null + key_passes=null collapsing to `0 + 0 = 0`, "resolving" the Understat
// tier with a fake 0 and never falling back to the populated API-Football tier.
const sumP90 = (
  a?: number | null,
  aMin?: number | null,
  b?: number | null,
  bMin?: number | null,
): number | null => {
  const va = per90(a, aMin);
  const vb = per90(b, bMin);
  if (va == null && vb == null) return null;
  return (va ?? 0) + (vb ?? 0);
};

/** ¿Está activa esta fuente para esta liga? */
function sourceUsable(source: Source, player: PlayerSeasonRaw): boolean {
  const cfg = SCHEMA.sources[source];
  if (!cfg || !cfg.available) return false;
  if (source === "understat") return player.league_has_understat === true;
  return true;
}

/**
 * Calcula el valor crudo de un eje para una fuente concreta.
 * Devuelve null si faltan los campos necesarios (provoca caer al siguiente tier).
 * Las fórmulas reflejan exactamente el campo `metric` del JSON.
 */
export function computeAxis(axisId: string, source: Source, p: PlayerSeasonRaw): number | null {
  const usMin = p.us_minutes ?? p.af_minutes ?? null;
  const afMin = p.af_minutes ?? null;
  const acc = (p.af_passes_accuracy ?? 0) / 100;

  switch (`${axisId}:${source}`) {
    // ---------- POR ----------
    case "shot_stopping:api_football":
    case "save_pct:api_football":
      return ratio(p.af_saves, (p.af_saves ?? 0) + (p.af_conceded ?? 0));
    case "distribution:api_football":
      return p.af_passes_accuracy ?? null;
    case "build_up:api_football": {
      const v = per90(p.af_passes_total, afMin);
      return v == null ? null : v * acc;
    }

    // ---------- DEF ----------
    case "tackling_intercepting:api_football":
      return sumP90(p.af_tackles, afMin, p.af_interceptions, afMin);
    case "aerial:api_football":
    case "duels:api_football":
      return ratio(p.af_duels_won, p.af_duels_total);
    case "progression:understat":
      return per90(p.us_xGBuildup, usMin);
    case "progression:api_football": {
      const v = per90(p.af_passes_total, afMin);
      return v == null ? null : v * acc;
    }
    case "clearances_blocks:api_football":
      return per90(p.af_blocks, afMin);
    case "pass_under_pressure:api_football":
    case "passing_accuracy:api_football":
      return p.af_passes_accuracy ?? null;
    case "reliability:api_football": {
      const fouls = per90(p.af_fouls_committed, afMin) ?? 0;
      const cards = (p.af_cards_yellow ?? 0) * 0.5 + (p.af_cards_red ?? 0) * 1.5;
      return -(fouls + cards); // invertido: mayor = más fiable
    }

    // ---------- MID ----------
    case "creation:understat":
    case "xa_keypass:understat":
      return sumP90(p.us_xA, usMin, p.us_key_passes, usMin);
    case "creation:api_football":
    case "xa_keypass:api_football": {
      // Real creator signal even when assists/key-passes alone are sparse: blend
      // (key passes + assists)/90 with a pass-accuracy bonus so a high-volume,
      // high-accuracy passer (e.g. N. Paz) reads as a creator instead of 0.
      const base = sumP90(p.af_passes_key, afMin, p.af_assists, afMin);
      if (base == null && p.af_passes_accuracy == null) return null;
      const accBonus = p.af_passes_accuracy != null ? (acc - 0.7) * 2 : 0; // 70%→0, 85%→+0.3
      return Math.max(0, (base ?? 0) + Math.max(0, accBonus));
    }
    case "recovery:api_football":
      return sumP90(p.af_tackles, afMin, p.af_interceptions, afMin);
    case "physical:api_football":
      return p.af_minutes ?? null; // solo workload

    // ---------- ST ----------
    case "xg90:understat":
      return per90(p.us_npxG, usMin);
    case "xg90:api_football":
      return per90((p.af_shots_total ?? 0) + (p.af_shots_on ?? 0) + (p.af_goals ?? 0), afMin);
    case "finishing:understat":
      return per90((p.us_goals ?? 0) - (p.us_npxG ?? 0), usMin);
    case "finishing:api_football":
      return ratio(p.af_goals, p.af_shots_total);
    case "shot_volume:understat":
      return per90(p.us_shots, usMin);
    case "shot_volume:api_football":
      return per90(p.af_shots_total, afMin);
    case "link_up:understat":
      return sumP90(p.us_xGChain, usMin, p.us_xGBuildup, usMin);
    case "link_up:api_football": {
      const v = sumP90(p.af_passes_key, afMin, p.af_assists, afMin);
      return v == null ? null : v * acc;
    }

    // ---------- WAM ----------
    case "dribbling:api_football":
    case "carries:api_football":
      return per90(p.af_dribbles_succ, afMin);
    case "sca_gca:understat":
    case "final_pass:understat":
      return per90(axisId === "sca_gca" ? p.us_xGChain : p.us_key_passes, usMin);
    case "sca_gca:api_football":
      return sumP90(p.af_passes_key, afMin, p.af_assists, afMin);
    case "final_pass:api_football":
      return per90(p.af_passes_key, afMin);
    case "one_v_one:api_football":
      return ratio(p.af_dribbles_succ, p.af_dribbles_att);

    default:
      return null;
  }
}

/**
 * Resuelve los ejes de una posición para un jugador.
 * Devuelve un ResolvedAxis por eje (valor crudo + fuente/tier/status para la UI).
 */
export function resolvePlayerRadar(
  player: PlayerSeasonRaw,
  position: PositionTag
): ResolvedAxis[] {
  const def = SCHEMA.positions[position];
  if (!def) throw new Error(`Posición desconocida: ${position}`);

  return def.axes.map((axis): ResolvedAxis => {
    for (const t of axis.priority) {
      if (!sourceUsable(t.source, player)) continue;
      const rawValue = computeAxis(axis.id, t.source, player);
      if (rawValue == null) continue;
      return {
        axisId: axis.id,
        label: axis.label,
        labelEn: axis.labelEn ?? axis.label,
        rawValue,
        source: t.source,
        tier: t.tier,
        status: t.status,
        isProxy: t.status !== "optimal",
        note: t.note,
      };
    }
    // Ningún tier activo resolvió
    return {
      axisId: axis.id,
      label: axis.label,
      labelEn: axis.labelEn ?? axis.label,
      rawValue: null,
      source: null,
      tier: null,
      status: "unavailable",
      isProxy: true,
    };
  });
}
