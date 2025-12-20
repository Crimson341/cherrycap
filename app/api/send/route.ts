import { ajEmailForm } from "@/lib/arcjet";

const WEB3FORMS_ACCESS_KEY = "0e7f4172-cdfa-4310-b80f-ee8bf073062a";

export async function POST(request: Request) {
  try {
    // Clone the request so we can read the body twice
    const clonedRequest = request.clone();
    const body = await clonedRequest.json();
    const { firstName, lastName, email, subject, message } = body;

    // Validate required fields
    if (!firstName || !email || !subject || !message) {
      return Response.json(
        { error: "Please fill in all required fields" },
        { status: 400 }
      );
    }

    // Arcjet protection with email validation
    const decision = await ajEmailForm.protect(request, {
      requested: 1,
      email: email,
    });

    if (decision.isDenied()) {
      // Provide user-friendly error messages based on denial reason
      let errorMessage = "Request blocked";
      
      if (decision.reason.isEmail?.()) {
        errorMessage = "Please provide a valid email address";
      } else if (decision.reason.isRateLimit?.()) {
        errorMessage = "Too many requests. Please try again later";
      } else if (decision.reason.isBot?.()) {
        errorMessage = "Automated requests are not allowed";
      }
      
      return Response.json(
        { error: errorMessage, reason: decision.reason },
        { status: 403 }
      );
    }

    // Forward to Web3Forms after Arcjet validation passes
    const web3Response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        access_key: WEB3FORMS_ACCESS_KEY,
        name: `${firstName} ${lastName}`.trim(),
        email: email,
        subject: subject,
        message: message,
        from_name: "CherryCap Contact Form",
      }),
    });

    const data = await web3Response.json();

    if (!data.success) {
      console.error("Web3Forms error:", data);
      return Response.json(
        { error: "Failed to send message. Please try again." },
        { status: 500 }
      );
    }

    return Response.json({ success: true, message: "Message sent successfully" });
  } catch (error) {
    console.error("Contact form error:", error);
    return Response.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}
