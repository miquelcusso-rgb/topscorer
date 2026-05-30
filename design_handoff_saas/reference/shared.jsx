// Shared UI primitives used across all three design directions.

const { useState, useMemo } = React;

// ─── Photo placeholder ──────────────────────────────────────────────────────
// A small silhouette + monogram, on a team-color background. Designed to look
// like an intentional brand element rather than "missing image". Swap with
// real <img src={player.photo}/> in production.
window.TSPhoto = function TSPhoto({ player, size = 56, shape = 'circle', tone = 'dark', showMono = true }) {
  const teamColor = (window.TS_DATA.teamColor[player.teamShort]) || '#666';
  const mono = (player.first ? player.first.replace('.', '') : '') + (player.last ? player.last[0] : '');
  const radius = shape === 'circle' ? '50%' : shape === 'rounded' ? size * 0.18 : 0;
  const bgColor = teamColor;
  // Build a gradient that fades teamColor → darker version, with silhouette
  const darker = `color-mix(in oklch, ${teamColor} 60%, #000 40%)`;
  return (
    <div style={{
      width: size, height: size, borderRadius: radius, overflow: 'hidden',
      background: `radial-gradient(ellipse at 50% 30%, ${bgColor} 0%, ${darker} 100%)`,
      position: 'relative', flexShrink: 0,
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      boxShadow: tone === 'light' ? 'inset 0 0 0 1px rgba(0,0,0,.08)' : 'inset 0 0 0 1px rgba(255,255,255,.06)',
    }}>
      {/* silhouette */}
      <svg viewBox="0 0 64 64" width={size} height={size} style={{ position: 'absolute', inset: 0, opacity: 0.95 }}>
        <defs>
          <linearGradient id={`sg-${player.id}-${size}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,.0)" />
            <stop offset="100%" stopColor="rgba(0,0,0,.35)" />
          </linearGradient>
        </defs>
        <circle cx="32" cy="24" r="9" fill="rgba(255,255,255,.18)" />
        <path d="M14 64 C 14 46, 50 46, 50 64 Z" fill="rgba(255,255,255,.12)" />
        <rect x="0" y="0" width="64" height="64" fill={`url(#sg-${player.id}-${size})`} />
      </svg>
      {showMono && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700,
          fontSize: size * 0.36, color: 'rgba(255,255,255,.85)',
          letterSpacing: '-0.02em', textShadow: '0 1px 2px rgba(0,0,0,.25)',
        }}>{mono}</div>
      )}
    </div>
  );
};

// ─── League / team chip ─────────────────────────────────────────────────────
window.TSLeagueChip = function ({ leagueId, dark = true }) {
  const lg = window.TS_DATA.leagues.find((l) => l.id === leagueId);
  if (!lg) return null;
  return (
    <span style={{
      fontFamily: 'JetBrains Mono, ui-monospace, monospace',
      fontSize: 10, letterSpacing: '0.08em',
      padding: '2px 6px',
      background: dark ? 'rgba(255,255,255,.06)' : 'rgba(0,0,0,.06)',
      color: dark ? 'rgba(216,216,236,.7)' : 'rgba(40,40,56,.65)',
      borderRadius: 3,
      whiteSpace: 'nowrap',
    }}>{lg.short}</span>
  );
};

// ─── Form badge: dot per match, color = goals scored ────────────────────────
window.TSForm = function ({ form, dark = true, gap = 3, dot = 6 }) {
  return (
    <span style={{ display: 'inline-flex', gap, alignItems: 'center' }}>
      {form.map((g, i) => {
        const c = g === 0 ? (dark ? 'rgba(255,255,255,.15)' : 'rgba(0,0,0,.15)')
                : g === 1 ? '#f0c040'
                : '#f8d068';
        return (
          <span key={i} style={{
            width: dot, height: dot, borderRadius: '50%',
            background: c,
            boxShadow: g >= 2 ? '0 0 8px rgba(240,192,64,.6)' : 'none',
          }} />
        );
      })}
    </span>
  );
};

// ─── Mini bar (for "goals as bar" visual) ───────────────────────────────────
window.TSBar = function ({ value, max, color = '#f0c040', bg = 'rgba(255,255,255,.06)', height = 4, radius = 0 }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div style={{ width: '100%', height, background: bg, borderRadius: radius, overflow: 'hidden' }}>
      <div style={{ width: pct + '%', height: '100%', background: color, borderRadius: radius, transition: 'width .4s' }} />
    </div>
  );
};

// ─── Language toggle (ES/EN) ────────────────────────────────────────────────
window.TSLang = function ({ lang, onChange, dark = true }) {
  return (
    <div style={{
      display: 'inline-flex', height: 28,
      border: `1px solid ${dark ? 'rgba(255,255,255,.12)' : 'rgba(0,0,0,.1)'}`,
      borderRadius: 6, padding: 2, fontFamily: 'JetBrains Mono, monospace',
      fontSize: 10, letterSpacing: '0.08em',
    }}>
      {['ES', 'EN'].map((code) => (
        <button key={code} onClick={() => onChange(code)} style={{
          padding: '0 9px', borderRadius: 4, border: 'none', cursor: 'pointer',
          background: lang === code ? (dark ? '#fff' : '#0c0d18') : 'transparent',
          color: lang === code ? (dark ? '#0c0d18' : '#fff') : (dark ? 'rgba(255,255,255,.7)' : 'rgba(0,0,0,.7)'),
          fontFamily: 'inherit', fontSize: 'inherit', letterSpacing: 'inherit', fontWeight: 600,
        }}>{code}</button>
      ))}
    </div>
  );
};

// ─── i18n helper ────────────────────────────────────────────────────────────
window.TS_T = {
  ES: {
    stats: 'Estadísticas', leagues: 'Competiciones', players: 'Jugadores',
    compare: 'Comparador', transfers: 'Transferencias', pricing: 'Pricing',
    matchday: 'Jornada', scorers: 'Goleadores', assists: 'Asistentes',
    goals: 'Goles', goalsShort: 'G', ast: 'Asist.', astShort: 'A',
    apps: 'PJ', mins: 'Min', minPerGoal: 'Min/Gol', form: 'Forma',
    season: 'Temporada', goldenBoot: 'Bota de Oro', leader: 'Líder',
    age: 'Edad', position: 'Pos', filter: 'Filtros', sortBy: 'Ordenar por',
    morePlayers: 'jugadores', live: 'En vivo', conversion: 'Conversión',
    shots: 'Disparos', sot: 'A puerta', hatTricks: 'Hat-tricks',
    overview: 'Resumen', shotMap: 'Tiros', matches: 'Partidos',
    history: 'Histórico', share: 'Compartir', recentForm: 'Últimos 8 partidos',
    streak: 'Racha activa', consecutiveGames: 'partidos marcando',
    perfProfile: 'Perfil de rendimiento', vsTop5: 'vs. delanteros Top-5 Europa',
    goalsByMatchday: 'Goles por jornada', topEuropa: 'Top 5 Europa',
    allLeagues: 'Todas las ligas', allPositions: 'Todas',
    moreFilters: 'Más filtros', value: 'Valor', foot: 'Pie',
    height: 'Altura', club: 'Club', nationality: 'Nacionalidad',
    cardSubtitle: 'Bota de Oro · 25/26', topEuropeScorers: 'Goleadores · Top ligas Europa',
  },
  EN: {
    stats: 'Stats', leagues: 'Leagues', players: 'Players',
    compare: 'Compare', transfers: 'Transfers', pricing: 'Pricing',
    matchday: 'Matchday', scorers: 'Top scorers', assists: 'Top assists',
    goals: 'Goals', goalsShort: 'G', ast: 'Assists', astShort: 'A',
    apps: 'GP', mins: 'Min', minPerGoal: 'Min/Goal', form: 'Form',
    season: 'Season', goldenBoot: 'Golden Boot', leader: 'Leader',
    age: 'Age', position: 'Pos', filter: 'Filters', sortBy: 'Sort by',
    morePlayers: 'players', live: 'Live', conversion: 'Conv.',
    shots: 'Shots', sot: 'On target', hatTricks: 'Hat-tricks',
    overview: 'Overview', shotMap: 'Shots', matches: 'Matches',
    history: 'History', share: 'Share', recentForm: 'Last 8 games',
    streak: 'Active streak', consecutiveGames: 'games scoring',
    perfProfile: 'Performance profile', vsTop5: 'vs. Top-5 Europe forwards',
    goalsByMatchday: 'Goals by matchday', topEuropa: 'Top 5 Europe',
    allLeagues: 'All leagues', allPositions: 'All',
    moreFilters: 'More filters', value: 'Value', foot: 'Foot',
    height: 'Height', club: 'Club', nationality: 'Nationality',
    cardSubtitle: 'Golden Boot · 25/26', topEuropeScorers: 'Top scorers · Europe top leagues',
  },
};

// ─── Hover card (photo + extras) ─────────────────────────────────────────────
window.TSHoverCard = function ({ player, palette, t, position = 'right' }) {
  const p = palette;
  const teamColor = window.TS_DATA.teamColor[player.teamShort] || '#888';
  return (
    <div style={{
      width: 240, background: p.surface, borderRadius: 8,
      border: `1px solid ${p.border}`,
      boxShadow: '0 12px 40px rgba(0,0,0,.22), 0 2px 6px rgba(0,0,0,.08)',
      overflow: 'hidden', fontFamily: 'DM Sans, sans-serif',
    }}>
      {/* photo band */}
      <div style={{
        height: 130, position: 'relative', overflow: 'hidden',
        background: `linear-gradient(135deg, ${teamColor} 0%, color-mix(in oklch, ${teamColor} 50%, #000) 100%)`,
      }}>
        <TSPhoto player={player} size={130} shape="rect" tone="dark" showMono />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,.55) 0%, transparent 60%)',
        }} />
        <div style={{ position: 'absolute', bottom: 8, left: 12, right: 12, color: '#fff' }}>
          <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 22, fontWeight: 700, lineHeight: 1, letterSpacing: '-0.005em' }}>
            {player.last}
          </div>
          <div style={{ fontSize: 10, opacity: 0.85, letterSpacing: '0.04em' }}>
            {player.first} {player.last.toLowerCase().replace(/[^a-z]/g, '').slice(0, 6).toUpperCase()} · #9
          </div>
        </div>
        <div style={{
          position: 'absolute', top: 8, right: 10, fontFamily: 'JetBrains Mono, monospace',
          fontSize: 9, color: '#fff', background: 'rgba(0,0,0,.4)', padding: '2px 6px', borderRadius: 3,
          letterSpacing: '0.08em',
        }}>{player.nat} {player.age}</div>
      </div>
      <div style={{ padding: '10px 12px', color: p.text }}>
        <div style={{ fontSize: 11, color: p.muted }}>{player.team}</div>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginTop: 8,
          paddingTop: 8, borderTop: `1px solid ${p.divider}`,
        }}>
          {[
            [player.goals, t.goalsShort, p.gold],
            [player.ast, t.astShort, p.teal],
            [player.apps, t.apps, p.text],
            [player.xg.toFixed(1), 'xG', p.text],
          ].map(([n, l, c]) => (
            <div key={l}>
              <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 20, fontWeight: 700, color: c, lineHeight: 0.9 }}>{n}</div>
              <div style={{ fontSize: 9, color: p.muted, letterSpacing: '0.08em', marginTop: 2 }}>{l}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: p.muted }}>
          <span>{t.form}:</span>
          <TSForm form={player.form} dark={p.bg === '#0a0e16' || p.bg === '#060d18'} dot={5} />
        </div>
      </div>
    </div>
  );
};

// ─── Theme toggle pill (sun/moon) ───────────────────────────────────────────
window.TSThemeToggle = function ({ dark, onChange, accent = '#f0c040' }) {
  return (
    <button onClick={() => onChange(!dark)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        width: 56, height: 28, borderRadius: 14,
        border: dark ? '1px solid rgba(255,255,255,.12)' : '1px solid rgba(0,0,0,.1)',
        background: dark ? 'rgba(255,255,255,.04)' : 'rgba(0,0,0,.03)',
        padding: 2, position: 'relative', cursor: 'pointer',
        fontFamily: 'inherit',
      }}
      title={dark ? 'Modo claro' : 'Modo oscuro'}>
      <span style={{
        position: 'absolute', top: 2, left: dark ? 2 : 30,
        width: 22, height: 22, borderRadius: '50%',
        background: dark ? '#1a1b2e' : '#fff',
        boxShadow: dark ? '0 1px 2px rgba(0,0,0,.4)' : '0 1px 3px rgba(0,0,0,.18)',
        transition: 'left .18s ease',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: accent,
      }}>
        {dark ? (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><path d="M10 7.5A4 4 0 1 1 4.5 2a4 4 0 0 0 5.5 5.5z"/></svg>
        ) : (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.4">
            <circle cx="6" cy="6" r="2.4" fill="currentColor"/>
            <g strokeLinecap="round">
              <path d="M6 1v1.5M6 9.5V11M1 6h1.5M9.5 6H11M2.3 2.3l1 1M8.7 8.7l1 1M2.3 9.7l1-1M8.7 3.3l1-1"/>
            </g>
          </svg>
        )}
      </span>
    </button>
  );
};

// ─── Sparkline (last N matchdays) ────────────────────────────────────────────
window.TSSparkline = function ({ values, width = 60, height = 18, color = '#f0c040', fill }) {
  const max = Math.max(...values, 1);
  const step = width / (values.length - 1);
  const pts = values.map((v, i) => [i * step, height - (v / max) * height]);
  const d = pts.map((p, i) => (i === 0 ? 'M' : 'L') + p[0] + ' ' + p[1]).join(' ');
  const fillD = d + ` L ${width} ${height} L 0 ${height} Z`;
  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      {fill && <path d={fillD} fill={fill} />}
      <path d={d} fill="none" stroke={color} strokeWidth="1.4" strokeLinejoin="round" strokeLinecap="round" />
      {pts.map((p, i) => values[i] > 0 && (
        <circle key={i} cx={p[0]} cy={p[1]} r="1.4" fill={color} />
      ))}
    </svg>
  );
};

// ─── Radar (for player profile) ──────────────────────────────────────────────
// values: array of { label, pct } where pct is 0-100
window.TSRadar = function ({ values, size = 280, color = '#f0c040', gridColor = 'rgba(255,255,255,.12)', labelColor = 'rgba(216,216,236,.65)' }) {
  const n = values.length;
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.36;
  const angle = (i) => -Math.PI / 2 + (i * 2 * Math.PI) / n;
  const pt = (i, t) => [cx + Math.cos(angle(i)) * r * t, cy + Math.sin(angle(i)) * r * t];
  const polygon = (t) => Array.from({ length: n }, (_, i) => pt(i, t).join(',')).join(' ');
  const dataPts = values.map((v, i) => pt(i, v.pct / 100).join(',')).join(' ');
  return (
    <svg viewBox={`0 0 ${size} ${size}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
      {/* grid */}
      {[0.25, 0.5, 0.75, 1].map((t, i) => (
        <polygon key={i} points={polygon(t)} fill="none" stroke={gridColor} strokeWidth={i === 3 ? 1 : 0.6} />
      ))}
      {/* spokes */}
      {values.map((_, i) => {
        const [x, y] = pt(i, 1);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke={gridColor} strokeWidth="0.6" />;
      })}
      {/* data */}
      <polygon points={dataPts} fill={color} fillOpacity="0.22" stroke={color} strokeWidth="2" strokeLinejoin="round" />
      {values.map((v, i) => {
        const [x, y] = pt(i, v.pct / 100);
        return <circle key={i} cx={x} cy={y} r="3" fill={color} />;
      })}
      {/* labels */}
      {values.map((v, i) => {
        const [lx, ly] = pt(i, 1.18);
        const anchor = Math.abs(lx - cx) < 5 ? 'middle' : lx < cx ? 'end' : 'start';
        return (
          <g key={i}>
            <text x={lx} y={ly} textAnchor={anchor} dominantBaseline="middle"
              fill={labelColor} fontFamily="JetBrains Mono, monospace" fontSize="10" letterSpacing="0.06em">
              {v.label.toUpperCase()}
            </text>
            <text x={lx} y={ly + 12} textAnchor={anchor} dominantBaseline="middle"
              fill={color} fontFamily="Barlow Condensed, sans-serif" fontWeight="600" fontSize="13">
              {v.value}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

// ─── Shot map (silhouette of goal + dots) ─────────────────────────────────────
window.TSShotMap = function ({ shots, width = 360, height = 220, color = '#f0c040', gridColor = 'rgba(255,255,255,.1)' }) {
  // Build a half-pitch facing the goal at top; shots scattered.
  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
      {/* pitch outline */}
      <rect x="2" y="2" width={width - 4} height={height - 4} fill="none" stroke={gridColor} strokeWidth="1" />
      {/* big box */}
      <rect x={width/2 - 88} y="2" width="176" height="60" fill="none" stroke={gridColor} strokeWidth="0.8" />
      {/* small box */}
      <rect x={width/2 - 36} y="2" width="72" height="22" fill="none" stroke={gridColor} strokeWidth="0.8" />
      {/* penalty arc */}
      <path d={`M ${width/2 - 30} 62 A 36 36 0 0 0 ${width/2 + 30} 62`} fill="none" stroke={gridColor} strokeWidth="0.8" />
      {/* center line bottom */}
      <line x1="2" y1={height - 2} x2={width - 2} y2={height - 2} stroke={gridColor} strokeWidth="0.8" />
      {/* goal */}
      <rect x={width/2 - 24} y="0" width="48" height="3" fill={color} />
      {/* shots */}
      {shots.map((s, i) => {
        const cx = width/2 + s.x * (width/2 - 12);
        const cy = 6 + s.y * (height - 16);
        const isGoal = s.r === 'goal';
        return (
          <g key={i}>
            <circle cx={cx} cy={cy} r={isGoal ? 5 : 3.5}
              fill={isGoal ? color : 'transparent'}
              stroke={isGoal ? color : 'rgba(216,216,236,.4)'}
              strokeWidth="1.4"
              opacity={isGoal ? 1 : 0.6} />
            {isGoal && (
              <line x1={cx} y1={cy} x2={width/2} y2={0}
                stroke={color} strokeWidth="0.6" strokeDasharray="2 2" opacity="0.35" />
            )}
          </g>
        );
      })}
    </svg>
  );
};

// ─── Wordmark ────────────────────────────────────────────────────────────────
window.TSLogo = function ({ size = 18, dark = true, accent = '#f0c040' }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700,
      fontSize: size, letterSpacing: '0.04em',
      color: dark ? '#fff' : '#0c0d18', textTransform: 'uppercase',
    }}>
      <svg width={size * 0.9} height={size * 0.9} viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="9" stroke={accent} strokeWidth="1.6" />
        <path d="M5.5 10.5l2.5 2.5L14.5 7" stroke={accent} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span>TOP<span style={{ color: accent }}>SCORERS</span></span>
    </span>
  );
};
