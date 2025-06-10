import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_KEY || '', { apiVersion: '2023-08-16' });

export async function createCheckout(tenantId: string): Promise<string> {
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
    metadata: { tenantId },
    success_url: process.env.SUCCESS_URL!,
    cancel_url: process.env.CANCEL_URL!,
  });
  return session.url!;
}
