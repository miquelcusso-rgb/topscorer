import { NextResponse } from 'next/server'

// OpenAPI 3.1 spec for the public Scout API. Served as JSON so users can plug
// it into Postman / Insomnia / openapi-generator. Mirrors the implementations
// in /app/api/v1/{players,scorers,standings}/route.ts.
const SPEC = {
  openapi: '3.1.0',
  info: {
    title: 'TopScorers Public API',
    version: '1.0.0',
    description:
      'Programmatic access to TopScorers data: top scorers, players and league standings across 30+ European, American, Asian and Middle-East competitions. Requires a Scout plan and a personal API key.',
    contact: {
      name: 'TopScorers Support',
      url: 'https://www.top-scorers.com/cuenta/api',
      email: 'hola@top-scorers.com',
    },
    license: { name: 'Proprietary' },
  },
  servers: [
    { url: 'https://www.top-scorers.com/api/v1', description: 'Production' },
  ],
  security: [{ bearerAuth: [] }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'tsk_live_…',
        description:
          'Personal API key created at /cuenta/api. Pass it as `Authorization: Bearer tsk_live_…`. Scout plan required.',
      },
    },
    parameters: {
      season: {
        name: 'season',
        in: 'query',
        required: false,
        schema: { type: 'string', default: '2526', example: '2526' },
        description:
          'Season identifier in the format YYYY (last two digits of start year + last two of end year). E.g. 2526 = 2025/26.',
      },
      league: {
        name: 'league',
        in: 'query',
        required: false,
        schema: { type: 'string', example: 'la liga' },
        description: 'League name (case insensitive). E.g. "premier league", "serie a", "la liga".',
      },
      position: {
        name: 'position',
        in: 'query',
        required: false,
        schema: { type: 'string', enum: ['FW', 'MF', 'DF', 'GK'] },
        description: 'Player position filter.',
      },
      limit: {
        name: 'limit',
        in: 'query',
        required: false,
        schema: { type: 'integer', default: 100, minimum: 1, maximum: 500 },
      },
    },
    schemas: {
      Player: {
        type: 'object',
        properties: {
          name:           { type: 'string', example: 'Erling Haaland' },
          slug:           { type: 'string', example: 'erling-haaland' },
          club:           { type: 'string', example: 'Manchester City' },
          league:         { type: 'string', example: 'Premier League' },
          season:         { type: 'string', example: '2526' },
          age:            { type: 'integer', example: 25 },
          position:       { type: ['string', 'null'], enum: ['FW', 'MF', 'DF', 'GK', null] },
          nationality:    { type: ['string', 'null'] },
          appearances:    { type: 'integer', example: 36 },
          goals:          { type: 'integer', example: 28 },
          assists:        { type: 'integer', example: 6 },
          goals_per_90:   { type: 'number', example: 0.86 },
          assists_per_90: { type: 'number', example: 0.18 },
          market_value:   { type: ['string', 'null'], example: '€180M' },
          rating:         { type: ['number', 'null'], example: 7.8 },
        },
      },
      ScorerRow: {
        type: 'object',
        properties: {
          rank:        { type: 'integer' },
          name:        { type: 'string' },
          slug:        { type: 'string' },
          club:        { type: 'string' },
          league:      { type: 'string' },
          goals:       { type: 'integer' },
          appearances: { type: 'integer' },
          goals_per_90:{ type: 'number' },
        },
      },
      StandingRow: {
        type: 'object',
        properties: {
          rank:   { type: 'integer' },
          team:   { type: 'string' },
          played: { type: 'integer' },
          won:    { type: 'integer' },
          drawn:  { type: 'integer' },
          lost:   { type: 'integer' },
          points: { type: 'integer' },
        },
      },
      Error: {
        type: 'object',
        properties: {
          error:   { type: 'string', example: 'unauthorized' },
          message: { type: 'string', example: 'Invalid or missing API key.' },
        },
      },
    },
    responses: {
      Unauthorized: {
        description: 'Missing, invalid, or revoked API key.',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
      },
      RateLimited: {
        description: 'Monthly quota exceeded (50 000 req/month).',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
      },
      BadRequest: {
        description: 'Invalid query parameters.',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
      },
    },
  },
  paths: {
    '/players': {
      get: {
        summary: 'List players',
        description:
          'Returns players for a season, optionally filtered by league and position. Default limit 100, max 500.',
        operationId: 'listPlayers',
        parameters: [
          { $ref: '#/components/parameters/league' },
          { $ref: '#/components/parameters/position' },
          { $ref: '#/components/parameters/season' },
          { $ref: '#/components/parameters/limit' },
        ],
        responses: {
          '200': {
            description: 'Array of Player records.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: { type: 'array', items: { $ref: '#/components/schemas/Player' } },
                    meta: {
                      type: 'object',
                      properties: {
                        count:   { type: 'integer' },
                        season:  { type: 'string' },
                        league:  { type: 'string' },
                        position:{ type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
          '400': { $ref: '#/components/responses/BadRequest' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '429': { $ref: '#/components/responses/RateLimited' },
        },
      },
    },
    '/scorers': {
      get: {
        summary: 'Top scorers ranking',
        operationId: 'topScorers',
        parameters: [
          { $ref: '#/components/parameters/league' },
          { $ref: '#/components/parameters/season' },
          { $ref: '#/components/parameters/limit' },
        ],
        responses: {
          '200': {
            description: 'Ranked list of top scorers.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: { type: 'array', items: { $ref: '#/components/schemas/ScorerRow' } },
                    meta: { type: 'object' },
                  },
                },
              },
            },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '429': { $ref: '#/components/responses/RateLimited' },
        },
      },
    },
    '/standings': {
      get: {
        summary: 'League standings',
        operationId: 'leagueStandings',
        parameters: [
          { $ref: '#/components/parameters/league' },
          { $ref: '#/components/parameters/season' },
        ],
        responses: {
          '200': {
            description: 'Sorted league table.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: { type: 'array', items: { $ref: '#/components/schemas/StandingRow' } },
                    meta: { type: 'object' },
                  },
                },
              },
            },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '429': { $ref: '#/components/responses/RateLimited' },
        },
      },
    },
  },
} as const

export function GET() {
  return NextResponse.json(SPEC, {
    headers: {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
