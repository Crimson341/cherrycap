import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

// CORS headers for cross-origin requests from tracked sites
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
};

// Handle preflight OPTIONS requests
http.route({
  path: "/track",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }),
});

// Main tracking endpoint - receives all tracking data
http.route({
  path: "/track",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();
      const { type, data } = body;

      if (!type || !data || !data.siteId) {
        return new Response(
          JSON.stringify({ success: false, error: "Missing required fields" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      let result;

      switch (type) {
        case "session":
          result = await ctx.runMutation(api.tracking.trackSession, {
            siteId: data.siteId,
            sessionId: data.sessionId,
            visitorId: data.visitorId,
            device: data.device || "desktop",
            browser: data.browser || "unknown",
            os: data.os || "unknown",
            country: data.country,
            referrer: data.referrer,
            referrerType: data.referrerType,
          });
          break;

        case "pageview":
          result = await ctx.runMutation(api.tracking.trackPageView, {
            siteId: data.siteId,
            sessionId: data.sessionId,
            path: data.path,
            referrer: data.referrer,
            utmSource: data.utmSource,
            utmMedium: data.utmMedium,
            utmCampaign: data.utmCampaign,
          });
          break;

        case "performance":
          result = await ctx.runMutation(api.tracking.trackPerformance, {
            siteId: data.siteId,
            sessionId: data.sessionId,
            path: data.path,
            lcp: data.lcp,
            fid: data.fid,
            cls: data.cls,
            fcp: data.fcp,
            ttfb: data.ttfb,
            loadTime: data.loadTime,
          });
          break;

        case "event":
          result = await ctx.runMutation(api.tracking.trackEvent, {
            siteId: data.siteId,
            sessionId: data.sessionId,
            name: data.name,
            properties: data.properties,
          });
          break;

        case "end":
          result = await ctx.runMutation(api.tracking.endSession, {
            sessionId: data.sessionId,
          });
          break;

        default:
          return new Response(
            JSON.stringify({ success: false, error: "Unknown tracking type" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
      }

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Tracking error:", error);
      return new Response(
        JSON.stringify({ success: false, error: "Internal server error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  }),
});

// Batch tracking endpoint - for sending multiple events at once
http.route({
  path: "/track/batch",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }),
});

http.route({
  path: "/track/batch",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();
      const { events } = body;

      if (!Array.isArray(events)) {
        return new Response(
          JSON.stringify({ success: false, error: "Events must be an array" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const results = [];

      for (const event of events) {
        const { type, data } = event;

        try {
          switch (type) {
            case "session":
              await ctx.runMutation(api.tracking.trackSession, {
                siteId: data.siteId,
                sessionId: data.sessionId,
                visitorId: data.visitorId,
                device: data.device || "desktop",
                browser: data.browser || "unknown",
                os: data.os || "unknown",
                country: data.country,
                referrer: data.referrer,
                referrerType: data.referrerType,
              });
              break;

            case "pageview":
              await ctx.runMutation(api.tracking.trackPageView, {
                siteId: data.siteId,
                sessionId: data.sessionId,
                path: data.path,
                referrer: data.referrer,
                utmSource: data.utmSource,
                utmMedium: data.utmMedium,
                utmCampaign: data.utmCampaign,
              });
              break;

            case "performance":
              await ctx.runMutation(api.tracking.trackPerformance, {
                siteId: data.siteId,
                sessionId: data.sessionId,
                path: data.path,
                lcp: data.lcp,
                fid: data.fid,
                cls: data.cls,
                fcp: data.fcp,
                ttfb: data.ttfb,
                loadTime: data.loadTime,
              });
              break;

            case "event":
              await ctx.runMutation(api.tracking.trackEvent, {
                siteId: data.siteId,
                sessionId: data.sessionId,
                name: data.name,
                properties: data.properties,
              });
              break;
          }
          results.push({ success: true });
        } catch {
          results.push({ success: false });
        }
      }

      return new Response(JSON.stringify({ success: true, results }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Batch tracking error:", error);
      return new Response(
        JSON.stringify({ success: false, error: "Internal server error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  }),
});

export default http;
