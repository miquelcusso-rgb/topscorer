import { Resend } from 'resend'

function getResend() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not set')
  }
  return new Resend(process.env.RESEND_API_KEY)
}

export async function sendWelcomeEmail({
  to,
  name,
  plan,
}: {
  to: string
  name: string
  plan: 'pro' | 'scout'
}) {
  const planLabel = plan === 'scout' ? 'Scout' : 'Pro'
  const planFeatures = plan === 'scout'
    ? [
        'Todas las ligas en tiempo real',
        'Estadísticas avanzadas completas',
        'Comparador de jugadores',
        'ELO + Fantasy + Radar',
        'Datos históricos 5 temporadas',
        'API access (próximamente)',
      ]
    : [
        'Todas las ligas en tiempo real',
        'Top 25 jugadores por liga',
        'Comparador de jugadores',
        'ELO + Fantasy + Radar',
        'Datos históricos 5 temporadas',
      ]

  const resend = getResend()

  await resend.emails.send({
    from: 'TopScorers <noreply@top-scorers.com>',
    to,
    subject: `¡Bienvenido a TopScorers ${planLabel}! ⚽`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0908;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 20px;">

    <!-- Logo -->
    <div style="text-align:center;margin-bottom:32px;">
      <span style="font-size:22px;font-weight:800;letter-spacing:3px;color:#f1e8d2;text-transform:uppercase;">
        TOP<span style="color:#f0c040;">SCORERS</span>
      </span>
    </div>

    <!-- Hero -->
    <div style="background:linear-gradient(135deg,rgba(240,192,64,.12) 0%,rgba(0,200,176,.08) 100%);border:1px solid rgba(240,192,64,.25);border-radius:12px;padding:32px;text-align:center;margin-bottom:24px;">
      <div style="font-size:36px;margin-bottom:8px;">⚽</div>
      <h1 style="margin:0 0 8px;font-size:26px;font-weight:800;color:#f1e8d2;letter-spacing:1px;">
        ¡Ya eres <span style="color:#f0c040;">${planLabel}</span>!
      </h1>
      <p style="margin:0;font-size:15px;color:#9a917e;line-height:1.6;">
        Hola ${name}, tu suscripción está activa.<br>Ya tienes acceso a todas las funciones ${planLabel}.
      </p>
    </div>

    <!-- Features -->
    <div style="background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);border-radius:8px;padding:24px;margin-bottom:24px;">
      <p style="margin:0 0 16px;font-size:11px;font-weight:700;letter-spacing:2px;color:#9a917e;text-transform:uppercase;">Lo que tienes ahora</p>
      ${planFeatures.map(f => `
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
        <span style="color:#38c47a;font-size:14px;">✓</span>
        <span style="color:#f1e8d2;font-size:14px;">${f}</span>
      </div>`).join('')}
    </div>

    <!-- CTA -->
    <div style="text-align:center;margin-bottom:32px;">
      <a href="https://www.top-scorers.com" style="display:inline-block;background:#f0c040;color:#0a0908;font-weight:800;font-size:14px;letter-spacing:1px;padding:14px 32px;border-radius:6px;text-decoration:none;">
        Ver estadísticas →
      </a>
    </div>

    <!-- Footer -->
    <div style="text-align:center;border-top:1px solid rgba(255,255,255,.06);padding-top:20px;">
      <p style="margin:0 0 6px;font-size:12px;color:#9a917e;">
        ¿Preguntas? <a href="mailto:support@top-scorers.com" style="color:#f0c040;">support@top-scorers.com</a>
      </p>
      <p style="margin:0;font-size:11px;color:#6a6356;">
        Puedes gestionar tu suscripción desde tu perfil en la web.
      </p>
    </div>

  </div>
</body>
</html>`,
  })
}

// ─── Weekly digest ──────────────────────────────────────────────────────────

export interface WeeklyDigestData {
  to: string
  name: string
  lang: 'es' | 'en'
  watchlistRows: { player_name: string; club?: string; goals?: number; assists?: number; rating?: number }[]
  topRumor?: { headline: string; from_club?: string; to_club?: string; likelihood: number; url: string }
  featuredPoll?: { question: string; url: string; total_votes: number }
  topPerformer?: { player_name: string; club: string; goals: number; assists: number; rating?: number; url: string }
}

export interface PerformanceAlertEmail {
  to: string
  playerName: string
  playerSlug: string
  alertType: 'goal' | 'brace' | 'hat_trick' | 'assist' | 'rating_85'
  matchInfo: string  // e.g. "Manchester City 3–1 Arsenal · J36"
  goals?: number
  assists?: number
  rating?: number
  lang?: 'es' | 'en'
}

export async function sendPerformanceAlert(d: PerformanceAlertEmail) {
  const es = (d.lang ?? 'es') === 'es'
  const TYPE_LABEL: Record<PerformanceAlertEmail['alertType'], { es: string; en: string }> = {
    goal:       { es: 'ha marcado',          en: 'scored a goal' },
    brace:      { es: 'ha marcado un doblete', en: 'scored a brace' },
    hat_trick:  { es: '🎩 ¡Hat-trick!',      en: '🎩 Hat-trick!' },
    assist:     { es: 'ha dado una asistencia', en: 'recorded an assist' },
    rating_85:  { es: 'ha sacado nota ≥8.5', en: 'rated ≥8.5' },
  }
  const label = TYPE_LABEL[d.alertType][es ? 'es' : 'en']
  const subject = es
    ? `⚡ ${d.playerName} ${label}`
    : `⚡ ${d.playerName} ${label}`
  const playerUrl = `https://www.top-scorers.com/${es ? 'es' : 'en'}/jugadores/${d.playerSlug}`

  await getResend().emails.send({
    from: 'TopScorers Alerts <noreply@top-scorers.com>',
    to: d.to,
    subject,
    html: `<!DOCTYPE html><html lang="${es ? 'es' : 'en'}"><body style="margin:0;padding:0;background:#0a0908;font-family:-apple-system,Segoe UI,sans-serif;color:#f1e8d2;">
  <div style="max-width:520px;margin:0 auto;padding:28px 22px;">
    <div style="font-family:'Barlow Condensed',sans-serif;font-size:11px;font-weight:700;letter-spacing:3px;color:#f0c040;text-transform:uppercase;">SCOUT · ALERT</div>
    <h1 style="font-family:'Barlow Condensed',sans-serif;font-size:36px;font-weight:800;color:#f0c040;margin:8px 0 4px;letter-spacing:-0.01em;">${d.playerName}</h1>
    <p style="font-size:18px;color:#f1e8d2;margin:0 0 6px;">${label}</p>
    <p style="font-size:13px;color:#9a917e;margin:0 0 18px;">${d.matchInfo}</p>
    ${[d.goals != null ? `${es ? 'Goles' : 'Goals'}: <strong style="color:#f0c040;">${d.goals}</strong>` : '',
       d.assists != null ? `${es ? 'Asistencias' : 'Assists'}: <strong style="color:#3ed6c2;">${d.assists}</strong>` : '',
       d.rating != null ? `${es ? 'Nota' : 'Rating'}: <strong>${d.rating}</strong>` : '']
      .filter(Boolean)
      .join(' &nbsp;·&nbsp; ')}
    <div style="margin:24px 0;">
      <a href="${playerUrl}" style="background:#f0c040;color:#0a0908;padding:10px 22px;font-weight:700;border-radius:6px;text-decoration:none;font-size:14px;">${es ? 'Ver perfil del jugador' : 'View player profile'} →</a>
    </div>
    <hr style="border:none;border-top:1px solid rgba(255,255,255,.08);margin:24px 0;" />
    <p style="font-size:11px;color:#9a917e;">${es ? 'Recibes esto porque tienes una alerta Scout activa para este jugador. Gestiona alertas en' : 'You receive this because you have an active Scout alert for this player. Manage alerts at'} <a href="https://www.top-scorers.com/${es ? 'es' : 'en'}/cuenta/alerts" style="color:#9a917e;">/cuenta/alerts</a>.</p>
    <p style="font-size:11px;color:#6a6356;margin-top:8px;">by Furiosa Studio</p>
  </div>
</body></html>`,
  })
}

export async function sendWeeklyDigest(d: WeeklyDigestData) {
  const es = d.lang === 'es'
  const subject = es
    ? `⚽ Tu resumen TopScorers de la semana`
    : `⚽ Your TopScorers weekly recap`

  const watchlistHtml = d.watchlistRows.length === 0
    ? `<p style="color:#9a917e;font-size:13px;">${es ? 'No tienes jugadores en tu watchlist.' : 'No players on your watchlist yet.'} <a href="https://www.top-scorers.com/${d.lang}/jugadores" style="color:#f0c040">${es ? 'Añade desde aquí' : 'Add from here'}</a>.</p>`
    : d.watchlistRows.slice(0, 5).map(r => `
        <tr>
          <td style="padding:8px 10px;color:#f1e8d2;font-size:13px;">${r.player_name}${r.club ? ` <span style="color:#9a917e">· ${r.club}</span>` : ''}</td>
          <td style="padding:8px 10px;color:#f0c040;font-size:13px;text-align:right;">${r.goals ?? 0} G · ${r.assists ?? 0} A</td>
        </tr>`).join('')

  const rumorHtml = d.topRumor ? `
    <table cellpadding="0" cellspacing="0" style="width:100%;background:#15130f;border:1px solid #2a2620;border-radius:8px;margin:18px 0;">
      <tr><td style="padding:14px 16px;">
        <div style="font-size:10px;letter-spacing:2px;color:#00c8b0;text-transform:uppercase;font-weight:700;margin-bottom:6px;">
          ${es ? 'Rumor caliente' : 'Hot rumour'}
        </div>
        <a href="${d.topRumor.url}" style="color:#f1e8d2;font-size:15px;font-weight:700;text-decoration:none;">
          ${d.topRumor.headline}
        </a>
        <div style="color:#9a917e;font-size:12px;margin-top:4px;">
          ${d.topRumor.from_club ?? '?'} → ${d.topRumor.to_club ?? '?'} · ${d.topRumor.likelihood}% ${es ? 'probabilidad' : 'likelihood'}
        </div>
      </td></tr>
    </table>` : ''

  const topPerformerHtml = d.topPerformer ? `
    <table cellpadding="0" cellspacing="0" style="width:100%;background:linear-gradient(135deg,#1a1408 0%,#15130f 100%);border:1px solid #f0c04033;border-radius:8px;margin:18px 0;">
      <tr><td style="padding:16px 18px;">
        <div style="font-size:10px;letter-spacing:2px;color:#f0c040;text-transform:uppercase;font-weight:700;margin-bottom:8px;">
          🏆 ${es ? 'Jugador de la semana' : 'Top performer of the week'}
        </div>
        <a href="${d.topPerformer.url}" style="color:#f1e8d2;font-size:20px;font-weight:700;text-decoration:none;font-family:'Barlow Condensed',sans-serif;letter-spacing:0.3px;">
          ${d.topPerformer.player_name}
        </a>
        <div style="color:#9a917e;font-size:12px;margin-top:2px;">${d.topPerformer.club}</div>
        <div style="margin-top:10px;font-size:14px;">
          <span style="color:#f0c040;font-weight:700;">${d.topPerformer.goals}</span> <span style="color:#9a917e;font-size:11px;letter-spacing:1px;text-transform:uppercase;">${es ? 'goles' : 'goals'}</span>
          &nbsp;·&nbsp;
          <span style="color:#3ed6c2;font-weight:700;">${d.topPerformer.assists}</span> <span style="color:#9a917e;font-size:11px;letter-spacing:1px;text-transform:uppercase;">${es ? 'asist.' : 'assists'}</span>
          ${d.topPerformer.rating != null ? `&nbsp;·&nbsp;<span style="color:#f1e8d2;font-weight:700;">${d.topPerformer.rating}</span> <span style="color:#9a917e;font-size:11px;letter-spacing:1px;text-transform:uppercase;">${es ? 'nota' : 'rating'}</span>` : ''}
        </div>
      </td></tr>
    </table>` : ''

  const pollHtml = d.featuredPoll ? `
    <table cellpadding="0" cellspacing="0" style="width:100%;background:#15130f;border:1px solid #f0c04055;border-radius:8px;margin:18px 0;">
      <tr><td style="padding:14px 16px;">
        <div style="font-size:10px;letter-spacing:2px;color:#f0c040;text-transform:uppercase;font-weight:700;margin-bottom:6px;">
          ${es ? 'Vota esta semana' : 'Vote this week'}
        </div>
        <a href="${d.featuredPoll.url}" style="color:#f1e8d2;font-size:15px;font-weight:700;text-decoration:none;">
          ${d.featuredPoll.question}
        </a>
        <div style="color:#9a917e;font-size:12px;margin-top:4px;">
          ${d.featuredPoll.total_votes} ${es ? 'votos hasta ahora' : 'votes so far'}
        </div>
      </td></tr>
    </table>` : ''

  await getResend().emails.send({
    from: 'TopScorers <noreply@top-scorers.com>',
    to: d.to,
    subject,
    html: `<!DOCTYPE html><html lang="${d.lang}"><body style="margin:0;padding:0;background:#0a0908;font-family:-apple-system,Segoe UI,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:28px 20px;background:#0a0908;color:#f1e8d2;">
    <div style="text-align:center;margin-bottom:24px;">
      <div style="font-family:'Barlow Condensed',sans-serif;font-size:24px;font-weight:900;letter-spacing:3px;color:#f0c040;text-transform:uppercase;">TOPSCORERS</div>
    </div>
    <h1 style="font-family:'Barlow Condensed',sans-serif;font-size:24px;font-weight:700;color:#f1e8d2;margin:0 0 6px;">
      ${es ? `Hola ${d.name},` : `Hi ${d.name},`}
    </h1>
    <p style="color:#9a917e;font-size:14px;line-height:1.55;margin:0 0 22px;">
      ${es ? 'Lo más importante de la semana en tu fútbol europeo:' : 'This week in your European football:'}
    </p>

    <h2 style="font-family:'Barlow Condensed',sans-serif;font-size:14px;font-weight:700;color:#f0c040;letter-spacing:1.5px;text-transform:uppercase;margin:0 0 10px;">
      ⭐ ${es ? 'Tu watchlist' : 'Your watchlist'}
    </h2>
    <table cellpadding="0" cellspacing="0" style="width:100%;background:#0d0e1c;border:1px solid #2a2620;border-radius:8px;">
      ${watchlistHtml}
    </table>

    ${topPerformerHtml}
    ${rumorHtml}
    ${pollHtml}

    <div style="text-align:center;margin:28px 0 14px;">
      <a href="https://www.top-scorers.com/${d.lang}/cuenta" style="background:#f0c040;color:#05060c;padding:10px 22px;border-radius:5px;text-decoration:none;font-weight:700;letter-spacing:0.5px;font-family:'Barlow Condensed',sans-serif;">
        ${es ? 'Ver mi cuenta' : 'Open my account'}
      </a>
    </div>
    <p style="color:#9a917e;font-size:11px;text-align:center;line-height:1.6;margin:18px 0 0;">
      ${es ? '¿No quieres recibir este email?' : 'Don’t want this email?'}
      <a href="https://www.top-scorers.com/${d.lang}/cuenta" style="color:#9a917e;">${es ? 'Cambia tus preferencias' : 'Update preferences'}</a>.
    </p>
  </div>
</body></html>`,
  })
}
