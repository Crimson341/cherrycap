"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Coins,
  Sparkles,
  TrendingUp,
  History,
  ChevronRight,
  Zap,
  Gift,
  Crown,
  Building2,
  ArrowDownLeft,
  ArrowUpRight,
  Loader2,
  Check,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function CreditsPage() {
  const { user } = useUser();
  const balance = useQuery(api.credits.getBalance);
  const transactions = useQuery(api.credits.getTransactions, { limit: 20 });
  const packages = useQuery(api.credits.getPackages);
  const initializeCredits = useMutation(api.credits.initializeCredits);
  const seedPackages = useMutation(api.credits.seedDefaultPackages);

  const [isInitializing, setIsInitializing] = useState(false);
  const [purchasingPackage, setPurchasingPackage] = useState<string | null>(null);

  // Initialize credits for new users
  useEffect(() => {
    if (balance && balance.balance === 0 && balance.totalPurchased === 0 && balance.totalUsed === 0) {
      // New user, initialize with bonus
      setIsInitializing(true);
      initializeCredits()
        .then(() => setIsInitializing(false))
        .catch(() => setIsInitializing(false));
    }
  }, [balance, initializeCredits]);

  // Format credits as dollars
  const formatCredits = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  // Handle package purchase
  const handlePurchase = async (packageId: string, lemonSqueezyVariantId?: string) => {
    if (!user) return;

    setPurchasingPackage(packageId);

    try {
      // Create Lemon Squeezy checkout URL
      // For now, redirect to a placeholder - you'll replace with actual LS checkout
      const checkoutUrl = lemonSqueezyVariantId
        ? `https://cherrycap.lemonsqueezy.com/checkout/buy/${lemonSqueezyVariantId}?checkout[custom][user_id]=${user.id}`
        : null;

      if (checkoutUrl) {
        window.open(checkoutUrl, "_blank");
      } else {
        // No Lemon Squeezy configured yet
        alert("Payment integration coming soon! Add your Lemon Squeezy product IDs.");
      }
    } finally {
      setPurchasingPackage(null);
    }
  };

  // Seed packages if none exist
  const handleSeedPackages = async () => {
    await seedPackages({});
    window.location.reload();
  };

  const packageIcons = [
    { icon: Zap, gradient: "from-blue-500 to-cyan-500" },
    { icon: Crown, gradient: "from-rose-500 to-pink-500" },
    { icon: Sparkles, gradient: "from-purple-500 to-indigo-500" },
    { icon: Building2, gradient: "from-amber-500 to-orange-500" },
  ];

  return (
    <div className="min-h-screen bg-neutral-950 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl">
                <Coins className="h-6 w-6 text-white" />
              </div>
              AI Credits
            </h1>
            <p className="text-neutral-400 mt-1">Purchase credits to use AI features</p>
          </div>
        </div>

        {/* Balance Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-500/20 via-purple-500/20 to-indigo-500/20 border border-white/10 p-6 md:p-8"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-rose-500/10 via-transparent to-transparent" />

          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <p className="text-neutral-400 text-sm mb-1">Current Balance</p>
                <div className="flex items-baseline gap-2">
                  {balance === undefined ? (
                    <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
                  ) : (
                    <>
                      <span className="text-4xl md:text-5xl font-bold text-white">
                        {formatCredits(balance?.balance || 0)}
                      </span>
                      <span className="text-neutral-400 text-lg">credits</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex gap-6">
                <div className="text-center">
                  <div className="flex items-center gap-1 text-green-400 mb-1">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-sm">Purchased</span>
                  </div>
                  <p className="text-xl font-semibold text-white">
                    {formatCredits(balance?.totalPurchased || 0)}
                  </p>
                </div>
                <div className="text-center">
                  <div className="flex items-center gap-1 text-rose-400 mb-1">
                    <Sparkles className="h-4 w-4" />
                    <span className="text-sm">Used</span>
                  </div>
                  <p className="text-xl font-semibold text-white">
                    {formatCredits(balance?.totalUsed || 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Credit Packages */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Gift className="h-5 w-5 text-rose-400" />
              Buy Credits
            </h2>
          </div>

          {packages === undefined ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
            </div>
          ) : packages.length === 0 ? (
            <div className="text-center py-12 bg-neutral-900/50 rounded-2xl border border-neutral-800">
              <p className="text-neutral-400 mb-4">No credit packages available</p>
              <button
                onClick={handleSeedPackages}
                className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg transition-colors"
              >
                Create Default Packages
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {packages.map((pkg, index) => {
                const iconData = packageIcons[index % packageIcons.length];
                const Icon = iconData.icon;

                return (
                  <motion.div
                    key={pkg._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={cn(
                      "relative rounded-2xl border p-6 transition-all hover:scale-[1.02]",
                      pkg.isPopular
                        ? "bg-gradient-to-b from-rose-500/10 to-neutral-900 border-rose-500/50"
                        : "bg-neutral-900/50 border-neutral-800 hover:border-neutral-700"
                    )}
                  >
                    {pkg.isPopular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-rose-500 text-white text-xs font-semibold rounded-full">
                        MOST POPULAR
                      </div>
                    )}

                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-gradient-to-br",
                      iconData.gradient
                    )}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>

                    <h3 className="text-lg font-semibold text-white mb-1">{pkg.name}</h3>
                    <p className="text-sm text-neutral-400 mb-4">{pkg.description}</p>

                    <div className="mb-4">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-white">
                          ${(pkg.priceUSD / 100).toFixed(2)}
                        </span>
                      </div>
                      <div className="text-sm text-neutral-400 mt-1">
                        {formatCredits(pkg.credits)} credits
                        {pkg.bonusCredits > 0 && (
                          <span className="text-green-400 ml-1">
                            +{formatCredits(pkg.bonusCredits)} bonus
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handlePurchase(pkg._id, pkg.lemonSqueezyVariantId)}
                      disabled={purchasingPackage === pkg._id}
                      className={cn(
                        "w-full py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2",
                        pkg.isPopular
                          ? "bg-rose-500 hover:bg-rose-600 text-white"
                          : "bg-neutral-800 hover:bg-neutral-700 text-white"
                      )}
                    >
                      {purchasingPackage === pkg._id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          Buy Now
                          <ChevronRight className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Transaction History */}
        <div>
          <h2 className="text-xl font-semibold text-white flex items-center gap-2 mb-4">
            <History className="h-5 w-5 text-rose-400" />
            Transaction History
          </h2>

          <div className="bg-neutral-900/50 rounded-2xl border border-neutral-800 overflow-hidden">
            {transactions === undefined ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-12">
                <History className="h-12 w-12 text-neutral-600 mx-auto mb-3" />
                <p className="text-neutral-400">No transactions yet</p>
                <p className="text-sm text-neutral-500">Purchase credits to get started</p>
              </div>
            ) : (
              <div className="divide-y divide-neutral-800">
                {transactions.map((tx) => (
                  <div
                    key={tx._id}
                    className="p-4 flex items-center justify-between hover:bg-neutral-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center",
                          tx.amount > 0 ? "bg-green-500/20" : "bg-rose-500/20"
                        )}
                      >
                        {tx.amount > 0 ? (
                          <ArrowDownLeft className="h-5 w-5 text-green-400" />
                        ) : (
                          <ArrowUpRight className="h-5 w-5 text-rose-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-white font-medium">{tx.description}</p>
                        <p className="text-sm text-neutral-400">
                          {new Date(tx.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={cn(
                          "font-semibold",
                          tx.amount > 0 ? "text-green-400" : "text-rose-400"
                        )}
                      >
                        {tx.amount > 0 ? "+" : ""}
                        {formatCredits(tx.amount)}
                      </p>
                      <p className="text-sm text-neutral-500">
                        Balance: {formatCredits(tx.balanceAfter)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Credit Usage Guide */}
        <div className="bg-neutral-900/50 rounded-2xl border border-neutral-800 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">How Credits Work</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-rose-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-rose-400 font-semibold">1</span>
              </div>
              <div>
                <p className="text-white font-medium">Buy Credits</p>
                <p className="text-sm text-neutral-400">
                  Purchase credit packs above. More credits = better value.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-rose-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-rose-400 font-semibold">2</span>
              </div>
              <div>
                <p className="text-white font-medium">Use AI Features</p>
                <p className="text-sm text-neutral-400">
                  Credits are deducted based on the AI model used. Premium models cost more.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-rose-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-rose-400 font-semibold">3</span>
              </div>
              <div>
                <p className="text-white font-medium">Never Expires</p>
                <p className="text-sm text-neutral-400">
                  Your credits never expire. Use them whenever you need.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-neutral-800/50 rounded-xl">
            <p className="text-sm text-neutral-300">
              <strong className="text-white">Approximate costs:</strong>
            </p>
            <ul className="mt-2 space-y-1 text-sm text-neutral-400">
              <li>• Gemini 3 Pro (Best quality): ~$0.15 per blog post</li>
              <li>• Gemini 3 Flash (Fast): ~$0.03 per blog post</li>
              <li>• Gemini 2.5 (Budget): ~$0.01 per blog post</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
