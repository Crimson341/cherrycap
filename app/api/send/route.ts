import { ajEmailForm } from "@/lib/arcjet";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
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

    // Send with Resend
    const data = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "CherryCap <onboarding@resend.dev>",
      to: [process.env.RESEND_TO_EMAIL || "hello@cherrycap.com"],
      subject: `New Contact Form Submission: ${subject}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${firstName} ${lastName || ""}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <h3>Message:</h3>
        <p>${message.replace(/\n/g, "<br>")}</p>
      `,
      replyTo: email,
    });

    if (data.error) {
      console.error("Resend error:", data.error);
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
