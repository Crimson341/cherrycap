import { createSeoAuditJob } from "@/lib/seoAuditRequest";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const { response } = await createSeoAuditJob(request);
  return response;
}
