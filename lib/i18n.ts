export type Lang = 'es' | 'en'

export const LOCALES: Lang[] = ['es', 'en']
export const DEFAULT_LOCALE: Lang = 'es'
export function isLocale(value: string): value is Lang {
  return value === 'es' || value === 'en'
}

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
  hero_leagues:    { es: '30+ ligas globales', en: '30+ leagues worldwide' },
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

  // ── Pricing page ──
  pricing_eyebrow:      { es: 'Planes y precios', en: 'Plans & pricing' },
  pricing_h1_pre:       { es: 'Elige tu', en: 'Choose your' },
  pricing_h1_accent:    { es: 'plan', en: 'plan' },
  pricing_subtitle_pre: { es: 'Desde el Top 10 gratuito hasta datos históricos de 5+ temporadas, stats avanzados y herramientas de análisis profesional. Los planes de pago son completamente ', en: 'From the free Top 10 to historical data of 5+ seasons, advanced stats and professional analysis tools. Paid plans are completely ' },
  pricing_subtitle_em:  { es: 'sin publicidad', en: 'ad-free' },
  pricing_per_month:    { es: 'mes', en: 'mo' },
  pricing_per_year:     { es: 'año', en: 'yr' },
  pricing_per_month_unit: { es: '/mes', en: '/mo' },
  pricing_save:         { es: 'ahorra', en: 'save' },
  pricing_save_badge:   { es: 'Ahorra 33–37%', en: 'Save 33–37%' },
  pricing_free_price:   { es: 'Gratis', en: 'Free' },
  pricing_plan_active:  { es: '✓ Plan activo', en: '✓ Active plan' },
  pricing_soon_short:   { es: 'Próx.', en: 'Soon' },

  // Plan cards
  pricing_free_desc:    { es: 'Para explorar sin compromiso. Sin registro.', en: 'To explore with no commitment. No sign-up.' },
  pricing_free_cta:     { es: 'Empezar gratis', en: 'Start free' },
  pricing_free_f1:      { es: 'Top 10 goleadores y asistentes por liga', en: 'Top 10 scorers and assisters per league' },
  pricing_free_f2:      { es: 'Clasificaciones y partidos en directo', en: 'Tables and live matches' },
  pricing_free_f3:      { es: 'Perfiles básicos de jugadores', en: 'Basic player profiles' },
  pricing_free_f4:      { es: 'Todas las competiciones europeas', en: 'All European competitions' },
  pricing_free_f5:      { es: '⚠ Con publicidad discreta', en: '⚠ With discreet ads' },

  pricing_pro_desc:     { es: 'Para el analista de fútbol serio.', en: 'For the serious football analyst.' },
  pricing_pro_badge:    { es: 'MÁS POPULAR', en: 'MOST POPULAR' },
  pricing_pro_cta:      { es: 'Empezar Pro', en: 'Start Pro' },
  pricing_pro_context:  { es: 'Compara con: FotMob Pro $2.99/mes (solo quita anuncios)', en: 'Compare with: FotMob Pro $2.99/mo (only removes ads)' },
  pricing_pro_f1:       { es: 'Todo lo de Free, sin anuncios', en: 'Everything in Free, ad-free' },
  pricing_pro_f2:       { es: 'Top 50 jugadores por liga', en: 'Top 50 players per league' },
  pricing_pro_f3:       { es: 'Comparaciones guardadas ilimitadas', en: 'Unlimited saved comparisons' },
  pricing_pro_f4:       { es: 'Acceso anticipado a encuestas (24 h)', en: 'Early access to polls (24h)' },
  pricing_pro_f5:       { es: 'Multiplicador ×2 en pick\'em', en: '×2 multiplier on pick\'em' },
  pricing_pro_f6:       { es: 'Radar de Talentos — descubre jugadores infravalorados', en: 'Scout Radar — discover undervalued players' },
  pricing_pro_f7:       { es: 'Watchlist privada hasta 20 jugadores', en: 'Private watchlist up to 20 players' },
  pricing_pro_f8:       { es: 'Export CSV 50/mes', en: 'CSV export 50/mo' },

  pricing_scout_desc:   { es: 'Para analistas, periodistas y ojeadores.', en: 'For analysts, journalists and scouts.' },
  pricing_scout_badge:  { es: 'PARA SCOUTS', en: 'FOR SCOUTS' },
  pricing_scout_cta:    { es: 'Empezar Scout', en: 'Start Scout' },
  pricing_scout_context:{ es: 'Todo el análisis que los scouts profesionales necesitan', en: 'All the analysis professional scouts need' },
  pricing_scout_f1:     { es: 'Todo lo de Pro, sin límites', en: 'Everything in Pro, no limits' },
  pricing_scout_f2:     { es: 'Top 50 + historial completo', en: 'Top 50 + full history' },
  pricing_scout_f3:     { es: 'Stats match-by-match por jugador', en: 'Match-by-match stats per player' },
  pricing_scout_f4:     { es: 'API acceso 50K req/mes', en: 'API access 50K req/mo' },
  pricing_scout_f5:     { es: 'Filtros avanzados: posición exacta, edad, valor mercado', en: 'Advanced filters: exact position, age, market value' },
  pricing_scout_f6:     { es: 'Alertas de rendimiento por email (próximo) — Próx.', en: 'Performance alerts by email (coming) — Soon' },
  pricing_scout_f7:     { es: 'Watchlist ilimitada', en: 'Unlimited watchlist' },
  pricing_scout_f8:     { es: 'Export CSV sin límites', en: 'CSV export unlimited' },
  pricing_scout_f9:     { es: 'Soporte prioritario', en: 'Priority support' },

  // Comparison table
  pricing_cmp_title:    { es: 'Comparativa completa', en: 'Full comparison' },
  pricing_cmp_feature:  { es: 'Feature', en: 'Feature' },
  pricing_cmp_players:        { es: 'Jugadores visibles', en: 'Visible players' },
  pricing_cmp_seasons:        { es: 'Temporadas disponibles', en: 'Available seasons' },
  pricing_cmp_ads:            { es: 'Publicidad', en: 'Advertising' },
  pricing_cmp_basic_stats:    { es: 'Stats básicos (G/A/PJ)', en: 'Basic stats (G/A/MP)' },
  pricing_cmp_adv_stats:      { es: 'Stats avanzados (G/90, A/90, ratio)', en: 'Advanced stats (G/90, A/90, ratio)' },
  pricing_cmp_shots:          { es: 'Disparos / Pases clave', en: 'Shots / Key passes' },
  pricing_cmp_physical:       { es: 'Stats físicos (altura/peso/duelos)', en: 'Physical stats (height/weight/duels)' },
  pricing_cmp_radar:          { es: 'Radar chart (6 ejes)', en: 'Radar chart (6 axes)' },
  pricing_cmp_comparator:     { es: 'Comparador de jugadores', en: 'Player comparator' },
  pricing_cmp_trajectory:     { es: 'Trayectoria de temporada', en: 'Season trajectory' },
  pricing_cmp_scout_radar:    { es: 'Radar de Talentos', en: 'Scout Radar' },
  pricing_cmp_tables:         { es: 'Clasificaciones + partidos', en: 'Tables + matches' },
  pricing_cmp_watchlist:      { es: 'Watchlist privada', en: 'Private watchlist' },
  pricing_cmp_export:         { es: 'Export CSV', en: 'CSV export' },
  pricing_cmp_alerts:         { es: 'Alertas de rendimiento', en: 'Performance alerts' },
  pricing_cmp_mbm:            { es: 'Stats match-by-match', en: 'Match-by-match stats' },
  pricing_cmp_api:            { es: 'Acceso API (50K req/mes)', en: 'API access (50K req/mo)' },
  pricing_cmp_adv_filters:    { es: 'Filtros avanzados pro', en: 'Advanced pro filters' },
  pricing_cmp_support:        { es: 'Soporte prioritario', en: 'Priority support' },
  // Plan B+ positioning (free expanded; Pro moat = community + no ads)
  pricing_cmp_community:      { es: 'Comunidad: encuestas + picks + comentarios', en: 'Community: polls + picks + comments' },
  pricing_cmp_badges:         { es: 'Badges (5 niveles)', en: 'Badges (5 tiers)' },
  pricing_cmp_saved_comp:     { es: 'Comparaciones guardadas', en: 'Saved comparisons' },
  pricing_cmp_early_access:   { es: 'Acceso anticipado a polls/picks', en: 'Early access to polls/picks' },
  pricing_cmp_pickem_mult:    { es: 'Multiplicador en pickem', en: 'Pickem multiplier' },
  pricing_cmp_cross_league:   { es: 'Ranking cross-liga (30+ ligas globales)', en: 'Cross-league ranking (30+ leagues worldwide)' },

  // Comparison cell values
  pricing_val_top10:    { es: 'Top 10', en: 'Top 10' },
  pricing_val_top25:    { es: 'Top 25', en: 'Top 25' },
  pricing_val_top50:    { es: 'Top 50', en: 'Top 50' },
  pricing_val_top100:   { es: 'Top 100', en: 'Top 100' },
  pricing_val_seasons_free: { es: '25/26 + 24/25', en: '25/26 + 24/25' },
  pricing_val_since_2021:   { es: 'Desde 20/21', en: 'Since 20/21' },
  pricing_val_full_history: { es: 'Histórico completo', en: 'Full history' },
  pricing_val_ads_warn:     { es: '⚠ Con anuncios', en: '⚠ With ads' },
  pricing_val_ad_free:      { es: '✓ Sin anuncios', en: '✓ Ad-free' },
  pricing_val_radar_basic:  { es: 'Básico (3 ejes)', en: 'Basic (3 axes)' },
  pricing_val_upto10:       { es: 'Hasta 10', en: 'Up to 10' },
  pricing_val_upto20:       { es: 'Hasta 20', en: 'Up to 20' },
  pricing_val_upto50:       { es: 'Hasta 20', en: 'Up to 20' },
  pricing_val_unlimited_f:  { es: 'Ilimitada', en: 'Unlimited' },
  pricing_val_upto5:        { es: 'Hasta 5', en: 'Up to 5' },
  pricing_val_early_24h:    { es: '24h antes', en: '24h early' },
  pricing_val_early_48h:    { es: '48h antes', en: '48h early' },
  pricing_val_mult_2x:      { es: '×2 puntos', en: '×2 points' },
  pricing_val_export_free_5: { es: '5/mes', en: '5/month' },
  pricing_val_export_pro_100:{ es: '50/mes', en: '50/month' },
  pricing_val_unlimited_m:  { es: 'Ilimitado', en: 'Unlimited' },
  pricing_val_export_pro:   { es: '50/mes', en: '50/mo' },

  // FAQ
  pricing_faq_title:    { es: 'Preguntas frecuentes', en: 'Frequently asked questions' },
  pricing_faq_q1:       { es: '¿La versión gratuita tiene publicidad?', en: 'Does the free version have ads?' },
  pricing_faq_a1:       { es: 'Sí, la versión gratuita incluye publicidad discreta para poder mantener el servicio. Los planes Pro y Scout son completamente libres de anuncios.', en: 'Yes, the free version includes discreet ads to help keep the service running. The Pro and Scout plans are completely ad-free.' },
  pricing_faq_q2:       { es: '¿Puedo cancelar cuando quiera?', en: 'Can I cancel anytime?' },
  pricing_faq_a2:       { es: 'Sí, sin permanencia. Cancelas desde tu cuenta y mantienes acceso hasta el final del período ya pagado.', en: 'Yes, no commitment. You cancel from your account and keep access until the end of the period already paid.' },
  pricing_faq_q3:       { es: '¿Hay período de prueba?', en: 'Is there a trial period?' },
  pricing_faq_a3:       { es: 'La versión Free es completamente gratuita para siempre. No hay prueba de tiempo limitado — simplemente empieza con Free y actualiza cuando lo necesites.', en: 'The Free version is completely free forever. There is no time-limited trial — just start with Free and upgrade whenever you need.' },
  pricing_faq_q4:       { es: '¿Qué métodos de pago aceptáis?', en: 'What payment methods do you accept?' },
  pricing_faq_a4:       { es: 'Tarjeta de crédito/débito (Visa, Mastercard, Amex) y SEPA Direct Debit para cuentas europeas, todo gestionado de forma segura a través de Stripe.', en: 'Credit/debit card (Visa, Mastercard, Amex) and SEPA Direct Debit for European accounts, all handled securely through Stripe.' },
  pricing_faq_q5:       { es: '¿Con qué frecuencia se actualizan los datos?', en: 'How often is the data updated?' },
  pricing_faq_a5:       { es: 'Los datos de la temporada en curso (25/26) se actualizan periódicamente desde las fuentes indicadas. Las temporadas anteriores son históricos consolidados.', en: 'Current season data (25/26) is updated periodically from the indicated sources. Previous seasons are consolidated historical records.' },
  pricing_faq_q6:       { es: '¿Puedo cambiar de mensual a anual?', en: 'Can I switch from monthly to yearly?' },
  pricing_faq_a6:       { es: 'Sí, puedes cambiar en cualquier momento desde tu cuenta. Al cambiar a anual se aplica un prorrateo del período restante.', en: 'Yes, you can switch anytime from your account. When switching to yearly a proration of the remaining period applies.' },

  // Footer CTA
  pricing_questions:    { es: '¿Tienes preguntas?', en: 'Have questions?' },
  pricing_back_app:     { es: '← Volver a la app', en: '← Back to the app' },

  // ── Onboarding page ──
  onb_welcome:      { es: '¡Bienvenido', en: 'Welcome' },
  onb_subtitle:     { es: '¿Cuál es tu club favorito? Personalizaremos tu experiencia.', en: 'What is your favourite club? We will personalize your experience.' },
  onb_search:       { es: 'Buscar club…', en: 'Search club…' },
  onb_results:      { es: 'Resultados', en: 'Results' },
  onb_league_others:{ es: 'Outros', en: 'Others' },
  onb_saving:       { es: 'Guardando…', en: 'Saving…' },
  onb_continue_with:{ es: 'Seguir con', en: 'Continue with' },
  onb_select_club:  { es: 'Selecciona un club', en: 'Select a club' },
  onb_skip:         { es: 'Ahora no', en: 'Not now' },
} as const

export type TKey = keyof typeof T
export function t(key: TKey, lang: Lang): string {
  return T[key][lang]
}
