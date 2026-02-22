"use client";

import { useState, useEffect, Suspense } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CreditCard,
  Sparkles,
  Check,
  Loader2,
  ExternalLink,
  AlertCircle,
  Zap,
  Crown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";

// AI Pro subscription variant ID - you'll need to replace this with your actual variant ID
const AI_PRO_VARIANT_ID = process.env.NEXT_PUBLIC_AI_PRO_VARIANT_ID || "";

// Pricing plans configuration
const PLANS = [
  {
    id: "ai-pro",
    name: "AI Pro",
    description: "Full access to all AI features",
    price: "$300",
    period: "/month",
    features: [
      "Unlimited AI queries",
      "AI-powered content generation",
      "Smart analytics insights",
      "Priority support",
      "Early access to new features",
    ],
    variantId: AI_PRO_VARIANT_ID,
    popular: true,
  },
];

function SubscriptionCard({
  subscription,
}: {
  subscription: {
    productName: string;
    variantName: string;
    status: string;
    renewsAt?: number;
    endsAt?: number;
    customerPortalUrl?: string;
    updatePaymentMethodUrl?: string;
    cardBrand?: string;
    cardLastFour?: string;
  };
}) {
  const statusColors: Record<string, string> = {
    active: "bg-green-500/10 text-green-400 border-green-500/20",
    on_trial: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    paused: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    past_due: "bg-red-500/10 text-red-400 border-red-500/20",
    cancelled: "bg-neutral-500/10 text-neutral-400 border-neutral-500/20",
    expired: "bg-neutral-500/10 text-neutral-400 border-neutral-500/20",
  };

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Crown className="h-5 w-5 text-rose-400" />
            <h3 className="text-lg font-semibold text-white">
              {subscription.productName}
            </h3>
          </div>
          <p className="text-sm text-neutral-400">{subscription.variantName}</p>
        </div>
        <Badge
          className={cn(
            "capitalize",
            statusColors[subscription.status] || statusColors.active
          )}
        >
          {subscription.status.replace("_", " ")}
        </Badge>
      </div>

      <div className="space-y-3 mb-6">
        {subscription.renewsAt && subscription.status === "active" && (
          <div className="flex justify-between text-sm">
            <span className="text-neutral-400">Next billing date</span>
            <span className="text-white">{formatDate(subscription.renewsAt)}</span>
          </div>
        )}
        {subscription.endsAt && subscription.status === "cancelled" && (
          <div className="flex justify-between text-sm">
            <span className="text-neutral-400">Access until</span>
            <span className="text-white">{formatDate(subscription.endsAt)}</span>
          </div>
        )}
        {subscription.cardBrand && subscription.cardLastFour && (
          <div className="flex justify-between text-sm">
            <span className="text-neutral-400">Payment method</span>
            <span className="text-white capitalize">
              {subscription.cardBrand} •••• {subscription.cardLastFour}
            </span>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        {subscription.customerPortalUrl && (
          <Button
            variant="outline"
            size="sm"
            className="flex-1 border-neutral-700 hover:bg-neutral-800"
            onClick={() => window.open(subscription.customerPortalUrl, "_blank")}
          >
            Manage Subscription
            <ExternalLink className="h-3.5 w-3.5 ml-2" />
          </Button>
        )}
        {subscription.updatePaymentMethodUrl && (
          <Button
            variant="outline"
            size="sm"
            className="border-neutral-700 hover:bg-neutral-800"
            onClick={() => window.open(subscription.updatePaymentMethodUrl, "_blank")}
          >
            Update Payment
          </Button>
        )}
      </div>
    </div>
  );
}

function PricingCard({
  plan,
  isCurrentPlan,
  onSubscribe,
  isLoading,
}: {
  plan: (typeof PLANS)[0];
  isCurrentPlan: boolean;
  onSubscribe: () => void;
  isLoading: boolean;
}) {
  return (
    <div
      className={cn(
        "relative rounded-2xl border p-6 transition-all",
        plan.popular
          ? "border-rose-500/50 bg-gradient-to-b from-rose-500/5 to-transparent"
          : "border-neutral-800 bg-neutral-900"
      )}
    >
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="bg-rose-500 text-white border-none px-3">
            Most Popular
          </Badge>
        </div>
      )}

      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-5 w-5 text-rose-400" />
          <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
        </div>
        <p className="text-sm text-neutral-400">{plan.description}</p>
      </div>

      <div className="mb-6">
        <span className="text-4xl font-bold text-white">{plan.price}</span>
        <span className="text-neutral-400">{plan.period}</span>
      </div>

      <ul className="space-y-3 mb-6">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-center gap-2 text-sm">
            <Check className="h-4 w-4 text-rose-400 shrink-0" />
            <span className="text-neutral-300">{feature}</span>
          </li>
        ))}
      </ul>

      <Button
        onClick={onSubscribe}
        disabled={isLoading || isCurrentPlan || !plan.variantId}
        className={cn(
          "w-full",
          plan.popular
            ? "bg-rose-500 hover:bg-rose-600"
            : "bg-neutral-800 hover:bg-neutral-700"
        )}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : isCurrentPlan ? (
          <>
            <Check className="h-4 w-4 mr-2" />
            Current Plan
          </>
        ) : !plan.variantId ? (
          "Coming Soon"
        ) : (
          <>
            <Zap className="h-4 w-4 mr-2" />
            Subscribe Now
          </>
        )}
      </Button>
    </div>
  );
}

function BillingPageContent() {
  const { user } = useUser();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Fetch user's subscriptions
  const subscriptions = useQuery(
    api.subscriptions.getByUserId,
    user ? {} : "skip"
  );

  // Check for success param
  useEffect(() => {
    if (searchParams.get("success") === "true") {
      setShowSuccess(true);
      // Remove query param from URL
      window.history.replaceState({}, "", "/dashboard/billing");
    }
  }, [searchParams]);

  const activeSubscription = subscriptions?.find(
    (sub: { status: string; productName?: string }) => sub.status === "active" || sub.status === "on_trial"
  ) as { productName: string; status: string; variantName: string; renewsAt?: number; endsAt?: number; customerPortalUrl?: string; updatePaymentMethodUrl?: string; cardBrand?: string; cardLastFour?: string } | undefined;

  const handleSubscribe = async (variantId: string) => {
    if (!variantId) return;

    setIsLoading(variantId);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          variantId,
          redirectUrl: `${window.location.origin}/dashboard/billing?success=true`,
        }),
      });

      const data = await response.json();

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        console.error("Failed to create checkout:", data.error);
      }
    } catch (error) {
      console.error("Checkout error:", error);
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Billing</h1>
          <p className="text-neutral-400">
            Manage your subscription and billing information
          </p>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center gap-3">
            <Check className="h-5 w-5 text-green-400" />
            <div>
              <p className="text-green-400 font-medium">
                Subscription successful!
              </p>
              <p className="text-sm text-green-400/80">
                Your subscription is now active. Thank you for subscribing!
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto text-green-400 hover:bg-green-500/10"
              onClick={() => setShowSuccess(false)}
            >
              Dismiss
            </Button>
          </div>
        )}

        {/* Current Subscription */}
        {activeSubscription && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-rose-400" />
              Current Subscription
            </h2>
            <SubscriptionCard subscription={activeSubscription} />
          </div>
        )}

        {/* Available Plans */}
        {!activeSubscription && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-rose-400" />
              Available Plans
            </h2>

            {!AI_PRO_VARIANT_ID && (
              <div className="mb-4 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-yellow-400 font-medium">Setup Required</p>
                  <p className="text-sm text-yellow-400/80">
                    Add your Lemon Squeezy variant ID to{" "}
                    <code className="bg-yellow-500/20 px-1 rounded">
                      NEXT_PUBLIC_AI_PRO_VARIANT_ID
                    </code>{" "}
                    in your environment variables to enable subscriptions.
                  </p>
                </div>
              </div>
            )}

            <div className="grid gap-6 md:grid-cols-1">
              {PLANS.map((plan) => (
                <PricingCard
                  key={plan.id}
                  plan={plan}
                  isCurrentPlan={false}
                  onSubscribe={() => handleSubscribe(plan.variantId)}
                  isLoading={isLoading === plan.variantId}
                />
              ))}
            </div>
          </div>
        )}

        {/* Past Subscriptions */}
        {subscriptions && subscriptions.length > 0 && !activeSubscription && (
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">
              Past Subscriptions
            </h2>
            <div className="space-y-4">
              {subscriptions
                .filter((sub) => sub.status !== "active" && sub.status !== "on_trial")
                .map((sub) => (
                  <SubscriptionCard key={sub._id} subscription={sub} />
                ))}
            </div>
          </div>
        )}

        {/* No Subscriptions */}
        {subscriptions?.length === 0 && (
          <div className="text-center py-12 rounded-2xl border border-neutral-800 bg-neutral-900/50">
            <CreditCard className="h-12 w-12 text-neutral-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">
              No active subscription
            </h3>
            <p className="text-neutral-400 max-w-sm mx-auto">
              Subscribe to AI Pro to unlock unlimited AI features and take your
              business to the next level.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function BillingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black p-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-rose-400" />
      </div>
    }>
      <BillingPageContent />
    </Suspense>
  );
}
