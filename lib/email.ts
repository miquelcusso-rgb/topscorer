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
<body style="margin:0;padding:0;background:#060d18;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 20px;">

    <!-- Logo -->
    <div style="text-align:center;margin-bottom:32px;">
      <span style="font-size:22px;font-weight:800;letter-spacing:3px;color:#eef4ff;text-transform:uppercase;">
        TOP<span style="color:#f0c040;">SCORERS</span>
      </span>
    </div>

    <!-- Hero -->
    <div style="background:linear-gradient(135deg,rgba(240,192,64,.12) 0%,rgba(0,200,176,.08) 100%);border:1px solid rgba(240,192,64,.25);border-radius:12px;padding:32px;text-align:center;margin-bottom:24px;">
      <div style="font-size:36px;margin-bottom:8px;">⚽</div>
      <h1 style="margin:0 0 8px;font-size:26px;font-weight:800;color:#eef4ff;letter-spacing:1px;">
        ¡Ya eres <span style="color:#f0c040;">${planLabel}</span>!
      </h1>
      <p style="margin:0;font-size:15px;color:#8898b8;line-height:1.6;">
        Hola ${name}, tu suscripción está activa.<br>Ya tienes acceso a todas las funciones ${planLabel}.
      </p>
    </div>

    <!-- Features -->
    <div style="background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);border-radius:8px;padding:24px;margin-bottom:24px;">
      <p style="margin:0 0 16px;font-size:11px;font-weight:700;letter-spacing:2px;color:#6878a0;text-transform:uppercase;">Lo que tienes ahora</p>
      ${planFeatures.map(f => `
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
        <span style="color:#38c47a;font-size:14px;">✓</span>
        <span style="color:#b8c8e0;font-size:14px;">${f}</span>
      </div>`).join('')}
    </div>

    <!-- CTA -->
    <div style="text-align:center;margin-bottom:32px;">
      <a href="https://www.top-scorers.com" style="display:inline-block;background:#f0c040;color:#060d18;font-weight:800;font-size:14px;letter-spacing:1px;padding:14px 32px;border-radius:6px;text-decoration:none;">
        Ver estadísticas →
      </a>
    </div>

    <!-- Footer -->
    <div style="text-align:center;border-top:1px solid rgba(255,255,255,.06);padding-top:20px;">
      <p style="margin:0 0 6px;font-size:12px;color:#525278;">
        ¿Preguntas? <a href="mailto:support@top-scorers.com" style="color:#7070a0;">support@top-scorers.com</a>
      </p>
      <p style="margin:0;font-size:11px;color:#3a3b52;">
        Puedes gestionar tu suscripción desde tu perfil en la web.
      </p>
    </div>

  </div>
</body>
</html>`,
  })
}
