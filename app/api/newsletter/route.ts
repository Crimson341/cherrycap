import { ajEmailForm } from "@/lib/arcjet";
import { Resend } from "resend";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { NewsletterWelcomeEmail } from "@/components/emails/newsletter-welcome";

const resend = new Resend(process.env.RESEND_API_KEY);
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: Request) {
  try {
    const clonedRequest = request.clone();
    const body = await clonedRequest.json();
    const { email, firstName, source = "website" } = body;

    // Validate required fields
    if (!email) {
      return Response.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Arcjet protection with email validation
    const decision = await ajEmailForm.protect(request, {
      requested: 1,
      email: email,
    });

    if (decision.isDenied()) {
      let errorMessage = "Request blocked";

      if (decision.reason.isEmail?.()) {
        errorMessage = "Please provide a valid email address";
      } else if (decision.reason.isRateLimit?.()) {
        errorMessage = "Too many requests. Please try again later";
      } else if (decision.reason.isBot?.()) {
        errorMessage = "Automated requests are not allowed";
      }

      return Response.json(
        { error: errorMessage },
        { status: 403 }
      );
    }

    // Save to Convex database
    const result = await convex.mutation(api.newsletter.subscribe, {
      email: email.toLowerCase(),
      firstName: firstName || undefined,
      source,
    });

    if (!result.success) {
      // Already subscribed is not an error - just return success
      if (result.error === "Already subscribed") {
        return Response.json({
          success: true,
          message: "You're already subscribed!",
          alreadySubscribed: true,
        });
      }
      return Response.json(
        { error: result.error || "Failed to subscribe" },
        { status: 400 }
      );
    }

    // Send welcome email via Resend
    try {
      await resend.emails.send({
        // Use your verified domain, or Resend's test domain for development
        // Change to "CherryCap <newsletter@cherrycap.com>" once domain is verified
        from: process.env.RESEND_FROM_EMAIL || "CherryCap <onboarding@resend.dev>",
        to: email,
        subject: "Welcome to the CherryCap Newsletter!",
        react: NewsletterWelcomeEmail({ firstName: firstName || undefined }),
      });
    } catch (emailError) {
      // Log but don't fail the subscription if email fails
      console.error("Failed to send welcome email:", emailError);
    }

    return Response.json({
      success: true,
      message: result.reactivated
        ? "Welcome back! Your subscription has been reactivated."
        : "Thanks for subscribing!",
      reactivated: result.reactivated,
    });
  } catch (error) {
    console.error("Newsletter subscription error:", error);
    return Response.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

// Unsubscribe endpoint
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return Response.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const result = await convex.mutation(api.newsletter.unsubscribe, {
      email: email.toLowerCase(),
    });

    if (!result.success) {
      return Response.json(
        { error: result.error || "Failed to unsubscribe" },
        { status: 400 }
      );
    }

    return Response.json({
      success: true,
      message: "You have been unsubscribed.",
    });
  } catch (error) {
    console.error("Newsletter unsubscribe error:", error);
    return Response.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
