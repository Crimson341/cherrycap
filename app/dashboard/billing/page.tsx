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
  Zap,
  Crown,
  Coins,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";

// Stripe credit packages — must match /api/stripe/checkout/route.ts
const CREDIT_PLANS = [
  {
    id: "starter",
    name: "Starter Pack",
    description: "Perfect for trying out AI features",
    credits: 500,
    bonus: 0,
    price: "$10",
    stripePriceId: "price_1T3kQSGlD0hw5URUrzSsTem2",
    popular: false,
    gradient: "from-blue-500 to-cyan-500",
    icon: Zap,
  },
  {
    id: "pro",
    name: "Pro Pack",
    description: "Best value for regular creators",
    credits: 1200,
    bonus: 200,
    price: "$30",
    stripePriceId: "price_1T3kSCGlD0hw5URUt81VFiSj",
    popular: true,
    gradient: "from-rose-500 to-pink-500",
    icon: Crown,
  },
  {
    id: "studio",
    name: "Studio Pack",
    description: "For power users and teams",
    credits: 3000,
    bonus: 600,
    price: "$80",
    stripePriceId: "price_1T3kU8GlD0hw5URUaPaVm5SG",
    popular: false,
    gradient: "from-purple-500 to-indigo-500",
    icon: Sparkles,
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

function BillingPageContent() {
  const { user } = useUser();
  const searchParams = useSearchParams();
  const [purchasingPlan, setPurchasingPlan] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Fetch user's subscriptions
  const subscriptions = useQuery(
    api.subscriptions.getByUserId,
    user ? {} : "skip"
  );

  // Fetch credit balance
  const balance = useQuery(api.credits.getBalance);

  // Check for success/cancelled params from Stripe redirect
  useEffect(() => {
    const payment = searchParams.get("payment");
    if (payment === "success") {
      setShowSuccess(true);
      window.history.replaceState({}, "", "/dashboard/billing");
    }
  }, [searchParams]);

  const activeSubscription = subscriptions?.find(
    (sub: { status: string }) => sub.status === "active" || sub.status === "on_trial"
  ) as {
    productName: string;
    status: string;
    variantName: string;
    renewsAt?: number;
    endsAt?: number;
    customerPortalUrl?: string;
    updatePaymentMethodUrl?: string;
    cardBrand?: string;
    cardLastFour?: string;
  } | undefined;

  const handlePurchaseCredits = async (stripePriceId: string) => {
    setPurchasingPlan(stripePriceId);
    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId: stripePriceId }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error("Failed to create checkout:", data.error);
        alert("Checkout failed. Please try again.");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setPurchasingPlan(null);
    }
  };

  const formatCredits = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-6 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl">
              <CreditCard className="h-5 w-5 text-white" />
            </div>
            Billing & Credits
          </h1>
          <p className="text-neutral-400">
            Purchase credits for AI features and manage your subscription
          </p>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center gap-3">
            <Check className="h-5 w-5 text-green-400" />
            <div>
              <p className="text-green-400 font-medium">Payment successful!</p>
              <p className="text-sm text-green-400/80">
                Your credits have been added to your account.
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

        {/* Credit Balance Summary */}
        <div className="mb-8 rounded-2xl border border-white/10 bg-gradient-to-br from-rose-500/10 via-purple-500/10 to-indigo-500/10 p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-neutral-400 text-sm mb-1">Current Credit Balance</p>
              <div className="flex items-baseline gap-2">
                {balance === undefined ? (
                  <Loader2 className="h-6 w-6 animate-spin text-rose-500" />
                ) : (
                  <>
                    <span className="text-3xl font-bold text-white">
                      {formatCredits(balance?.balance || 0)}
                    </span>
                    <span className="text-neutral-400">credits</span>
                  </>
                )}
              </div>
            </div>
            <a
              href="/dashboard/credits"
              className="text-sm text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors"
            >
              View transaction history
              <ChevronRight className="h-4 w-4" />
            </a>
          </div>
        </div>

        {/* Credit Packages */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Coins className="h-5 w-5 text-rose-400" />
            Buy Credits
          </h2>

          <div className="grid gap-5 md:grid-cols-3">
            {CREDIT_PLANS.map((plan) => {
              const Icon = plan.icon;
              return (
                <div
                  key={plan.id}
                  className={cn(
                    "relative rounded-2xl border p-6 transition-all hover:scale-[1.02]",
                    plan.popular
                      ? "bg-gradient-to-b from-rose-500/10 to-neutral-900 border-rose-500/50"
                      : "bg-neutral-900/50 border-neutral-800 hover:border-neutral-700"
                  )}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-rose-500 text-white text-xs font-bold rounded-full">
                      BEST VALUE
                    </div>
                  )}

                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-gradient-to-br",
                    plan.gradient
                  )}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>

                  <h3 className="text-lg font-semibold text-white mb-1">{plan.name}</h3>
                  <p className="text-sm text-neutral-400 mb-4">{plan.description}</p>

                  <div className="mb-5">
                    <span className="text-4xl font-black tracking-tight text-white">
                      {plan.price}
                    </span>
                    <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm">
                      <Coins className="h-4 w-4 text-rose-400" />
                      <span className="text-white font-medium">{plan.credits} credits</span>
                      {plan.bonus > 0 && (
                        <span className="text-emerald-400 font-bold ml-1">
                          +{plan.bonus} bonus
                        </span>
                      )}
                    </div>
                  </div>

                  <Button
                    onClick={() => handlePurchaseCredits(plan.stripePriceId)}
                    disabled={purchasingPlan === plan.stripePriceId}
                    className={cn(
                      "w-full py-3 rounded-xl font-bold transition-all group",
                      plan.popular
                        ? "bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white shadow-[0_0_20px_rgba(244,63,94,0.3)] hover:shadow-[0_0_25px_rgba(244,63,94,0.5)]"
                        : "bg-white/5 hover:bg-white/10 text-white border border-white/10"
                    )}
                  >
                    {purchasingPlan === plan.stripePriceId ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        <span className="group-hover:translate-x-[-4px] transition-transform">Buy Now</span>
                        <ChevronRight className="h-5 w-5 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                      </>
                    )}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>

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
