import * as React from "react";

interface NewsletterWelcomeEmailProps {
  email?: string;
  firstName?: string;
}

export function NewsletterWelcomeEmail({ email, firstName }: NewsletterWelcomeEmailProps) {
  return (
    <div style={{ fontFamily: "Arial, sans-serif", padding: "20px" }}>
      <h1>Welcome to CherryCap{firstName ? `, ${firstName}` : ""}!</h1>
      <p>Thanks for subscribing to our newsletter{email ? ` (${email})` : ""}!</p>
      <p>We will keep you updated with the latest news and features.</p>
      <p>Best,<br />The CherryCap Team</p>
    </div>
  );
}
