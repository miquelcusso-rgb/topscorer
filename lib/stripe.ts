import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? 'sk_test_placeholder')

export const PRICES = {
  pro_monthly:  process.env.STRIPE_PRO_MONTHLY_PRICE_ID!,
  pro_yearly:   process.env.STRIPE_PRO_YEARLY_PRICE_ID!,
  team_monthly: process.env.STRIPE_TEAM_MONTHLY_PRICE_ID!,
  team_yearly:  process.env.STRIPE_TEAM_YEARLY_PRICE_ID!,
} as const
