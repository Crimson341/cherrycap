export const leadStatuses = [
  "new",
  "contacted",
  "qualified",
  "won",
  "lost",
] as const;

export type LeadStatus = (typeof leadStatuses)[number];

export type DashboardLead = {
  id: string;
  createdAt: number;
  updatedAt: number;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  message: string;
  status: LeadStatus;
  notes: string;
  source: string;
  notificationStatus: string;
};
