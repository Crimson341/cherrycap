import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { DashboardLead, LeadStatus } from "@/lib/leads/types";

type LeadRow = {
  id: string;
  created_at: number;
  updated_at: number;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  message: string;
  status: LeadStatus;
  notes: string;
  source: string;
  notification_status: string;
};

function getDatabase() {
  const { env } = getCloudflareContext();
  if (!env.LEADS_DB) {
    throw new Error("LEADS_DB binding is not configured");
  }
  return env.LEADS_DB;
}

function mapLead(row: LeadRow): DashboardLead {
  return {
    id: row.id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    name: row.name,
    email: row.email,
    phone: row.phone,
    company: row.company,
    message: row.message,
    status: row.status,
    notes: row.notes,
    source: row.source,
    notificationStatus: row.notification_status,
  };
}

export async function createLead(input: {
  id: string;
  createdAt: number;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  message: string;
}) {
  const db = getDatabase();

  const duplicate = await db
    .prepare(
      "SELECT id FROM leads WHERE lower(email) = lower(?) AND created_at >= ? LIMIT 1",
    )
    .bind(input.email, input.createdAt - 5 * 60 * 1000)
    .first<{ id: string }>();

  if (duplicate) {
    return { id: duplicate.id, duplicate: true };
  }

  await db
    .prepare(
      `INSERT INTO leads (
        id, created_at, updated_at, name, email, phone, company, message,
        status, notes, source, notification_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'new', '', 'website', 'pending')`,
    )
    .bind(
      input.id,
      input.createdAt,
      input.createdAt,
      input.name,
      input.email,
      input.phone || null,
      input.company || null,
      input.message,
    )
    .run();

  return { id: input.id, duplicate: false };
}

export async function setLeadNotificationStatus(
  id: string,
  status: "sent" | "failed",
) {
  await getDatabase()
    .prepare(
      "UPDATE leads SET notification_status = ?, updated_at = ? WHERE id = ?",
    )
    .bind(status, Date.now(), id)
    .run();
}

export async function getLeadDashboardData() {
  try {
    const db = getDatabase();
    const [countRow, statusRows, leadsResult] = await Promise.all([
      db.prepare("SELECT COUNT(*) AS total, MAX(created_at) AS latest FROM leads")
        .first<{ total: number; latest: number | null }>(),
      db.prepare("SELECT status, COUNT(*) AS total FROM leads GROUP BY status")
        .all<{ status: LeadStatus; total: number }>(),
      db.prepare("SELECT * FROM leads ORDER BY created_at DESC LIMIT 100")
        .all<LeadRow>(),
    ]);

    return {
      isLive: true,
      total: countRow?.total ?? 0,
      lastCapturedAt: countRow?.latest ?? null,
      byStatus: Object.fromEntries(
        (statusRows.results ?? []).map((row: { status: LeadStatus; total: number }) => [
          row.status,
          row.total,
        ]),
      ) as Partial<Record<LeadStatus, number>>,
      leads: (leadsResult.results ?? []).map(mapLead),
    };
  } catch {
    return {
      isLive: false,
      total: 0,
      lastCapturedAt: null,
      byStatus: {} as Partial<Record<LeadStatus, number>>,
      leads: [] as DashboardLead[],
    };
  }
}

export async function updateLead(input: {
  id: string;
  status: LeadStatus;
  notes: string;
}) {
  const result = await getDatabase()
    .prepare("UPDATE leads SET status = ?, notes = ?, updated_at = ? WHERE id = ?")
    .bind(input.status, input.notes, Date.now(), input.id)
    .run();

  if (!result.meta.changes) {
    throw new Error("Lead not found");
  }
}
