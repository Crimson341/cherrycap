import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import * as crypto from "crypto";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Verify webhook signature
function verifySignature(
  rawBody: string,
  signature: string,
  secret: string
): boolean {
  const hmac = crypto.createHmac("sha256", secret);
  const digest = hmac.update(rawBody).digest("hex");

  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(digest)
    );
  } catch {
    return false;
  }
}

// Parse timestamp from ISO string
function parseTimestamp(isoString: string | null | undefined): number | undefined {
  if (!isoString) return undefined;
  const date = new Date(isoString);
  return isNaN(date.getTime()) ? undefined : date.getTime();
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-signature");

    // Verify webhook signature
    const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;
    if (!secret) {
      console.error("Missing LEMON_SQUEEZY_WEBHOOK_SECRET");
      return NextResponse.json(
        { error: "Webhook secret not configured" },
        { status: 500 }
      );
    }

    if (!signature || !verifySignature(rawBody, signature, secret)) {
      console.error("Invalid webhook signature");
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }

    const payload = JSON.parse(rawBody);
    const eventName = payload.meta?.event_name;
    const customData = payload.meta?.custom_data || {};
    const attributes = payload.data?.attributes;

    console.log(`Lemon Squeezy webhook received: ${eventName}`);

    // Extract common subscription data
    const subscriptionData = {
      lemonSqueezySubscriptionId: String(payload.data?.id),
      lemonSqueezyCustomerId: String(attributes?.customer_id),
      lemonSqueezyOrderId: attributes?.order_id ? String(attributes.order_id) : undefined,
      lemonSqueezyProductId: String(attributes?.product_id),
      lemonSqueezyVariantId: String(attributes?.variant_id),
      productName: attributes?.product_name || "",
      variantName: attributes?.variant_name || "",
      status: attributes?.status || "active",
      billingAnchor: attributes?.billing_anchor,
      renewsAt: parseTimestamp(attributes?.renews_at),
      endsAt: parseTimestamp(attributes?.ends_at),
      trialEndsAt: parseTimestamp(attributes?.trial_ends_at),
      cardBrand: attributes?.card_brand,
      cardLastFour: attributes?.card_last_four,
      updatePaymentMethodUrl: attributes?.urls?.update_payment_method,
      customerPortalUrl: attributes?.urls?.customer_portal,
      isPaused: attributes?.pause !== null,
    };

    switch (eventName) {
      case "subscription_created": {
        const userId = customData.user_id;
        if (!userId) {
          console.error("No user_id in custom data");
          return NextResponse.json(
            { error: "Missing user_id" },
            { status: 400 }
          );
        }

        await convex.action(api.admin.runInternalMutation, {
          path: "subscriptions:create",
          serverSecret: process.env.CONVEX_SERVER_SECRET || "",
          args: {
            userId,
            organizationId: customData.organization_id || undefined,
            ...subscriptionData,
          }
        });

        console.log(`Subscription created for user ${userId}`);
        break;
      }

      case "subscription_updated": {
        await convex.action(api.admin.runInternalMutation, {
          path: "subscriptions:update",
          serverSecret: process.env.CONVEX_SERVER_SECRET || "",
          args: {
            lemonSqueezySubscriptionId: subscriptionData.lemonSqueezySubscriptionId,
            status: subscriptionData.status,
            renewsAt: subscriptionData.renewsAt,
            endsAt: subscriptionData.endsAt,
            trialEndsAt: subscriptionData.trialEndsAt,
            cardBrand: subscriptionData.cardBrand,
            cardLastFour: subscriptionData.cardLastFour,
            updatePaymentMethodUrl: subscriptionData.updatePaymentMethodUrl,
            customerPortalUrl: subscriptionData.customerPortalUrl,
            isPaused: subscriptionData.isPaused,
            productName: subscriptionData.productName,
            variantName: subscriptionData.variantName,
            lemonSqueezyVariantId: subscriptionData.lemonSqueezyVariantId,
          }
        });

        console.log(`Subscription updated: ${subscriptionData.lemonSqueezySubscriptionId}`);
        break;
      }

      case "subscription_cancelled": {
        await convex.action(api.admin.runInternalMutation, {
          path: "subscriptions:cancel",
          serverSecret: process.env.CONVEX_SERVER_SECRET || "",
          args: {
            lemonSqueezySubscriptionId: subscriptionData.lemonSqueezySubscriptionId,
            endsAt: subscriptionData.endsAt,
          }
        });

        console.log(`Subscription cancelled: ${subscriptionData.lemonSqueezySubscriptionId}`);
        break;
      }

      case "subscription_resumed": {
        await convex.action(api.admin.runInternalMutation, {
          path: "subscriptions:resume",
          serverSecret: process.env.CONVEX_SERVER_SECRET || "",
          args: {
            lemonSqueezySubscriptionId: subscriptionData.lemonSqueezySubscriptionId,
          }
        });

        console.log(`Subscription resumed: ${subscriptionData.lemonSqueezySubscriptionId}`);
        break;
      }

      case "subscription_expired": {
        await convex.action(api.admin.runInternalMutation, {
          path: "subscriptions:expire",
          serverSecret: process.env.CONVEX_SERVER_SECRET || "",
          args: {
            lemonSqueezySubscriptionId: subscriptionData.lemonSqueezySubscriptionId,
          }
        });

        console.log(`Subscription expired: ${subscriptionData.lemonSqueezySubscriptionId}`);
        break;
      }

      case "subscription_paused": {
        await convex.action(api.admin.runInternalMutation, {
          path: "subscriptions:pause",
          serverSecret: process.env.CONVEX_SERVER_SECRET || "",
          args: {
            lemonSqueezySubscriptionId: subscriptionData.lemonSqueezySubscriptionId,
          }
        });

        console.log(`Subscription paused: ${subscriptionData.lemonSqueezySubscriptionId}`);
        break;
      }

      case "subscription_unpaused": {
        await convex.action(api.admin.runInternalMutation, {
          path: "subscriptions:resume",
          serverSecret: process.env.CONVEX_SERVER_SECRET || "",
          args: {
            lemonSqueezySubscriptionId: subscriptionData.lemonSqueezySubscriptionId,
          }
        });

        console.log(`Subscription unpaused: ${subscriptionData.lemonSqueezySubscriptionId}`);
        break;
      }

      case "subscription_payment_failed": {
        await convex.action(api.admin.runInternalMutation, {
          path: "subscriptions:updatePaymentStatus",
          serverSecret: process.env.CONVEX_SERVER_SECRET || "",
          args: {
            lemonSqueezySubscriptionId: subscriptionData.lemonSqueezySubscriptionId,
            status: "past_due",
          }
        });

        console.log(`Payment failed for subscription: ${subscriptionData.lemonSqueezySubscriptionId}`);
        break;
      }

      case "subscription_payment_success":
      case "subscription_payment_recovered": {
        await convex.action(api.admin.runInternalMutation, {
          path: "subscriptions:updatePaymentStatus",
          serverSecret: process.env.CONVEX_SERVER_SECRET || "",
          args: {
            lemonSqueezySubscriptionId: subscriptionData.lemonSqueezySubscriptionId,
            status: "active",
          }
        });

        console.log(`Payment succeeded for subscription: ${subscriptionData.lemonSqueezySubscriptionId}`);
        break;
      }

      case "order_created": {
        // Handle one-time purchases if needed
        console.log(`Order created: ${payload.data?.id}`);
        break;
      }

      case "order_refunded": {
        // Handle refunds if needed
        console.log(`Order refunded: ${payload.data?.id}`);
        break;
      }

      default:
        console.log(`Unhandled event type: ${eventName}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

// Lemon Squeezy may send GET requests to verify the endpoint
export async function GET() {
  return NextResponse.json({ status: "Webhook endpoint active" });
}
