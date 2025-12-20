import {
  lemonSqueezySetup,
  createCheckout,
  getSubscription,
  updateSubscription,
  cancelSubscription as lsCancelSubscription,
  listProducts,
  listVariants,
  getCustomer,
} from "@lemonsqueezy/lemonsqueezy.js";

// Initialize Lemon Squeezy SDK
export function configureLemonSqueezy() {
  const apiKey = process.env.LEMON_SQUEEZY_API_KEY;
  if (!apiKey) {
    throw new Error("Missing LEMON_SQUEEZY_API_KEY environment variable");
  }
  lemonSqueezySetup({ apiKey });
}

// Get store ID from environment
export function getStoreId(): string {
  const storeId = process.env.LEMON_SQUEEZY_STORE_ID;
  if (!storeId) {
    throw new Error("Missing LEMON_SQUEEZY_STORE_ID environment variable");
  }
  return storeId;
}

// Create a checkout URL for a product variant
export async function createCheckoutUrl({
  variantId,
  userId,
  email,
  organizationId,
  redirectUrl,
}: {
  variantId: string;
  userId: string;
  email: string;
  organizationId?: string;
  redirectUrl?: string;
}): Promise<string> {
  configureLemonSqueezy();
  const storeId = getStoreId();

  const checkout = await createCheckout(storeId, variantId, {
    checkoutData: {
      email,
      custom: {
        user_id: userId,
        organization_id: organizationId || "",
      },
    },
    productOptions: {
      redirectUrl: redirectUrl || `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?success=true`,
    },
  });

  if (checkout.error) {
    throw new Error(checkout.error.message);
  }

  return checkout.data?.data.attributes.url || "";
}

// Get subscription details by ID
export async function getSubscriptionDetails(subscriptionId: string) {
  configureLemonSqueezy();

  const subscription = await getSubscription(subscriptionId);

  if (subscription.error) {
    throw new Error(subscription.error.message);
  }

  return subscription.data?.data;
}

// Update subscription (change plan)
export async function changeSubscriptionPlan(
  subscriptionId: string,
  newVariantId: string,
  options?: {
    invoiceImmediately?: boolean;
    disableProrations?: boolean;
  }
) {
  configureLemonSqueezy();

  const updated = await updateSubscription(subscriptionId, {
    variantId: parseInt(newVariantId),
    invoiceImmediately: options?.invoiceImmediately ?? false,
    disableProrations: options?.disableProrations ?? false,
  });

  if (updated.error) {
    throw new Error(updated.error.message);
  }

  return updated.data?.data;
}

// Cancel subscription
export async function cancelSubscription(subscriptionId: string) {
  configureLemonSqueezy();

  const cancelled = await lsCancelSubscription(subscriptionId);

  if (cancelled.error) {
    throw new Error(cancelled.error.message);
  }

  return cancelled.data?.data;
}

// Resume a paused or cancelled subscription
export async function resumeSubscription(subscriptionId: string) {
  configureLemonSqueezy();

  const resumed = await updateSubscription(subscriptionId, {
    cancelled: false,
  });

  if (resumed.error) {
    throw new Error(resumed.error.message);
  }

  return resumed.data?.data;
}

// Pause subscription
export async function pauseSubscription(
  subscriptionId: string,
  resumesAt?: Date
) {
  configureLemonSqueezy();

  const paused = await updateSubscription(subscriptionId, {
    pause: resumesAt
      ? { mode: "void", resumesAt: resumesAt.toISOString() }
      : { mode: "void" },
  });

  if (paused.error) {
    throw new Error(paused.error.message);
  }

  return paused.data?.data;
}

// Get all products from the store
export async function getProducts() {
  configureLemonSqueezy();
  const storeId = getStoreId();

  const products = await listProducts({
    filter: { storeId },
    include: ["variants"],
  });

  if (products.error) {
    throw new Error(products.error.message);
  }

  return products.data?.data || [];
}

// Get all variants for a product
export async function getProductVariants(productId: string) {
  configureLemonSqueezy();

  const variants = await listVariants({
    filter: { productId: parseInt(productId) },
  });

  if (variants.error) {
    throw new Error(variants.error.message);
  }

  return variants.data?.data || [];
}

// Get customer portal URL
export async function getCustomerPortalUrl(customerId: string): Promise<string> {
  configureLemonSqueezy();

  const customer = await getCustomer(customerId);

  if (customer.error) {
    throw new Error(customer.error.message);
  }

  return customer.data?.data.attributes.urls.customer_portal || "";
}

// Subscription status types
export type SubscriptionStatus =
  | "on_trial"
  | "active"
  | "paused"
  | "past_due"
  | "unpaid"
  | "cancelled"
  | "expired";

// Webhook event types we handle
export type WebhookEventType =
  | "subscription_created"
  | "subscription_updated"
  | "subscription_cancelled"
  | "subscription_resumed"
  | "subscription_expired"
  | "subscription_paused"
  | "subscription_unpaused"
  | "subscription_payment_success"
  | "subscription_payment_failed"
  | "subscription_payment_recovered"
  | "order_created"
  | "order_refunded";

// Parse webhook payload
export interface WebhookPayload {
  meta: {
    event_name: WebhookEventType;
    custom_data?: {
      user_id?: string;
      organization_id?: string;
    };
  };
  data: {
    id: string;
    type: string;
    attributes: {
      store_id: number;
      customer_id: number;
      order_id: number;
      product_id: number;
      variant_id: number;
      product_name: string;
      variant_name: string;
      user_name: string;
      user_email: string;
      status: SubscriptionStatus;
      status_formatted: string;
      card_brand: string;
      card_last_four: string;
      pause: null | { mode: string; resumes_at: string };
      cancelled: boolean;
      trial_ends_at: string | null;
      billing_anchor: number;
      first_subscription_item: {
        id: number;
        subscription_id: number;
        price_id: number;
        quantity: number;
        created_at: string;
        updated_at: string;
      };
      urls: {
        update_payment_method: string;
        customer_portal: string;
      };
      renews_at: string;
      ends_at: string | null;
      created_at: string;
      updated_at: string;
      test_mode: boolean;
    };
  };
}

// Verify webhook signature
export function verifyWebhookSignature(
  rawBody: string,
  signature: string,
  secret: string
): boolean {
  const crypto = require("crypto");
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
