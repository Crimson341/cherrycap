import { beforeEach, describe, expect, it, vi } from "vitest";

const mutation = vi.fn();
const query = vi.fn();

vi.mock("convex/browser", () => ({
  ConvexHttpClient: vi.fn(function ConvexHttpClient() {
    return { mutation, query };
  }),
}));

vi.mock("@/convex/_generated/api", () => ({
  api: {
    seoAuditJobs: {
      createJob: "createJob",
      getJob: "getJob",
    },
  },
}));

describe("seo audit request handlers", () => {
  beforeEach(() => {
    vi.resetModules();
    mutation.mockReset();
    query.mockReset();
    process.env.NEXT_PUBLIC_CONVEX_URL = "https://example.convex.cloud";
    process.env.SEO_AUDIT_RATE_LIMIT_SALT = "test-salt";
  });

  it("rejects private URLs before creating a job", async () => {
    const { createSeoAuditJob } = await import("./seoAuditRequest");
    const request = new Request("https://site.test/api", {
      method: "POST",
      body: JSON.stringify({ url: "http://127.0.0.1" }),
    });

    const { response } = await createSeoAuditJob(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toMatch(/private address/i);
    expect(mutation).not.toHaveBeenCalled();
  });

  it("returns 429 and retry-after when Convex rate limits a job", async () => {
    mutation.mockResolvedValue({
      jobId: "job123",
      status: "rate_limited",
      stage: "failed",
      retryAfterSeconds: 120,
    });
    const { createSeoAuditJob } = await import("./seoAuditRequest");
    const request = new Request("https://site.test/api", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": "203.0.113.10",
      },
      body: JSON.stringify({ url: "example.com", sessionId: "abc" }),
    });

    const { response } = await createSeoAuditJob(request);
    const body = await response.json();

    expect(response.status).toBe(429);
    expect(response.headers.get("retry-after")).toBe("120");
    expect(body.status).toBe("rate_limited");
  });

  it("returns completed job data from polling", async () => {
    query.mockResolvedValue({
      jobId: "job123",
      status: "complete",
      stage: "complete",
      result: { grade: "A" },
    });
    const { getSeoAuditJob } = await import("./seoAuditRequest");

    const response = await getSeoAuditJob("job123");
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.status).toBe("complete");
    expect(body.result.grade).toBe("A");
  });
});
