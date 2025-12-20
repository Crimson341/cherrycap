import { NextRequest, NextResponse } from "next/server";

const WEB3FORMS_ACCESS_KEY = "0e7f4172-cdfa-4310-b80f-ee8bf073062a";

interface VerificationEmailData {
  fullName: string;
  email: string;
  phone?: string;
  businessName: string;
  businessType: string;
  industry?: string;
  website?: string;
  city?: string;
  state?: string;
  country?: string;
  description: string;
  socialLinks?: string[];
  approvalToken: string;
}

export async function POST(request: NextRequest) {
  try {
    const data: VerificationEmailData = await request.json();
    
    // Build the approval/reject URLs
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://cherrycap.com";
    const approveUrl = `${baseUrl}/api/verification/approve?token=${data.approvalToken}`;
    const rejectUrl = `${baseUrl}/api/verification/reject?token=${data.approvalToken}`;

    // Build location string
    const locationParts = [data.city, data.state, data.country].filter(Boolean);
    const location = locationParts.length > 0 ? locationParts.join(", ") : "Not provided";

    // Build social links list
    const socialLinksHtml = data.socialLinks && data.socialLinks.length > 0
      ? data.socialLinks.map(link => `• ${link}`).join("\n")
      : "None provided";

    // Create email message
    const message = `
🍒 NEW VERIFICATION REQUEST 🍒

A new user is requesting verification for their CherryCap account.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

APPLICANT DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Full Name: ${data.fullName}
Email: ${data.email}
Phone: ${data.phone || "Not provided"}

BUSINESS INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Business Name: ${data.businessName}
Type: ${data.businessType}
Industry: ${data.industry || "Not specified"}
Website: ${data.website || "Not provided"}
Location: ${location}

ABOUT THEIR BUSINESS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${data.description}

SOCIAL LINKS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${socialLinksHtml}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

QUICK ACTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ APPROVE: ${approveUrl}

❌ REJECT: ${rejectUrl}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Click the appropriate link above to approve or reject this verification request. The user will be automatically notified of your decision.
    `.trim();

    // Send via Web3Forms
    const response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        access_key: WEB3FORMS_ACCESS_KEY,
        name: data.fullName,
        email: data.email,
        subject: `🍒 Verification Request: ${data.businessName}`,
        message: message,
        from_name: "CherryCap Verification System",
      }),
    });

    const result = await response.json();

    if (!result.success) {
      console.error("Web3Forms error:", result);
      return NextResponse.json(
        { error: "Failed to send verification email" },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: "Verification request email sent" 
    });
  } catch (error) {
    console.error("Verification email error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
