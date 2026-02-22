import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { auth } from "@clerk/nextjs/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-01-28.clover",
});

// Credit packages — keep in sync with your Stripe products/prices
// Format: priceId -> number of credits granted after purchase
export const STRIPE_CREDIT_PACKAGES: Record<
  string,
  { credits: number; name: string; amountUSD: number }
> = {
  "price_1T3kQSGlD0hw5URUrzSsTem2": { credits: 500,  name: "Starter Pack", amountUSD: 10.00 },
  "price_1T3kSCGlD0hw5URUt81VFiSj": { credits: 1200, name: "Pro Pack",     amountUSD: 30.00 },
  "price_1T3kU8GlD0hw5URUaPaVm5SG": { credits: 3000, name: "Studio Pack",  amountUSD: 80.00 },
};

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { priceId } = await req.json();

    if (!priceId) {
      return NextResponse.json({ error: "Price ID is required" }, { status: 400 });
    }

    const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      // Pass the user's Clerk ID so the webhook knows who to credit
      metadata: {
        userId,
        priceId,
      },
      success_url: `${origin}/dashboard/billing?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/dashboard/billing?payment=cancelled`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: unknown) {
    const stripeError = error as { message?: string; type?: string; code?: string };
    console.error("Stripe checkout error:", stripeError.message, stripeError.type, stripeError.code);
    return NextResponse.json(
      { error: stripeError.message || "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
