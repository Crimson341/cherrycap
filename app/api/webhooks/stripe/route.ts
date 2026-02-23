import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-01-28.clover",
});

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Credit packages — must match app/api/stripe/checkout/route.ts
const STRIPE_CREDIT_PACKAGES: Record<
  string,
  { credits: number; name: string; amountUSD: number }
> = {
  "price_1T3kQSGlD0hw5URUrzSsTem2": { credits: 500,  name: "Starter Pack", amountUSD: 10.00 },
  "price_1T3kSCGlD0hw5URUt81VFiSj": { credits: 1200, name: "Pro Pack",     amountUSD: 30.00 },
  "price_1T3kU8GlD0hw5URUaPaVm5SG": { credits: 3000, name: "Studio Pack",  amountUSD: 80.00 },
};

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("stripe-signature");

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("Missing STRIPE_WEBHOOK_SECRET");
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 401 });
  }

  // Verify the webhook came from Stripe
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  console.log(`Stripe webhook received: ${event.type}`);

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const userId = session.metadata?.userId;
    const priceId = session.metadata?.priceId;

    if (!userId) {
      console.error("No userId in session metadata");
      return NextResponse.json({ error: "No userId in metadata" }, { status: 400 });
    }

    // Look up credits from the package map
    let creditsToAdd: number;
    let packageName: string;
    let amountUSD: number;

    if (priceId && STRIPE_CREDIT_PACKAGES[priceId]) {
      const pkg = STRIPE_CREDIT_PACKAGES[priceId];
      creditsToAdd = pkg.credits;
      packageName = pkg.name;
      amountUSD = pkg.amountUSD;
    } else {
      // Fallback: derive from amount paid (1 credit per cent)
      creditsToAdd = session.amount_total ?? 0;
      packageName = "Credit Purchase";
      amountUSD = (session.amount_total ?? 0) / 100;
      console.log(`No package mapping for priceId ${priceId}, crediting ${creditsToAdd}`);
    }

    try {
      await convex.action(api.admin.runInternalMutation, {
        path: "credits:addCreditsFromPurchase",
        serverSecret: process.env.CONVEX_SERVER_SECRET || "",
        args: {
          userId,
          amount: creditsToAdd,
          provider: "stripe",
          orderId: session.id,
          productId: priceId || "unknown",
          amountPaidUSD: amountUSD,
          description: `${packageName} — $${amountUSD.toFixed(2)}`,
        }
      });

      console.log(`✅ Added ${creditsToAdd} credits to user ${userId}`);
    } catch (err) {
      console.error("Failed to add credits:", err);
      return NextResponse.json({ error: "Failed to add credits" }, { status: 500 });
    }
  }

  // Handle refunds — deduct credits
  if (event.type === "charge.refunded") {
    const charge = event.data.object as Stripe.Charge;
    console.log(`Refund received for charge ${charge.id} — manual review may be needed`);
    // TODO: deduct credits proportional to refund if desired
  }

  return NextResponse.json({ received: true });
}

// Stripe sometimes pings GET to verify the endpoint is alive
export async function GET() {
  return NextResponse.json({ status: "Stripe webhook endpoint active" });
}
