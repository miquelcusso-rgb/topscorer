// PROPOSAL A — SAAS (Holded-style)
// Light theme with lateral sidebar nav, soft surfaces, generous spacing,
// modern SaaS chrome. Color avatars (initials in tinted circles) used as
// the visual rhythm. Top filter row + a hybrid card/table layout. Pastel
// blue/purple system over off-white.

const { useState: useStateS } = React;

// Paleta TopScorers · negro + dorado + turquesa
//   Dark  : negro profundo, dorado cálido, turquesa luminoso
//   Light : crema suave, dorado-crema denso, turquesa oscuro
const sPalette = (dark) => dark ? {
  bg: '#0a0908', surface: '#0f0e0c', sidebar: '#070605',
  card: '#15130f', card2: '#1c1a16',
  border: 'rgba(240,200,90,.08)', borderHot: 'rgba(240,200,90,.18)',
  text: '#f1e8d2', muted: 'rgba(241,232,210,.6)', faint: 'rgba(241,232,210,.34)',
  divider: 'rgba(240,200,90,.08)', hairline: 'rgba(240,200,90,.05)',
  // primary = oro (acento de marca, números clave, CTA)
  primary: '#f0c040', primaryHot: '#ffd460', primarySoft: 'rgba(240,192,64,.14)',
  // accent = turquesa (asistencias, secundario)
  teal: '#3ed6c2', tealSoft: 'rgba(62,214,194,.16)', tealHot: '#5ee2d2',
  // gold alias para compatibilidad
  gold: '#f0c040',
  green: '#3ed6c2', red: '#e85a47',
  // avatares: variantes de oro y turquesa
  avatars: [
    { bg: 'rgba(240,192,64,.18)',  fg: '#f5d068' },
    { bg: 'rgba(62,214,194,.18)',  fg: '#6ee3d2' },
    { bg: 'rgba(240,192,64,.10)',  fg: '#e0b048' },
    { bg: 'rgba(62,214,194,.10)',  fg: '#4ec2b0' },
    { bg: 'rgba(255,212,96,.18)',  fg: '#ffd870' },
    { bg: 'rgba(94,226,210,.14)',  fg: '#7eecdb' },
  ],
} : {
  bg: '#f8f7f3', surface: '#ffffff', sidebar: '#f4f1e8',
  card: '#ffffff', card2: '#faf8f2',
  border: 'rgba(24,18,4,.09)', borderHot: 'rgba(24,18,4,.16)',
  text: '#1c1608', muted: 'rgba(28,22,8,.62)', faint: 'rgba(28,22,8,.36)',
  divider: 'rgba(24,18,4,.08)', hairline: 'rgba(24,18,4,.05)',
  // primary = oro-crema denso (acento de marca)
  primary: '#a8761a', primaryHot: '#c48a20', primarySoft: '#f6ecd2',
  // accent = turquesa oscuro (asistencias)
  teal: '#0a6e5f', tealSoft: '#d4ece6', tealHot: '#0d8472',
  gold: '#a8761a',
  green: '#0a6e5f', red: '#a4361c',
  // avatares: variantes de oro y turquesa sobre blanco
  avatars: [
    { bg: '#f6ecd2', fg: '#a8761a' },
    { bg: '#d4ece6', fg: '#0a6e5f' },
    { bg: '#fbf2d8', fg: '#8a5e10' },
    { bg: '#c8e4dd', fg: '#085348' },
    { bg: '#f0e4b8', fg: '#8a5e10' },
    { bg: '#bee0d6', fg: '#085348' },
  ],
};

const sAvatar = (player, palette) => {
  const idx = (player.name.charCodeAt(0) + player.name.charCodeAt(2)) % palette.avatars.length;
  return palette.avatars[idx];
};

// ─── Sidebar ──────────────────────────────────────────────────────────────
function SSidebar({ p, active, t }) {
  const items = [
    { id: 'stats',     icon: '📊', label: t.stats,     count: '384' },
    { id: 'leagues',   icon: '🏆', label: t.leagues,   count: '12' },
    { id: 'players',   icon: '👤', label: t.players,   count: null },
    { id: 'compare',   icon: '⚖',  label: t.compare,   count: null },
    { id: 'transfers', icon: '↔',  label: t.transfers, count: '24' },
    { id: 'matches',   icon: '⚽', label: 'Resultados', count: null, live: 3 },
  ];
  return (
    <aside style={{
      width: 232, flexShrink: 0, height: '100%',
      background: p.sidebar, borderRight: `1px solid ${p.border}`,
      display: 'flex', flexDirection: 'column', padding: '20px 14px',
      fontFamily: 'DM Sans, sans-serif',
    }}>
      <div style={{ padding: '0 8px 18px' }}>
        <TSLogo dark={p.text === '#e6e8ee'} accent={p.primary} size={17} />
      </div>
      {/* workspace switcher */}
      <button style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 10px', background: p.card, border: `1px solid ${p.border}`,
        borderRadius: 8, cursor: 'pointer', textAlign: 'left', width: '100%',
        fontFamily: 'inherit',
      }}>
        <span style={{
          width: 28, height: 28, borderRadius: 8, background: p.primary, color: p.bg,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13,
        }}>TS</span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: 'block', fontSize: 13, fontWeight: 600, color: p.text }}>Top-Scorers</span>
          <span style={{ display: 'block', fontSize: 11, color: p.muted }}>Plan Pro · €6/mes</span>
        </span>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke={p.muted} strokeWidth="1.5"><path d="M2 4l3 3 3-3"/></svg>
      </button>

      {/* nav */}
      <nav style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <div style={{ padding: '6px 10px', fontSize: 10, color: p.faint, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 600 }}>Menu</div>
        {items.map((it) => (
          <a key={it.id} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '8px 10px', borderRadius: 6,
            background: it.id === active ? p.primarySoft : 'transparent',
            color: it.id === active ? p.primary : p.text,
            fontSize: 13, fontWeight: it.id === active ? 600 : 500,
            cursor: 'pointer', textDecoration: 'none',
          }}>
            <span style={{ width: 16, opacity: 0.85, fontSize: 14 }}>{it.icon}</span>
            <span style={{ flex: 1 }}>{it.label}</span>
            {it.live && <span style={{ fontSize: 10, padding: '2px 6px', background: p.red, color: '#fff', borderRadius: 999, fontWeight: 700 }}>{it.live}●</span>}
            {it.count && <span style={{ fontSize: 11, color: p.muted, fontVariantNumeric: 'tabular-nums' }}>{it.count}</span>}
          </a>
        ))}
        <div style={{ padding: '14px 10px 6px', fontSize: 10, color: p.faint, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 600 }}>Listas</div>
        {[
          ['⭐', 'Mi watchlist', '8'],
          ['📁', 'Sub-22 promesas', '24'],
          ['📁', 'Pichichi histórico', null],
        ].map(([icon, label, n]) => (
          <a key={label} style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '7px 10px',
            borderRadius: 6, color: p.text, fontSize: 13, cursor: 'pointer',
          }}>
            <span style={{ width: 16, opacity: 0.65 }}>{icon}</span>
            <span style={{ flex: 1 }}>{label}</span>
            {n && <span style={{ fontSize: 11, color: p.muted }}>{n}</span>}
          </a>
        ))}
      </nav>

      <div style={{ flex: 1 }} />

      {/* upgrade */}
      <div style={{
        padding: 14, background: p.primarySoft, borderRadius: 8,
        border: `1px solid ${p.primary}25`, marginTop: 14,
      }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 10, color: p.primary, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          <svg width="11" height="11" viewBox="0 0 11 11" fill="currentColor"><path d="M5.5 1L7 4l3 .4-2.2 2 .5 3-2.8-1.5L2.7 9.4l.5-3L1 4.4 4 4z"/></svg>
          Scout
        </div>
        <div style={{ fontSize: 13, color: p.text, fontWeight: 600, marginTop: 4, lineHeight: 1.3 }}>
          Acceso API + datos completos · <span style={{ color: p.primary }}>€18/mes</span>
        </div>
        <button style={{
          width: '100%', marginTop: 10, padding: '7px 10px',
          background: p.primary, color: p.bg, border: 'none', borderRadius: 6,
          fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
        }}>Actualizar plan</button>
      </div>

      {/* user */}
      <div style={{
        marginTop: 12, paddingTop: 12, borderTop: `1px solid ${p.border}`,
        display: 'flex', alignItems: 'center', gap: 10, padding: '12px 6px 0',
      }}>
        <div style={{
          width: 30, height: 30, borderRadius: '50%',
          background: p.avatars[1].bg, color: p.avatars[1].fg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontWeight: 700,
        }}>JM</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: p.text, lineHeight: 1.1 }}>Jaume M.</div>
          <div style={{ fontSize: 11, color: p.muted }}>jaume@…</div>
        </div>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke={p.muted} strokeWidth="1.5"><circle cx="7" cy="6" r="1.5"/><path d="M3 11c0-2 1.8-3 4-3s4 1 4 3"/></svg>
      </div>
    </aside>
  );
}

// ─── A · Landing / main stats ────────────────────────────────────────────────
function SHome({ initialDark = false, initialLang = 'ES' }) {
  const [dark, setDark] = useStateS(initialDark);
  const [lang, setLang] = useStateS(initialLang);
  const p = sPalette(dark);
  const t = window.TS_T[lang];
  const players = window.TS_DATA.players;
  const maxGoals = players[0].goals;

  return (
    <div style={{ display: 'flex', background: p.bg, color: p.text, minHeight: '100%', fontFamily: 'DM Sans, sans-serif' }}>
      <SSidebar p={p} active="stats" t={t} />
      <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        {/* topbar */}
        <header style={{
          height: 60, padding: '0 24px',
          display: 'flex', alignItems: 'center', gap: 16,
          borderBottom: `1px solid ${p.border}`, background: p.surface,
        }}>
          <span style={{ fontSize: 13, color: p.muted }}>{t.stats} <span style={{ color: p.faint }}>/</span> <strong style={{ color: p.text, fontWeight: 600 }}>{t.scorers}</strong></span>
          {/* search */}
          <div style={{
            flex: 1, maxWidth: 380, display: 'flex', alignItems: 'center', gap: 8,
            padding: '7px 12px', background: p.card2, border: `1px solid ${p.border}`,
            borderRadius: 8, fontSize: 13, color: p.muted,
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="6" cy="6" r="4.5"/><path d="M12.5 12.5l-3-3"/></svg>
            <span>Buscar jugador, equipo, liga…</span>
            <kbd style={{ marginLeft: 'auto', fontFamily: 'JetBrains Mono, monospace', fontSize: 10, padding: '1px 5px', background: p.surface, borderRadius: 3, color: p.faint, border: `1px solid ${p.border}` }}>⌘K</kbd>
          </div>
          <div style={{ flex: 1 }} />
          <TSLang lang={lang} onChange={setLang} dark={dark} />
          <TSThemeToggle dark={dark} onChange={setDark} accent={p.primary} />
          <button style={{
            padding: '7px 12px', background: p.primary, color: p.bg,
            border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer',
            fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6,
          }}>+ Crear lista</button>
        </header>

        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20, overflow: 'auto' }}>
          {/* Page header */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24 }}>
            <div>
              <h1 style={{
                margin: 0, fontSize: 24, fontWeight: 700, letterSpacing: '-0.012em', color: p.text,
              }}>{t.topEuropeScorers}</h1>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: p.muted }}>
                Temporada 25/26 · J36 · {window.TS_DATA.asOf}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {[
                ['Delanteros', '⚽', true],
                ['Asistentes', '🅰', false],
                ['Centrocampistas', '⇄', false],
                ['Defensas', '🛡', false],
                ['Porteros', '🧤', false],
              ].map(([tab, icon, active]) => (
                <button key={tab} style={{
                  padding: '7px 14px', borderRadius: 6, fontSize: 13, fontWeight: 500,
                  background: active ? p.tealSoft : 'transparent',
                  color: active ? p.teal : p.text,
                  border: active ? `1px solid ${p.teal}40` : `1px solid ${p.border}`,
                  cursor: 'pointer', fontFamily: 'inherit',
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                }}>
                  <span style={{ fontSize: 13, opacity: active ? 1 : 0.7 }}>{icon}</span>
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* KPI cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
            {[
              { n: '28', l: 'Líder · Goles', sub: 'Haaland · MCI', accent: p.primary, trend: '+3 vs Mbappé' },
              { n: '14', l: 'Asistencias top', sub: 'Vinícius · RMA', accent: p.teal, trend: '+1 esta semana' },
              { n: '384', l: 'Goleadores activos', sub: 'En 12 ligas', accent: p.gold, trend: '+12 esta jornada' },
              { n: '86', l: 'Goles en la jornada', sub: 'J36 · Top 5', accent: p.green, trend: 'Promedio: 71' },
            ].map((k) => (
              <div key={k.l} style={{
                background: p.card, border: `1px solid ${p.border}`, borderRadius: 10, padding: 16,
              }}>
                <div style={{ fontSize: 12, color: p.muted }}>{k.l}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 8 }}>
                  <span style={{ fontSize: 32, fontWeight: 700, color: p.text, letterSpacing: '-0.02em', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{k.n}</span>
                  <span style={{ fontSize: 11, color: p.muted, marginLeft: 'auto', padding: '2px 7px', background: p.card2, borderRadius: 999 }}>↑ {k.trend}</span>
                </div>
                <div style={{ marginTop: 8, fontSize: 12, color: p.muted, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: k.accent }} />
                  {k.sub}
                </div>
              </div>
            ))}
          </div>

          {/* Filter bar */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '12px 14px', background: p.card, border: `1px solid ${p.border}`,
            borderRadius: 10,
          }}>
            {[
              { k: 'Liga', v: t.topEuropa, active: true },
              { k: 'Temporada', v: '25/26' },
              { k: 'Posición', v: 'Todas' },
              { k: 'Edad', v: '18–40' },
              { k: 'Min. partidos', v: '5' },
            ].map(({ k, v, active }) => (
              <button key={k} style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '6px 10px', fontSize: 12,
                background: active ? p.primarySoft : 'transparent',
                color: active ? p.primary : p.text,
                border: `1px solid ${active ? p.primary + '40' : p.border}`,
                borderRadius: 6, cursor: 'pointer', fontFamily: 'inherit',
              }}>
                <span style={{ color: p.muted, fontWeight: 500 }}>{k}:</span>
                <span style={{ fontWeight: 600 }}>{v}</span>
                <svg width="9" height="9" viewBox="0 0 9 9" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 3l2.5 2.5L7 3"/></svg>
              </button>
            ))}
            <span style={{
              padding: '6px 10px', fontSize: 12, color: p.muted, cursor: 'pointer',
              border: `1px dashed ${p.border}`, borderRadius: 6,
            }}>+ Añadir filtro</span>
            <div style={{ flex: 1 }} />
            <span style={{ fontSize: 12, color: p.muted }}>12 de 384</span>
            <div style={{ width: 1, height: 18, background: p.border }} />
            <div style={{ display: 'flex', gap: 4, padding: 2, background: p.card2, borderRadius: 6 }}>
              {['☰', '⊞'].map((v, i) => (
                <button key={v} style={{
                  width: 28, height: 24, fontSize: 12, border: 'none', borderRadius: 4, cursor: 'pointer',
                  background: i === 0 ? p.surface : 'transparent', color: i === 0 ? p.text : p.muted,
                  fontFamily: 'inherit',
                }}>{v}</button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div style={{
            background: p.card, border: `1px solid ${p.border}`, borderRadius: 10, overflow: 'hidden',
          }}>
            {/* header */}
            <div style={{
              display: 'grid', gridTemplateColumns: '40px 44px 1fr 110px 70px 70px 70px 70px 110px 80px',
              gap: 12, padding: '12px 16px', alignItems: 'center',
              background: p.card2, borderBottom: `1px solid ${p.border}`,
              fontSize: 11, color: p.muted, letterSpacing: '0.04em', fontWeight: 600, textTransform: 'uppercase',
            }}>
              <span></span>
              <span></span>
              <span>Jugador</span>
              <span>Equipo</span>
              <span style={{ textAlign: 'right' }}>Goles ↓</span>
              <span style={{ textAlign: 'right' }}>Asist.</span>
              <span style={{ textAlign: 'right' }}>PJ</span>
              <span style={{ textAlign: 'right' }}>xG</span>
              <span style={{ textAlign: 'right' }}>Forma</span>
              <span></span>
            </div>
            {players.map((pl, i) => (
              <SRow key={pl.id} rank={i + 1} player={pl} p={p} t={t} dark={dark} max={maxGoals} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

function SRow({ rank, player, p, t, dark, max }) {
  const [hover, setHover] = useStateS(false);
  const av = sAvatar(player, p);
  const initials = (player.first ? player.first.replace('.', '') : '') + (player.last ? player.last[0] : '');
  return (
    <div
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        position: 'relative',
        display: 'grid', gridTemplateColumns: '40px 44px 1fr 110px 70px 70px 70px 70px 110px 80px',
        gap: 12, padding: '12px 16px', alignItems: 'center',
        borderBottom: `1px solid ${p.divider}`,
        background: hover ? p.card2 : 'transparent', cursor: 'pointer',
        transition: 'background .12s',
      }}>
      <span style={{ fontSize: 12, color: rank <= 3 ? p.primary : p.muted, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
        {String(rank).padStart(2, '0')}
      </span>
      {/* avatar circle */}
      <div style={{
        width: 36, height: 36, borderRadius: '50%',
        background: av.bg, color: av.fg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 13, fontWeight: 700, letterSpacing: '-0.01em',
      }}>{initials}</div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: p.text, letterSpacing: '-0.01em' }}>
          {player.first} {player.name.split(' ').slice(1).join(' ')}
        </div>
        <div style={{ fontSize: 11, color: p.muted, marginTop: 2 }}>{player.nat} {player.age} · {player.pos}</div>
      </div>
      <div style={{ fontSize: 13, color: p.text }}>
        <div style={{ fontWeight: 500 }}>{player.team}</div>
        <div style={{ fontSize: 11, color: p.muted, marginTop: 2 }}>
          <TSLeagueChip leagueId={player.leagueId} dark={dark} />
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <span style={{
          display: 'inline-block', padding: '4px 10px', borderRadius: 6,
          background: rank === 1 ? p.primary : p.primarySoft,
          color: rank === 1 ? p.bg : p.primary,
          fontWeight: 700, fontSize: 16, fontVariantNumeric: 'tabular-nums',
        }}>{player.goals}</span>
      </div>
      <div style={{ textAlign: 'right', fontSize: 14, color: p.text, fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>{player.ast}</div>
      <div style={{ textAlign: 'right', fontSize: 14, color: p.muted, fontVariantNumeric: 'tabular-nums' }}>{player.apps}</div>
      <div style={{ textAlign: 'right', fontSize: 13, color: p.text, fontVariantNumeric: 'tabular-nums' }}>
        {player.xg.toFixed(1)}
        <div style={{ fontSize: 10, color: player.goals > player.xg ? p.green : p.red, fontWeight: 600 }}>
          {player.goals > player.xg ? '+' : ''}{(player.goals - player.xg).toFixed(1)}
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <TSSparkline values={player.form} width={88} height={20} color={p.primary} fill={p.primarySoft} />
      </div>
      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', color: hover ? p.text : p.faint }}>
        <button style={{ width: 26, height: 26, border: `1px solid ${p.border}`, borderRadius: 5, background: p.surface, cursor: 'pointer', color: 'inherit', fontFamily: 'inherit' }}>⋯</button>
      </div>

      {hover && (
        <div style={{ position: 'absolute', left: '100%', top: '50%', transform: 'translate(-12px, -50%)', zIndex: 10, pointerEvents: 'none' }}>
          <TSHoverCard player={player} palette={{ ...p, surface: p.card, divider: p.divider }} t={t} />
        </div>
      )}
    </div>
  );
}

// ─── A · Player profile ──────────────────────────────────────────────────────
function SPlayer({ initialDark = false, initialLang = 'ES' }) {
  const [dark, setDark] = useStateS(initialDark);
  const [lang, setLang] = useStateS(initialLang);
  const p = sPalette(dark);
  const t = window.TS_T[lang];
  const pl = window.TS_DATA.players[0];
  const av = sAvatar(pl, p);
  const initials = 'EH';

  const radarValues = [
    { label: t.goals, value: pl.goals, pct: 95 },
    { label: 'xG', value: pl.xg, pct: 92 },
    { label: t.shots, value: pl.shots, pct: 88 },
    { label: t.conversion, value: '23%', pct: 86 },
    { label: t.ast, value: pl.ast, pct: 42 },
    { label: 'H-T', value: pl.hat, pct: 80 },
  ];

  return (
    <div style={{ display: 'flex', background: p.bg, color: p.text, minHeight: '100%', fontFamily: 'DM Sans, sans-serif' }}>
      <SSidebar p={p} active="players" t={t} />
      <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <header style={{
          height: 60, padding: '0 24px',
          display: 'flex', alignItems: 'center', gap: 16,
          borderBottom: `1px solid ${p.border}`, background: p.surface,
        }}>
          <span style={{ fontSize: 13, color: p.muted }}>
            {t.players} <span style={{ color: p.faint }}>/</span> {pl.team} <span style={{ color: p.faint }}>/</span>{' '}
            <strong style={{ color: p.text, fontWeight: 600 }}>{pl.name}</strong>
          </span>
          <div style={{ flex: 1 }} />
          <button style={{ padding: '7px 12px', background: 'transparent', color: p.text, border: `1px solid ${p.border}`, borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>+ Watchlist</button>
          <button style={{ padding: '7px 12px', background: 'transparent', color: p.text, border: `1px solid ${p.border}`, borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>⚖ Comparar</button>
          <TSLang lang={lang} onChange={setLang} dark={dark} />
          <TSThemeToggle dark={dark} onChange={setDark} accent={p.primary} />
          <button style={{ padding: '7px 12px', background: p.primary, color: p.bg, border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>↗ Compartir</button>
        </header>

        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Identity card */}
          <div style={{
            background: p.card, border: `1px solid ${p.border}`, borderRadius: 12,
            padding: 24, display: 'grid', gridTemplateColumns: '140px 1fr auto', gap: 24, alignItems: 'center',
          }}>
            <div style={{
              width: 140, height: 140, borderRadius: 16,
              background: av.bg, color: av.fg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 56, fontWeight: 700, letterSpacing: '-0.03em', position: 'relative', overflow: 'hidden',
            }}>
              <TSPhoto player={pl} size={140} shape="rounded" tone={dark ? 'dark' : 'light'} />
            </div>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 8px', background: p.primarySoft, color: p.primary, borderRadius: 999, fontSize: 11, fontWeight: 600 }}>
                <svg width="11" height="11" viewBox="0 0 11 11" fill="currentColor"><path d="M5.5 1L7 4l3 .4-2.2 2 .5 3-2.8-1.5L2.7 9.4l.5-3L1 4.4 4 4z"/></svg>
                #1 · {t.goldenBoot} 25/26
              </div>
              <h1 style={{ margin: '8px 0 4px', fontSize: 36, fontWeight: 700, color: p.text, letterSpacing: '-0.02em', lineHeight: 1.05 }}>
                Erling Haaland
              </h1>
              <div style={{ display: 'flex', gap: 18, fontSize: 13, color: p.muted, flexWrap: 'wrap' }}>
                <span>🇳🇴 Noruega · {pl.age} años · 1,94m · pie izq.</span>
                <span>{pl.team} · #9 · Delantero centro</span>
                <span>Valor: <strong style={{ color: p.text }}>€180M</strong></span>
              </div>
              {/* live status */}
              <div style={{ marginTop: 12, display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 10px', background: p.tealSoft, color: p.teal, borderRadius: 6, fontSize: 12, fontWeight: 600 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: p.green, boxShadow: `0 0 8px ${p.green}` }} />
                Jugando · MCI 2-1 ARS · 78'
              </div>
            </div>
            {/* big number */}
            <div style={{ textAlign: 'center', padding: '0 12px', borderLeft: `1px solid ${p.divider}` }}>
              <div style={{ fontSize: 11, color: p.muted, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Goles 25/26</div>
              <div style={{ fontSize: 96, fontWeight: 700, color: p.primary, lineHeight: 0.9, letterSpacing: '-0.04em', fontVariantNumeric: 'tabular-nums', marginTop: 6 }}>
                {pl.goals}
              </div>
              <div style={{ display: 'flex', gap: 14, marginTop: 10, justifyContent: 'center', fontSize: 13, color: p.muted }}>
                <span><strong style={{ color: p.teal, fontSize: 18 }}>{pl.ast}</strong> AST</span>
                <span><strong style={{ color: p.text, fontSize: 18 }}>{pl.xg.toFixed(1)}</strong> xG</span>
                <span><strong style={{ color: p.green, fontSize: 18 }}>+1.6</strong> vs xG</span>
              </div>
            </div>
          </div>

          {/* tabs */}
          <div style={{ display: 'flex', gap: 4, borderBottom: `1px solid ${p.border}` }}>
            {[t.overview, t.shotMap, t.matches, t.history, t.compare].map((tab, i) => (
              <span key={tab} style={{
                padding: '10px 14px', fontSize: 13, fontWeight: i === 0 ? 600 : 500,
                color: i === 0 ? p.primary : p.muted, cursor: 'pointer',
                borderBottom: i === 0 ? `2px solid ${p.primary}` : '2px solid transparent',
                marginBottom: -1,
              }}>{tab}</span>
            ))}
          </div>

          {/* Body grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr 320px', gap: 18 }}>
            {/* Radar */}
            <div style={{ background: p.card, border: `1px solid ${p.border}`, borderRadius: 12, padding: 18 }}>
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: p.text }}>{t.perfProfile}</h3>
              <div style={{ fontSize: 11, color: p.muted, marginTop: 2 }}>{t.vsTop5}</div>
              <div style={{ marginTop: 10 }}>
                <TSRadar values={radarValues} size={320} color={p.primary} gridColor={p.divider} labelColor={p.muted} />
              </div>
              <div style={{
                marginTop: 14, paddingTop: 14, borderTop: `1px solid ${p.divider}`,
                display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10,
              }}>
                {[
                  ['7', 'Racha', p.primary],
                  ['3', 'H-T', p.text],
                  ['23%', 'Conv.', p.teal],
                  ['99', 'M/G', p.text],
                ].map(([n, l, c]) => (
                  <div key={l}>
                    <div style={{ fontSize: 20, fontWeight: 700, color: c, letterSpacing: '-0.02em', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{n}</div>
                    <div style={{ fontSize: 11, color: p.muted, marginTop: 3 }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Center: stats tables */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Por jornada */}
              <div style={{ background: p.card, border: `1px solid ${p.border}`, borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${p.divider}` }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>Estadísticas por jornada</h3>
                    <div style={{ fontSize: 11, color: p.muted, marginTop: 2 }}>Últimos 10 partidos · {pl.team} · {t.season} 25/26</div>
                  </div>
                  <button style={{ padding: '4px 10px', fontSize: 11, color: p.teal, background: p.tealSoft, border: 'none', borderRadius: 6, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>Ver todos →</button>
                </div>
                <div style={{
                  display: 'grid', gridTemplateColumns: '52px 1fr 90px 50px 36px 36px 36px 50px 50px',
                  gap: 8, padding: '8px 18px', background: p.card2,
                  fontSize: 10, color: p.muted, letterSpacing: '0.06em', fontWeight: 600, textTransform: 'uppercase',
                  borderBottom: `1px solid ${p.divider}`,
                }}>
                  <span>J</span><span>Rival</span><span>Resultado</span><span style={{ textAlign: 'right' }}>Min</span>
                  <span style={{ textAlign: 'right', color: p.primary }}>G</span>
                  <span style={{ textAlign: 'right', color: p.teal }}>A</span>
                  <span style={{ textAlign: 'right' }}>SHT</span>
                  <span style={{ textAlign: 'right' }}>xG</span>
                  <span style={{ textAlign: 'right' }}>Rating</span>
                </div>
                {[
                  { j: 36, vs: 'Arsenal',     ha: 'H', hs: 2, as: 1, min: 78, g: 1, a: 0, sht: 4, xg: 0.8, r: 8.4, live: true },
                  { j: 35, vs: 'Newcastle',   ha: 'A', hs: 0, as: 4, min: 90, g: 2, a: 1, sht: 5, xg: 1.6, r: 9.1 },
                  { j: 34, vs: 'Liverpool',   ha: 'H', hs: 1, as: 1, min: 90, g: 1, a: 0, sht: 3, xg: 0.9, r: 7.8 },
                  { j: 33, vs: 'Aston Villa', ha: 'A', hs: 1, as: 3, min: 88, g: 0, a: 1, sht: 2, xg: 0.4, r: 7.2 },
                  { j: 32, vs: 'Chelsea',     ha: 'H', hs: 2, as: 2, min: 90, g: 1, a: 0, sht: 4, xg: 1.1, r: 7.9 },
                  { j: 31, vs: 'Brighton',    ha: 'A', hs: 0, as: 5, min: 82, g: 2, a: 0, sht: 6, xg: 1.8, r: 8.7 },
                  { j: 30, vs: 'West Ham',    ha: 'H', hs: 1, as: 0, min: 90, g: 1, a: 0, sht: 3, xg: 0.7, r: 7.6 },
                  { j: 29, vs: 'Tottenham',   ha: 'A', hs: 1, as: 2, min: 90, g: 0, a: 1, sht: 2, xg: 0.5, r: 7.1 },
                  { j: 28, vs: 'Brentford',   ha: 'H', hs: 3, as: 0, min: 85, g: 3, a: 0, sht: 7, xg: 2.3, r: 9.4 },
                  { j: 27, vs: 'Fulham',      ha: 'A', hs: 1, as: 1, min: 90, g: 1, a: 1, sht: 4, xg: 1.2, r: 8.2 },
                ].map((m) => (
                  <div key={m.j} style={{
                    display: 'grid', gridTemplateColumns: '52px 1fr 90px 50px 36px 36px 36px 50px 50px',
                    gap: 8, padding: '10px 18px', alignItems: 'center', fontSize: 12,
                    borderBottom: `1px solid ${p.hairline}`,
                    background: m.live ? p.tealSoft : 'transparent',
                  }}>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', color: p.muted, fontSize: 11, fontWeight: 600 }}>
                      J{m.j}
                      {m.live && <span style={{ marginLeft: 4, color: p.teal, fontSize: 9 }}>● LIVE</span>}
                    </span>
                    <span style={{ color: p.text, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 10, color: p.muted, fontFamily: 'JetBrains Mono, monospace', width: 12 }}>{m.ha}</span>
                      {m.vs}
                    </span>
                    <span style={{ color: p.text, fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>
                      <span style={{ color: m.hs > m.as ? p.teal : m.hs < m.as ? p.muted : p.muted }}>{m.hs}</span>
                      <span style={{ color: p.faint, margin: '0 3px' }}>–</span>
                      <span style={{ color: m.as > m.hs ? p.teal : m.muted }}>{m.as}</span>
                    </span>
                    <span style={{ textAlign: 'right', color: p.muted, fontVariantNumeric: 'tabular-nums' }}>{m.min}'</span>
                    <span style={{ textAlign: 'right', color: m.g > 0 ? p.primary : p.faint, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{m.g || '·'}</span>
                    <span style={{ textAlign: 'right', color: m.a > 0 ? p.teal : p.faint, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{m.a || '·'}</span>
                    <span style={{ textAlign: 'right', color: p.muted, fontVariantNumeric: 'tabular-nums' }}>{m.sht}</span>
                    <span style={{ textAlign: 'right', color: p.muted, fontVariantNumeric: 'tabular-nums' }}>{m.xg.toFixed(1)}</span>
                    <span style={{
                      textAlign: 'right', fontWeight: 700, fontVariantNumeric: 'tabular-nums',
                      color: m.r >= 8.5 ? p.primary : m.r >= 7.5 ? p.teal : p.text,
                    }}>{m.r.toFixed(1)}</span>
                  </div>
                ))}
              </div>

              {/* Por temporada */}
              <div style={{ background: p.card, border: `1px solid ${p.border}`, borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${p.divider}` }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>Estadísticas por temporada</h3>
                    <div style={{ fontSize: 11, color: p.muted, marginTop: 2 }}>Carrera completa · 7 temporadas · 226 partidos</div>
                  </div>
                  <div style={{ display: 'flex', gap: 4, padding: 2, background: p.card2, borderRadius: 6 }}>
                    {['Liga', 'UCL', 'Total'].map((tab, i) => (
                      <button key={tab} style={{
                        padding: '4px 10px', fontSize: 11, fontWeight: 600, border: 'none', cursor: 'pointer',
                        borderRadius: 4, fontFamily: 'inherit',
                        background: i === 2 ? p.surface : 'transparent',
                        color: i === 2 ? p.text : p.muted,
                      }}>{tab}</button>
                    ))}
                  </div>
                </div>
                <div style={{
                  display: 'grid', gridTemplateColumns: '85px 1fr 90px 40px 38px 38px 40px 50px 50px',
                  gap: 8, padding: '8px 18px', background: p.card2,
                  fontSize: 10, color: p.muted, letterSpacing: '0.06em', fontWeight: 600, textTransform: 'uppercase',
                  borderBottom: `1px solid ${p.divider}`,
                }}>
                  <span>Temp.</span><span>Club</span><span>Liga</span>
                  <span style={{ textAlign: 'right' }}>PJ</span>
                  <span style={{ textAlign: 'right', color: p.primary }}>G</span>
                  <span style={{ textAlign: 'right', color: p.teal }}>A</span>
                  <span style={{ textAlign: 'right' }}>Min</span>
                  <span style={{ textAlign: 'right' }}>M/G</span>
                  <span style={{ textAlign: 'right' }}>Trofeos</span>
                </div>
                {[
                  { s: '25/26', club: 'Man City',      league: 'Premier',   pj: 32, g: 28, a: 6,  min: 2780, t: '◯' },
                  { s: '24/25', club: 'Man City',      league: 'Premier',   pj: 35, g: 31, a: 7,  min: 3050, t: '🏆 PL' },
                  { s: '23/24', club: 'Man City',      league: 'Premier',   pj: 38, g: 36, a: 8,  min: 3320, t: '🏆 PL · UCL' },
                  { s: '22/23', club: 'Man City',      league: 'Premier',   pj: 35, g: 36, a: 8,  min: 3050, t: '🏆 PL · UCL · FA' },
                  { s: '21/22', club: 'Dortmund',      league: 'Bundes.',   pj: 24, g: 22, a: 7,  min: 1980, t: '◯' },
                  { s: '20/21', club: 'Dortmund',      league: 'Bundes.',   pj: 28, g: 27, a: 4,  min: 2400, t: '🏆 Pokal' },
                  { s: '19/20', club: 'Dortmund',      league: 'Bundes.',   pj: 18, g: 13, a: 1,  min: 1180, t: '◯' },
                ].map((s, i) => (
                  <div key={s.s} style={{
                    display: 'grid', gridTemplateColumns: '85px 1fr 90px 40px 38px 38px 40px 50px 50px',
                    gap: 8, padding: '10px 18px', alignItems: 'center', fontSize: 12,
                    borderBottom: `1px solid ${p.hairline}`,
                    background: i === 0 ? p.primarySoft : 'transparent',
                  }}>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, fontWeight: i === 0 ? 700 : 600, color: i === 0 ? p.primary : p.text }}>
                      {s.s}
                      {i === 0 && <span style={{ marginLeft: 5, fontSize: 9, color: p.teal }}>●</span>}
                    </span>
                    <span style={{ color: p.text, fontWeight: 500 }}>{s.club}</span>
                    <span style={{ color: p.muted, fontSize: 11 }}>{s.league}</span>
                    <span style={{ textAlign: 'right', color: p.muted, fontVariantNumeric: 'tabular-nums' }}>{s.pj}</span>
                    <span style={{ textAlign: 'right', color: p.primary, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{s.g}</span>
                    <span style={{ textAlign: 'right', color: p.teal, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{s.a}</span>
                    <span style={{ textAlign: 'right', color: p.muted, fontVariantNumeric: 'tabular-nums', fontSize: 11 }}>{s.min}</span>
                    <span style={{ textAlign: 'right', color: p.muted, fontVariantNumeric: 'tabular-nums' }}>{Math.round(s.min / s.g)}</span>
                    <span style={{ textAlign: 'right', color: p.text, fontSize: 11 }}>{s.t}</span>
                  </div>
                ))}
                {/* totals row */}
                <div style={{
                  display: 'grid', gridTemplateColumns: '85px 1fr 90px 40px 38px 38px 40px 50px 50px',
                  gap: 8, padding: '12px 18px', alignItems: 'center', fontSize: 12,
                  background: p.card2, fontWeight: 700,
                }}>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: p.text, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total</span>
                  <span style={{ color: p.text }}>Carrera</span>
                  <span style={{ color: p.muted, fontSize: 11 }}>7 temp.</span>
                  <span style={{ textAlign: 'right', color: p.text, fontVariantNumeric: 'tabular-nums' }}>210</span>
                  <span style={{ textAlign: 'right', color: p.primary, fontVariantNumeric: 'tabular-nums' }}>193</span>
                  <span style={{ textAlign: 'right', color: p.teal, fontVariantNumeric: 'tabular-nums' }}>41</span>
                  <span style={{ textAlign: 'right', color: p.muted, fontVariantNumeric: 'tabular-nums', fontSize: 11 }}>17,560</span>
                  <span style={{ textAlign: 'right', color: p.muted, fontVariantNumeric: 'tabular-nums' }}>91</span>
                  <span style={{ textAlign: 'right', color: p.primary, fontSize: 11 }}>7 🏆</span>
                </div>
              </div>
            </div>

            {/* Right rail: contract, valuation, club, agent */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Contract card */}
              <div style={{ background: p.card, border: `1px solid ${p.border}`, borderRadius: 12, padding: 18 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>Contrato</h3>
                  <span style={{ padding: '2px 8px', background: p.tealSoft, color: p.teal, borderRadius: 999, fontSize: 10, fontWeight: 700, letterSpacing: '0.06em' }}>ACTIVO</span>
                </div>
                <div style={{ fontSize: 13 }}>
                  {[
                    ['Club', 'Manchester City'],
                    ['Desde', 'Jun 2022'],
                    ['Hasta', 'Jun 2027'],
                    ['Tiempo restante', '1 año 1 mes'],
                    ['Cláusula', '—'],
                    ['Salario anual', '€20M brutos'],
                    ['Agente', 'Rafaela Pimenta'],
                  ].map(([k, v]) => (
                    <div key={k} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
                      padding: '7px 0', borderBottom: `1px solid ${p.hairline}`,
                    }}>
                      <span style={{ color: p.muted, fontSize: 12 }}>{k}</span>
                      <span style={{ color: p.text, fontWeight: 500, textAlign: 'right' }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Valuation */}
              <div style={{ background: p.card, border: `1px solid ${p.border}`, borderRadius: 12, padding: 18 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>Valoración de mercado</h3>
                </div>
                <div style={{ fontSize: 11, color: p.muted, marginBottom: 12 }}>Fuente: Transfermarkt · TS Index</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <span style={{ fontSize: 36, fontWeight: 700, color: p.primary, lineHeight: 1, letterSpacing: '-0.02em' }}>€180M</span>
                  <span style={{ fontSize: 11, color: p.teal, fontWeight: 600 }}>↑ +€20M (3m)</span>
                </div>
                {/* mini history sparkline */}
                <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 5 }}>
                  {[
                    ['May 26', 180, 100],
                    ['Feb 26', 160,  89],
                    ['Sep 25', 180, 100],
                    ['May 25', 200, 111],
                    ['Sep 24', 180, 100],
                    ['Sep 23', 170,  94],
                  ].map(([date, val, w]) => (
                    <div key={date} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }}>
                      <span style={{ color: p.muted, fontFamily: 'JetBrains Mono, monospace', width: 50, letterSpacing: '0.04em' }}>{date}</span>
                      <div style={{ flex: 1, height: 8, background: p.card2, borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{ width: w + '%', height: '100%', background: p.primary, opacity: 0.7 }} />
                      </div>
                      <span style={{ color: p.text, fontWeight: 600, fontVariantNumeric: 'tabular-nums', width: 44, textAlign: 'right' }}>€{val}M</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* International */}
              <div style={{ background: p.card, border: `1px solid ${p.border}`, borderRadius: 12, padding: 18 }}>
                <h3 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 600 }}>Selección 🇳🇴</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {[
                    ['37', 'Partidos', p.text],
                    ['33', 'Goles', p.primary],
                    ['5', 'Asist.', p.teal],
                    ['Capitán', 'Rol', p.text],
                  ].map(([n, l, c]) => (
                    <div key={l}>
                      <div style={{ fontSize: 22, fontWeight: 700, color: c, letterSpacing: '-0.02em', lineHeight: 1 }}>{n}</div>
                      <div style={{ fontSize: 11, color: p.muted, marginTop: 3 }}>{l}</div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${p.divider}`, fontSize: 11, color: p.muted }}>
                  Debut: 5 sep 2019 vs Malta · Próx.: Mundial 2026
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

Object.assign(window, { SHome, SPlayer });
