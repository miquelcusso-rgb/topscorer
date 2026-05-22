import { stripe } from '@/lib/stripe'
import { sendWelcomeEmail } from '@/lib/email'
import { clerkClient } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import type Stripe from 'stripe'

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Derive plan name from a Stripe price ID */
function planFromPriceId(priceId: string | undefined): 'pro' | 'scout' | 'free' {
  if (!priceId) return 'free'
  if (priceId === process.env.STRIPE_PRO_MONTHLY_PRICE_ID   ||
      priceId === process.env.STRIPE_PRO_YEARLY_PRICE_ID)    return 'pro'
  if (priceId === process.env.STRIPE_SCOUT_MONTHLY_PRICE_ID ||
      priceId === process.env.STRIPE_SCOUT_YEARLY_PRICE_ID)  return 'scout'
  return 'free'
}

/** ISO date from a Stripe Unix timestamp */
const isoFromUnix = (ts: number) => new Date(ts * 1000).toISOString()

/** Get current period end from a Subscription (Stripe v22 moved it to items[0]) */
function getPeriodEnd(sub: Stripe.Subscription): number {
  // Stripe API 2024+: current_period_end lives on SubscriptionItem, not Subscription
  const item = sub.items.data[0] as (Stripe.SubscriptionItem & { current_period_end?: number }) | undefined
  if (item?.current_period_end) return item.current_period_end
  // Fallback: billing_cycle_anchor as best approximation
  return sub.billing_cycle_anchor
}

/** Whether user chose to cancel at period end */
function getCancelAtPeriodEnd(sub: Stripe.Subscription): boolean {
  return sub.cancel_at_period_end
}

// ─── Webhook ──────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig  = req.headers.get('stripe-signature')

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing signature or secret' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const clerk = await clerkClient()

  // ── 1. New subscription created via checkout ───────────────────────────────
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const { userId, plan } = session.metadata ?? {}
    if (!userId || !plan) return NextResponse.json({ received: true })

    // Fetch full subscription to get period dates
    let planExpiry: string | null = null
    if (session.subscription) {
      const sub = await stripe.subscriptions.retrieve(session.subscription as string) as unknown as Stripe.Subscription
      planExpiry = isoFromUnix(getPeriodEnd(sub))
    }

    await clerk.users.updateUserMetadata(userId, {
      publicMetadata: {
        plan,
        stripeCustomerId:     session.customer as string,
        stripeSubscriptionId: session.subscription as string | undefined,
        planActivatedAt:      new Date().toISOString(),
        planExpiry,           // exact date access expires (= billing anchor + 1 period)
        planCancelsAt:        null,
      },
    })

    // Welcome email (non-blocking)
    try {
      const clerkUser = await clerk.users.getUser(userId)
      const email = clerkUser.emailAddresses[0]?.emailAddress
      const name  = clerkUser.firstName ?? clerkUser.username ?? 'futbolero'
      if (email) await sendWelcomeEmail({ to: email, name, plan: plan as 'pro' | 'scout' })
    } catch { /* email failure is non-fatal */ }
  }

  // ── 2. Successful payment (renewal) ───────────────────────────────────────
  // Fires every billing cycle — update planExpiry to the new period end
  if (event.type === 'invoice.payment_succeeded') {
    const invoice = event.data.object as Stripe.Invoice
    // Only process subscription renewals, not initial checkout (billing_reason = 'subscription_create' handled above)
    const invoiceSubId = (invoice as unknown as { subscription?: string }).subscription
    if (invoice.billing_reason === 'subscription_cycle' && invoiceSubId) {
      const sub = await stripe.subscriptions.retrieve(invoiceSubId) as unknown as Stripe.Subscription
      const userId = sub.metadata?.userId
      if (userId) {
        await clerk.users.updateUserMetadata(userId, {
          publicMetadata: {
            planExpiry:    isoFromUnix(getPeriodEnd(sub)),
            planCancelsAt: null, // renewed → no longer cancelling
          },
        })
      }
    }
  }

  // ── 3. Subscription updated (cancel_at_period_end, plan change, etc.) ─────
  if (event.type === 'customer.subscription.updated') {
    const sub    = event.data.object as Stripe.Subscription
    const userId = sub.metadata?.userId
    if (!userId) return NextResponse.json({ received: true })

    // Non-active subscription → revoke immediately (payment failed, fraud, etc.)
    if (sub.status !== 'active' && sub.status !== 'trialing') {
      await clerk.users.updateUserMetadata(userId, {
        publicMetadata: { plan: 'free', planExpiry: null, planCancelsAt: null },
      })
      return NextResponse.json({ received: true })
    }

    const plan          = planFromPriceId(sub.items.data[0]?.price?.id)
    const planExpiry    = isoFromUnix(getPeriodEnd(sub))

    // User requested cancellation → stays active until period end, then auto-drops to free
    // Stripe fires subscription.deleted when the period actually ends
    const planCancelsAt = getCancelAtPeriodEnd(sub) ? planExpiry : null

    await clerk.users.updateUserMetadata(userId, {
      publicMetadata: {
        plan,
        stripeCustomerId: sub.customer as string,
        planExpiry,
        planCancelsAt, // non-null = banner "Tu plan finaliza el <date>"
      },
    })
  }

  // ── 4. Subscription ended (period ran out after cancellation) ─────────────
  // Stripe fires this event on the exact day the billing period expires
  if (event.type === 'customer.subscription.deleted') {
    const sub    = event.data.object as Stripe.Subscription
    const userId = sub.metadata?.userId
    if (userId) {
      await clerk.users.updateUserMetadata(userId, {
        publicMetadata: {
          plan:             'free',
          planExpiry:       null,
          planCancelsAt:    null,
          planActivatedAt:  null,
        },
      })
    }
  }

  return NextResponse.json({ received: true })
}
