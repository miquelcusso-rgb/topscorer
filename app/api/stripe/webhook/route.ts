import { stripe } from '@/lib/stripe'
import { clerkClient } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import type Stripe from 'stripe'

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

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const { userId, plan } = session.metadata ?? {}

    if (userId && plan) {
      await clerk.users.updateUserMetadata(userId, {
        publicMetadata: {
          plan,
          stripeCustomerId: session.customer as string,
          planActivatedAt: new Date().toISOString(),
        },
      })
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object as Stripe.Subscription
    const userId = sub.metadata?.userId
    if (userId) {
      await clerk.users.updateUserMetadata(userId, {
        publicMetadata: { plan: 'free', planActivatedAt: null },
      })
    }
  }

  if (event.type === 'customer.subscription.updated') {
    const sub = event.data.object as Stripe.Subscription
    const userId = sub.metadata?.userId
    if (userId && sub.status !== 'active') {
      await clerk.users.updateUserMetadata(userId, {
        publicMetadata: { plan: 'free' },
      })
    }
  }

  return NextResponse.json({ received: true })
}
