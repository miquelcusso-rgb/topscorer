import { auth } from '@clerk/nextjs/server'
import { stripe, PRICES } from '@/lib/stripe'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { userId } = await auth()

  if (!userId) {
    const signInUrl = new URL('/sign-in', req.url)
    signInUrl.searchParams.set('redirect_url', req.url)
    return NextResponse.redirect(signInUrl)
  }

  const plan    = req.nextUrl.searchParams.get('plan') as 'pro' | 'team' | null
  const billing = (req.nextUrl.searchParams.get('billing') ?? 'monthly') as 'monthly' | 'yearly'

  if (!plan || !['pro', 'team'].includes(plan)) {
    return NextResponse.redirect(new URL('/pricing', req.url))
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 })
  }

  const priceKey = `${plan}_${billing}` as keyof typeof PRICES
  const priceId  = PRICES[priceKey]

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3001'

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/?checkout=success`,
    cancel_url:  `${appUrl}/pricing?checkout=cancelled`,
    metadata: { userId, plan },
    allow_promotion_codes: true,
    subscription_data: {
      metadata: { userId, plan },
    },
  })

  return NextResponse.redirect(session.url!)
}
