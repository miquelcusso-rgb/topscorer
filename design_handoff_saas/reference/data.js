// TopScorers — datos de muestra (temporada 2025/26)
// Stats ficticias pero realistas. Foto: placeholder con monograma + color equipo.

window.TS_DATA = {
  season: '2025/26',
  asOf: '15 Mayo 2026',
  matchday: 36,

  // Player pool — ordered as top scorers
  players: [
    { id: 'haaland',    name: 'Erling Haaland',      first: 'E.',  last: 'HAALAND',       team: 'Manchester City', teamShort: 'MCI', league: 'Premier League',     leagueId: 'pl',  nat: '🇳🇴', age: 25, pos: 'DC',  goals: 28, ast: 6,  apps: 32, mins: 2780, shots: 121, sot: 68, xg: 26.4,  pen: 5, hat: 3, form: [1,2,1,0,1,2,0,1] },
    { id: 'mbappe',     name: 'Kylian Mbappé',       first: 'K.',  last: 'MBAPPÉ',        team: 'Real Madrid',     teamShort: 'RMA', league: 'LaLiga',             leagueId: 'll',  nat: '🇫🇷', age: 27, pos: 'EI',  goals: 24, ast: 11, apps: 33, mins: 2890, shots: 134, sot: 71, xg: 21.8,  pen: 3, hat: 2, form: [1,1,2,0,1,1,1,0] },
    { id: 'kane',       name: 'Harry Kane',          first: 'H.',  last: 'KANE',          team: 'Bayern München',  teamShort: 'BAY', league: 'Bundesliga',         leagueId: 'bl',  nat: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', age: 32, pos: 'DC',  goals: 23, ast: 8,  apps: 30, mins: 2640, shots: 109, sot: 62, xg: 22.1,  pen: 4, hat: 2, form: [2,0,1,1,1,1,0,1] },
    { id: 'lewa',       name: 'Robert Lewandowski',  first: 'R.',  last: 'LEWANDOWSKI',   team: 'FC Barcelona',    teamShort: 'BAR', league: 'LaLiga',             leagueId: 'll',  nat: '🇵🇱', age: 37, pos: 'DC',  goals: 20, ast: 4,  apps: 31, mins: 2510, shots: 98,  sot: 54, xg: 19.7,  pen: 4, hat: 1, form: [0,1,1,0,2,0,1,1] },
    { id: 'salah',      name: 'Mohamed Salah',       first: 'M.',  last: 'SALAH',         team: 'Liverpool',       teamShort: 'LIV', league: 'Premier League',     leagueId: 'pl',  nat: '🇪🇬', age: 33, pos: 'ED',  goals: 19, ast: 13, apps: 33, mins: 2880, shots: 102, sot: 56, xg: 16.8,  pen: 5, hat: 0, form: [1,0,1,2,0,1,0,1] },
    { id: 'lautaro',    name: 'Lautaro Martínez',    first: 'L.',  last: 'MARTÍNEZ',      team: 'Inter',           teamShort: 'INT', league: 'Serie A',            leagueId: 'sa',  nat: '🇦🇷', age: 28, pos: 'DC',  goals: 17, ast: 5,  apps: 31, mins: 2620, shots: 88,  sot: 47, xg: 16.2,  pen: 2, hat: 1, form: [1,1,0,0,1,1,0,1] },
    { id: 'vini',       name: 'Vinícius Jr.',        first: 'V.',  last: 'JÚNIOR',        team: 'Real Madrid',     teamShort: 'RMA', league: 'LaLiga',             leagueId: 'll',  nat: '🇧🇷', age: 25, pos: 'EI',  goals: 17, ast: 14, apps: 32, mins: 2790, shots: 91,  sot: 44, xg: 14.9,  pen: 1, hat: 0, form: [1,1,0,1,0,1,1,0] },
    { id: 'osimhen',    name: 'Victor Osimhen',      first: 'V.',  last: 'OSIMHEN',       team: 'Galatasaray',     teamShort: 'GAL', league: 'Süper Lig',          leagueId: 'tr',  nat: '🇳🇬', age: 27, pos: 'DC',  goals: 16, ast: 3,  apps: 28, mins: 2410, shots: 79,  sot: 41, xg: 15.4,  pen: 2, hat: 1, form: [0,1,2,0,0,1,1,0] },
    { id: 'isak',       name: 'Alexander Isak',      first: 'A.',  last: 'ISAK',          team: 'Newcastle',       teamShort: 'NEW', league: 'Premier League',     leagueId: 'pl',  nat: '🇸🇪', age: 26, pos: 'DC',  goals: 15, ast: 6,  apps: 29, mins: 2530, shots: 82,  sot: 42, xg: 13.8,  pen: 1, hat: 0, form: [0,1,1,0,1,0,1,1] },
    { id: 'vlahovic',   name: 'Dušan Vlahović',      first: 'D.',  last: 'VLAHOVIĆ',      team: 'Juventus',        teamShort: 'JUV', league: 'Serie A',            leagueId: 'sa',  nat: '🇷🇸', age: 26, pos: 'DC',  goals: 14, ast: 4,  apps: 30, mins: 2480, shots: 96,  sot: 44, xg: 14.2,  pen: 3, hat: 0, form: [1,0,0,1,0,1,1,0] },
    { id: 'thuram',     name: 'Marcus Thuram',       first: 'M.',  last: 'THURAM',        team: 'Inter',           teamShort: 'INT', league: 'Serie A',            leagueId: 'sa',  nat: '🇫🇷', age: 28, pos: 'DC',  goals: 13, ast: 7,  apps: 30, mins: 2390, shots: 71,  sot: 36, xg: 11.6,  pen: 0, hat: 0, form: [0,1,1,0,1,0,0,1] },
    { id: 'gyokeres',   name: 'Viktor Gyökeres',     first: 'V.',  last: 'GYÖKERES',      team: 'Arsenal',         teamShort: 'ARS', league: 'Premier League',     leagueId: 'pl',  nat: '🇸🇪', age: 27, pos: 'DC',  goals: 13, ast: 5,  apps: 28, mins: 2350, shots: 86,  sot: 39, xg: 12.4,  pen: 2, hat: 1, form: [1,0,1,0,0,1,1,0] },
  ],

  // Team brand colors
  teamColor: {
    MCI: '#6CABDD', RMA: '#FEBE10', BAY: '#DC052D', BAR: '#A50044',
    LIV: '#C8102E', INT: '#0068A8', GAL: '#FFB300', NEW: '#241F20',
    JUV: '#000000', ARS: '#EF0107',
  },

  leagues: [
    { id: 'pl',  name: 'Premier League',     short: 'EPL', country: 'Inglaterra' },
    { id: 'll',  name: 'LaLiga',             short: 'LIG', country: 'España' },
    { id: 'bl',  name: 'Bundesliga',         short: 'BUN', country: 'Alemania' },
    { id: 'sa',  name: 'Serie A',            short: 'SEA', country: 'Italia' },
    { id: 'l1',  name: 'Ligue 1',            short: 'LU1', country: 'Francia' },
    { id: 'tr',  name: 'Süper Lig',          short: 'SUP', country: 'Turquía' },
    { id: 'pt',  name: 'Primeira Liga',      short: 'PRI', country: 'Portugal' },
    { id: 'gr',  name: 'Super League',       short: 'SLG', country: 'Grecia' },
    { id: 'ucl', name: 'Champions League',   short: 'UCL', country: 'UEFA' },
  ],

  // Recent matchday results (for hero ticker)
  ticker: [
    { home: 'MCI', away: 'ARS', hs: 2, as: 1, live: false, min: 'FT' },
    { home: 'RMA', away: 'BAR', hs: 3, as: 2, live: false, min: 'FT' },
    { home: 'LIV', away: 'NEW', hs: 1, as: 1, live: true,  min: "78'" },
    { home: 'INT', away: 'JUV', hs: 0, as: 0, live: true,  min: "34'" },
    { home: 'BAY', away: 'BVB', hs: 4, as: 0, live: false, min: 'FT' },
    { home: 'GAL', away: 'FEN', hs: 2, as: 2, live: false, min: 'FT' },
  ],
};

// Photo placeholder: silhouette + team-color gradient — feels intentional,
// works offline, swap for real CDN urls in prod (player.photo via API-Football).
window.TS_PHOTO = function (player, opts) {
  opts = opts || {};
  const size = opts.size || 64;
  const teamColor = window.TS_DATA.teamColor[player.teamShort] || '#888';
  const initials = (player.first || '') + (player.last ? player.last[0] : '');
  return { teamColor, initials, size };
};
