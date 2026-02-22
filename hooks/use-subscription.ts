"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function useSubscription() {
  const { user, isLoaded: isUserLoaded } = useUser();

  const subscriptions = useQuery(
    api.subscriptions.getByUserId,
    user?.id ? {} : "skip"
  );

  const activeSubscription = subscriptions?.find(
    (sub) => sub.status === "active" || sub.status === "on_trial"
  );

  const hasAISubscription = subscriptions?.some(
    (sub) =>
      (sub.status === "active" || sub.status === "on_trial") &&
      sub.productName.toLowerCase().includes("ai")
  );

  return {
    subscriptions,
    activeSubscription,
    hasAISubscription,
    isLoading: !isUserLoaded || subscriptions === undefined,
    isSubscribed: !!activeSubscription,
    status: activeSubscription?.status,
    productName: activeSubscription?.productName,
    variantName: activeSubscription?.variantName,
    renewsAt: activeSubscription?.renewsAt,
    endsAt: activeSubscription?.endsAt,
    customerPortalUrl: activeSubscription?.customerPortalUrl,
    updatePaymentMethodUrl: activeSubscription?.updatePaymentMethodUrl,
  };
}

export function useAIAccess() {
  const { user, isLoaded: isUserLoaded } = useUser();

  const hasAccess = useQuery(
    api.subscriptions.hasActiveAISubscription,
    user?.id ? {} : "skip"
  );

  return {
    hasAccess: hasAccess ?? false,
    isLoading: !isUserLoaded || hasAccess === undefined,
  };
}
