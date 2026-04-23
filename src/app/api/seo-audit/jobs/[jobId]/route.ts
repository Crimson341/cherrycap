import { getSeoAuditJob } from "@/lib/seoAuditRequest";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ jobId: string }> },
) {
  const { jobId } = await params;
  return getSeoAuditJob(jobId);
}
