export type Lang = 'es' | 'en'

export const T = {
  // Navbar
  nav_stats:       { es: 'Estadísticas', en: 'Statistics' },
  nav_players:     { es: 'Jugadores',    en: 'Players' },
  nav_competitions:{ es: 'Competiciones', en: 'Competitions' },
  nav_compare:     { es: 'Comparar',     en: 'Compare' },
  nav_results:     { es: 'Resultados',   en: 'Results' },
  nav_transfers:   { es: 'Transferencias', en: 'Transfers' },
  nav_world_cup:   { es: 'Mundial 2026', en: 'World Cup 2026' },
  nav_pricing:     { es: 'Precios',      en: 'Pricing' },
  nav_enter:       { es: 'Entrar / Pro', en: 'Sign in / Pro' },

  // Hero
  hero_top:        { es: 'TOP',          en: 'TOP' },
  hero_scorers:    { es: 'GOLEADORES',   en: 'SCORERS' },
  hero_assists:    { es: 'ASISTENTES',   en: 'ASSISTERS' },
  hero_midfield:   { es: 'CENTROCAMPISTAS', en: 'MIDFIELDERS' },
  hero_defense:    { es: 'DEFENSAS',     en: 'DEFENDERS' },
  hero_gk:         { es: 'PORTEROS',     en: 'GOALKEEPERS' },
  hero_of_europe:  { es: 'DE EUROPA',    en: 'OF EUROPE' },
  hero_de:         { es: 'de',           en: 'of' },
  hero_europe:     { es: 'Europa',       en: 'Europe' },
  hero_season:     { es: 'Temporada 2025/26', en: 'Season 2025/26' },
  hero_realtime:   { es: 'Tiempo real',  en: 'Real time' },
  hero_leagues:    { es: '8 ligas activas', en: '8 active leagues' },
  hero_desc:       { es: 'Las 5 grandes ligas + Portugal,\nTurquía y Grecia. Estadísticas\nactualizadas en tiempo real.', en: 'Top 5 leagues + Portugal,\nTurkey and Greece. Stats\nupdated in real time.' },

  // Tab labels
  tab_scorers:     { es: 'Goleadores',      en: 'Scorers' },
  tab_assists:     { es: 'Asistentes',      en: 'Assisters' },
  tab_midfield:    { es: 'Centrocampistas', en: 'Midfielders' },
  tab_defense:     { es: 'Defensas',        en: 'Defenders' },
  tab_gk:          { es: 'Porteros',        en: 'Goalkeepers' },

  // Table headers
  th_player:       { es: 'Jugador',   en: 'Player' },
  th_league:       { es: 'Liga',      en: 'League' },
  th_age:          { es: 'Edad',      en: 'Age' },
  th_pj:           { es: 'PJ',        en: 'MP' },
  th_goals:        { es: 'Goles',     en: 'Goals' },
  th_assists:      { es: 'Asist.',    en: 'Assist.' },
  th_ratio_g:      { es: 'G/PJ',      en: 'G/MP' },
  th_ratio_a:      { es: 'A/PJ',      en: 'A/MP' },
  th_val:          { es: 'Val.',       en: 'Val.' },
  th_val_plus:     { es: 'Val.+',     en: 'Val.+' },
  th_ga:           { es: 'G+A',       en: 'G+A' },
  th_min_g:        { es: 'Min/G',     en: 'Min/G' },
  th_elo:          { es: 'ELO',       en: 'ELO' },
  th_fantasy:      { es: 'Fant.',     en: 'Fant.' },

  // Filter toolbar
  filter_season:   { es: 'Temporada', en: 'Season' },
  filter_top5:     { es: 'Top 5',     en: 'Top 5' },
  filter_age:      { es: 'Edad',      en: 'Age' },
  filter_columns:  { es: 'Columnas',  en: 'Columns' },
  filter_league:   { es: 'Liga',      en: 'League' },
  filter_all_ages: { es: 'Todos',     en: 'All' },
  search_placeholder: { es: 'Buscar jugador…', en: 'Search player…' },
  add_player:      { es: '+ Añadir jugador', en: '+ Add player' },
  players_count:   { es: 'jugadores',  en: 'players' },

  // StatsPanel sort labels
  sort_val:        { es: 'Val.',  en: 'Val.' },
  sort_val_plus:   { es: 'Val+',  en: 'Val+' },
  sort_goals:      { es: 'Goles', en: 'Goals' },
  sort_assists:    { es: 'Asist', en: 'Assist' },
  sort_ratio_g:    { es: 'G/PJ',  en: 'G/MP' },
  sort_ratio_a:    { es: 'A/PJ',  en: 'A/MP' },
  sort_age:        { es: 'Edad',  en: 'Age' },
  sort_ga:         { es: 'G+A',   en: 'G+A' },

  // Upgrade / Pro gate
  upgrade_title:      { es: 'Posiciones 11–25 bloqueadas', en: 'Positions 11–25 locked' },
  upgrade_desc:       { es: 'Desbloquea el Top 25 completo + historial con Pro', en: 'Unlock the full Top 25 + history with Pro' },
  upgrade_cta:        { es: 'Pro desde €5/mes →', en: 'Pro from €5/mo →' },
  pro_gate_mid_title: { es: 'Datos de Centrocampistas — Solo Pro', en: 'Midfielder Data — Pro Only' },
  pro_gate_mid_desc:  { es: 'Accede a estadísticas de centrocampistas de las 8 principales ligas europeas.', en: 'Access midfielder stats from the top 8 European leagues.' },
  pro_gate_def_title: { es: 'Datos de Defensas — Solo Pro', en: 'Defender Data — Pro Only' },
  pro_gate_def_desc:  { es: 'Accede a estadísticas de defensas de las 8 principales ligas europeas.', en: 'Access defender stats from the top 8 European leagues.' },
  pro_gate_gk_title:  { es: 'Datos de Porteros — Solo Pro', en: 'Goalkeeper Data — Pro Only' },
  pro_gate_gk_desc:   { es: 'Accede a estadísticas de porteros de las 8 principales ligas europeas.', en: 'Access goalkeeper stats from the top 8 European leagues.' },
  pro_cta:            { es: 'Hazte Pro →', en: 'Go Pro →' },

  // Pricing
  pricing_title:   { es: 'Elige tu plan', en: 'Choose your plan' },
  pricing_monthly: { es: 'Mensual',   en: 'Monthly' },
  pricing_yearly:  { es: 'Anual',     en: 'Yearly' },
  pricing_free:    { es: 'Gratis',    en: 'Free' },
  pricing_cta_free:    { es: 'Empezar gratis', en: 'Start free' },
  pricing_cta_pro:     { es: 'Hazte Pro',      en: 'Go Pro' },
  pricing_cta_scout:   { es: 'Hazte Scout',    en: 'Go Scout' },

  // General
  loading:         { es: 'Cargando…', en: 'Loading…' },
  back_scorers:    { es: '← Goleadores', en: '← Scorers' },
  season_label:    { es: 'Temporada',    en: 'Season' },
  market_value:    { es: 'Valor mercado', en: 'Market value' },
  contract:        { es: 'Contrato',      en: 'Contract' },
  until:           { es: 'Hasta',         en: 'Until' },
  age_label:       { es: 'EDAD',          en: 'AGE' },
  stat_profile:    { es: 'PERFIL ESTADÍSTICO', en: 'STAT PROFILE' },
  season_history:  { es: 'HISTORIAL POR TEMPORADA', en: 'SEASON HISTORY' },
  extra_info:      { es: 'INFO ADICIONAL', en: 'EXTRA INFO' },

  // Footer
  footer_stats:    { es: 'Estadísticas',  en: 'Statistics' },
  footer_scorers:  { es: 'Goleadores',    en: 'Scorers' },
  footer_assists:  { es: 'Asistentes',    en: 'Assisters' },
  footer_midfield: { es: 'Centrocampistas', en: 'Midfielders' },
  footer_results:  { es: 'Resultados',    en: 'Results' },
  footer_competitions: { es: 'Competiciones', en: 'Competitions' },
  footer_world_cup: { es: 'Mundial 2026', en: 'World Cup 2026' },
  footer_tables:   { es: 'Clasificaciones', en: 'Tables' },
  footer_product:  { es: 'Producto',      en: 'Product' },
  footer_pricing:  { es: 'Precios',       en: 'Pricing' },
  footer_about:    { es: 'Sobre TopScorers', en: 'About TopScorers' },
  footer_privacy:  { es: 'Privacidad',    en: 'Privacy' },
  footer_legal:    { es: 'Aviso legal',   en: 'Legal notice' },
  footer_desc:     { es: 'Estadísticas de fútbol europeo. Goleadores y asistentes de las principales ligas.', en: 'European football statistics. Top scorers and assisters from the main leagues.' },
  footer_copy:     { es: 'Datos con fines informativos.', en: 'Data for informational purposes.' },
  footer_data:     { es: 'Hecho con datos de API-Football', en: 'Powered by API-Football data' },

  // Theme toggle hint
  theme_hint_light: { es: 'Modo claro', en: 'Light mode' },
  theme_hint_dark:  { es: 'Modo oscuro', en: 'Dark mode' },
  theme_aria_to_light: { es: 'Cambiar a modo claro', en: 'Switch to light mode' },
  theme_aria_to_dark:  { es: 'Cambiar a modo oscuro', en: 'Switch to dark mode' },

  // Discovery
  nav_discover:    { es: 'Radar Talentos', en: 'Scout Radar' },

  // Nav auth
  nav_sign_in:     { es: 'Entrar', en: 'Sign in' },
  nav_go_pro:      { es: '⚡ Pro', en: '⚡ Pro' },
  nav_upgrade:     { es: 'Upgrade', en: 'Upgrade' },
} as const

export type TKey = keyof typeof T
export function t(key: TKey, lang: Lang): string {
  return T[key][lang]
}
