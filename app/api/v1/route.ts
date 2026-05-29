import { NextResponse } from 'next/server'

// Public API root — discovery / documentation endpoint (no auth required)
export function GET() {
  return NextResponse.json({
    name: 'TopScorers API',
    version: '1',
    documentation: 'https://www.top-scorers.com/cuenta/api',
    authentication: 'Bearer token. Header: Authorization: Bearer tsk_live_…',
    plan_required: 'scout',
    rate_limit: '50000 requests / month',
    endpoints: {
      'GET /api/v1/players':   'List players with filters (league, position, season, limit).',
      'GET /api/v1/scorers':   'Top scorers ranking (league, season, limit).',
      'GET /api/v1/standings': 'League standings (league, season).',
    },
  })
}
