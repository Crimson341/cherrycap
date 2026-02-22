import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Verify Lemon Squeezy webhook signature
function verifySignature(payload: string, signature: string, secret: string): boolean {
  const hmac = crypto.createHmac("sha256", secret);
  const digest = hmac.update(payload).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}

interface LemonSqueezyWebhookPayload {
  meta: {
    event_name: string;
    custom_data?: {
      user_id?: string;
    };
  };
  data: {
    id: string;
    type: string;
    attributes: {
      order_number: number;
      status: string;
      total: number;
      total_formatted: string;
      currency: string;
      first_order_item: {
        product_id: number;
        product_name: string;
        variant_id: number;
        variant_name: string;
        price: number;
      };
      user_email: string;
      user_name: string;
    };
    relationships?: {
      customer?: {
        data?: {
          id: string;
        };
      };
    };
  };
}

// Credit package mapping by Lemon Squeezy variant ID
// You'll need to update these after creating products in Lemon Squeezy
const CREDIT_PACKAGES: Record<string, { credits: number; bonus: number; name: string }> = {
  // Format: "variant_id": { credits: cents, bonus: cents, name: string }
  // Example: "123456": { credits: 500, bonus: 0, name: "Starter" }
  // These will be populated from your Lemon Squeezy products
};

export async function POST(req: NextRequest) {
  try {
    const webhookSecret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error("LEMONSQUEEZY_WEBHOOK_SECRET not configured");
      return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
    }

    const signature = req.headers.get("x-signature");
    if (!signature) {
      return NextResponse.json({ error: "No signature" }, { status: 401 });
    }

    const rawBody = await req.text();

    // Verify signature
    if (!verifySignature(rawBody, signature, webhookSecret)) {
      console.error("Invalid webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const payload: LemonSqueezyWebhookPayload = JSON.parse(rawBody);
    const eventName = payload.meta.event_name;

    console.log(`Lemon Squeezy webhook: ${eventName}`);

    // Handle order completed event
    if (eventName === "order_created") {
      const order = payload.data.attributes;
      const userId = payload.meta.custom_data?.user_id;

      if (!userId) {
        console.error("No user_id in custom_data");
        return NextResponse.json({ error: "No user_id provided" }, { status: 400 });
      }

      // Get variant ID to determine credits
      const variantId = order.first_order_item.variant_id.toString();
      const productId = order.first_order_item.product_id.toString();

      // Look up credits from our mapping or calculate from price
      let creditsToAdd: number;
      let bonusCredits = 0;
      let packageName = order.first_order_item.product_name;

      if (CREDIT_PACKAGES[variantId]) {
        creditsToAdd = CREDIT_PACKAGES[variantId].credits + CREDIT_PACKAGES[variantId].bonus;
        bonusCredits = CREDIT_PACKAGES[variantId].bonus;
        packageName = CREDIT_PACKAGES[variantId].name;
      } else {
        // Fallback: Convert price to credits (1:1 mapping, price is in cents)
        // User pays $9.99, gets 999 credits worth
        creditsToAdd = order.total;
        console.log(`No package mapping for variant ${variantId}, using price: ${creditsToAdd}`);
      }

      // Add credits to user's account
      try {
        await convex.mutation(api.credits.addCreditsFromPurchase, {
          userId,
          amount: creditsToAdd,
          provider: "lemon_squeezy",
          orderId: payload.data.id,
          productId,
          amountPaidUSD: order.total / 100, // Convert cents to dollars
          description: `${packageName} - ${order.total_formatted}${bonusCredits > 0 ? ` (+${bonusCredits} bonus)` : ""}`,
          serverSecret: process.env.CONVEX_SERVER_SECRET || "",
        });

        console.log(`Added ${creditsToAdd} credits to user ${userId}`);
      } catch (error) {
        console.error("Failed to add credits:", error);
        return NextResponse.json({ error: "Failed to add credits" }, { status: 500 });
      }
    }

    // Handle refunds
    if (eventName === "order_refunded") {
      const userId = payload.meta.custom_data?.user_id;
      const order = payload.data.attributes;

      if (userId) {
        // You might want to deduct credits on refund
        // For now, just log it
        console.log(`Order refunded for user ${userId}: ${order.total_formatted}`);
        // TODO: Implement credit deduction for refunds
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}

// Lemon Squeezy sends GET requests for webhook verification
export async function GET() {
  return NextResponse.json({ message: "Lemon Squeezy credits webhook endpoint" });
}
