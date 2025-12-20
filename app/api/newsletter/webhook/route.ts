import { headers } from "next/headers";
import { Webhook } from "svix";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Resend webhook event types
type ResendWebhookEvent = {
  type: 
    | "email.sent"
    | "email.delivered"
    | "email.delivery_delayed"
    | "email.complained"
    | "email.bounced"
    | "email.opened"
    | "email.clicked";
  created_at: string;
  data: {
    created_at: string;
    email_id: string;
    from: string;
    to: string[];
    subject: string;
    click?: {
      link: string;
      timestamp: string;
    };
  };
};

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  
  // Get Svix headers for verification
  const svixId = headersList.get("svix-id");
  const svixTimestamp = headersList.get("svix-timestamp");
  const svixSignature = headersList.get("svix-signature");

  // If no Svix headers, the request is not from Resend
  if (!svixId || !svixTimestamp || !svixSignature) {
    console.error("Missing Svix headers");
    return Response.json({ error: "Missing webhook headers" }, { status: 400 });
  }

  const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;
  
  if (!webhookSecret) {
    console.error("RESEND_WEBHOOK_SECRET not configured");
    return Response.json({ error: "Webhook not configured" }, { status: 500 });
  }

  // Verify the webhook signature
  const wh = new Webhook(webhookSecret);
  let event: ResendWebhookEvent;

  try {
    event = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ResendWebhookEvent;
  } catch (err) {
    console.error("Webhook verification failed:", err);
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Handle different event types
  try {
    switch (event.type) {
      case "email.sent":
        console.log(`Email sent to ${event.data.to.join(", ")}`);
        break;

      case "email.delivered":
        console.log(`Email delivered to ${event.data.to.join(", ")}`);
        break;

      case "email.opened":
        console.log(`Email opened by ${event.data.to.join(", ")}`);
        // You could track opens in your database here
        break;

      case "email.clicked":
        console.log(`Link clicked: ${event.data.click?.link} by ${event.data.to.join(", ")}`);
        // You could track clicks in your database here
        break;

      case "email.bounced":
        console.log(`Email bounced for ${event.data.to.join(", ")}`);
        // Automatically unsubscribe bounced emails
        for (const email of event.data.to) {
          await convex.mutation(api.newsletter.unsubscribe, { email });
          console.log(`Unsubscribed bounced email: ${email}`);
        }
        break;

      case "email.complained":
        console.log(`Spam complaint from ${event.data.to.join(", ")}`);
        // Automatically unsubscribe complainers
        for (const email of event.data.to) {
          await convex.mutation(api.newsletter.unsubscribe, { email });
          console.log(`Unsubscribed complainer: ${email}`);
        }
        break;

      case "email.delivery_delayed":
        console.log(`Delivery delayed for ${event.data.to.join(", ")}`);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return Response.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
