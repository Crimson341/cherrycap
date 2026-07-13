"use server";

import { isAuthenticatedNextjs } from "@convex-dev/auth/nextjs/server";
import { revalidatePath } from "next/cache";
import { updateLead } from "@/lib/leads/db";
import { leadStatuses, type LeadStatus } from "@/lib/leads/types";

export async function updateLeadAction(formData: FormData) {
  if (!(await isAuthenticatedNextjs())) {
    throw new Error("Unauthorized");
  }

  const id = String(formData.get("id") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim() as LeadStatus;
  const notes = String(formData.get("notes") ?? "").trim().slice(0, 2000);

  if (!id || !leadStatuses.includes(status)) {
    throw new Error("Invalid lead update");
  }

  await updateLead({ id, status, notes });
  revalidatePath("/dashboard");
}
