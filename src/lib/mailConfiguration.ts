"use server";
import nodemailer from "nodemailer";

interface ContactFormData {
  name: string;
  email: string;
  message: string;
  subject?: string;
}

// HTML Email Template Function
function createContactEmailTemplate({
  name,
  email,
  message,
}: ContactFormData): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Contact Form Submission</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                line-height: 1.6;
                color: #333333;
                background-color: #f4f4f4;
                padding: 20px;
            }
            
            .email-container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                border-radius: 12px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                overflow: hidden;
            }
            
            .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 30px 20px;
                text-align: center;
            }
            
            .header h1 {
                font-size: 28px;
                font-weight: 600;
                margin-bottom: 8px;
            }
            
            .header p {
                font-size: 16px;
                opacity: 0.9;
            }
            
            .content {
                padding: 40px 30px;
            }
            
            .form-section {
                margin-bottom: 30px;
            }
            
            .form-section h2 {
                color: #2d3748;
                font-size: 20px;
                margin-bottom: 20px;
                padding-bottom: 10px;
                border-bottom: 2px solid #e2e8f0;
            }
            
            .form-field {
                margin-bottom: 20px;
            }
            
            .form-label {
                display: block;
                font-weight: 600;
                color: #4a5568;
                margin-bottom: 8px;
                font-size: 14px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            .form-value {
                background-color: #f7fafc;
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                padding: 15px;
                font-size: 16px;
                color: #2d3748;
                word-wrap: break-word;
            }
            
            .message-field .form-value {
                min-height: 120px;
                white-space: pre-wrap;
            }
            
            .contact-info {
                background-color: #edf2f7;
                border-radius: 8px;
                padding: 20px;
                margin-top: 20px;
            }
            
            .contact-info h3 {
                color: #2d3748;
                margin-bottom: 10px;
                font-size: 16px;
            }
            
            .contact-info p {
                color: #718096;
                font-size: 14px;
                margin-bottom: 5px;
            }
            
            .footer {
                background-color: #2d3748;
                color: #a0aec0;
                padding: 20px;
                text-align: center;
                font-size: 14px;
            }
            
            .footer p {
                margin-bottom: 5px;
            }
            
            .timestamp {
                color: #718096;
                font-size: 12px;
                font-style: italic;
                text-align: right;
                margin-top: 20px;
                padding-top: 15px;
                border-top: 1px solid #e2e8f0;
            }
            
            @media (max-width: 600px) {
                .email-container {
                    margin: 0;
                    border-radius: 0;
                }
                
                .content {
                    padding: 30px 20px;
                }
                
                .header {
                    padding: 25px 15px;
                }
                
                .header h1 {
                    font-size: 24px;
                }
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="header">
                <h1>📩 New Contact Form Submission</h1>
                <p>You have received a new message from your website</p>
            </div>
            
            <div class="content">
                <div class="form-section">
                    <h2>Contact Details</h2>
                    
                    <div class="form-field">
                        <label class="form-label">👤 Full Name</label>
                        <div class="form-value">${name}</div>
                    </div>
                    
                    <div class="form-field">
                        <label class="form-label">📧 Email Address</label>
                        <div class="form-value">
                            <a href="mailto:${email}" style="color: #667eea; text-decoration: none;">${email}</a>
                        </div>
                    </div>
                    
                    <div class="form-field message-field">
                        <label class="form-label">💬 Message</label>
                        <div class="form-value">${message}</div>
                    </div>
                </div>
                
                <div class="contact-info">
                    <h3>📞 Quick Actions</h3>
                    <p><strong>Reply:</strong> <a href="mailto:${email}" style="color: #667eea;">Click to reply directly</a></p>
                    <p><strong>Add to contacts:</strong> ${name} &lt;${email}&gt;</p>
                </div>
                
                <div class="timestamp">
                    📅 Received on: ${new Date().toLocaleString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      timeZoneName: "short",
                    })}
                </div>
            </div>
            
            <div class="footer">
                <p><strong>Contact Form Notification</strong></p>
                <p>This email was automatically generated from your website's contact form.</p>
            </div>
        </div>
    </body>
    </html>
    `;
}

// Updated sendMail function
export async function sendMail({ name, email, message }: ContactFormData) {
  const { SMPT_HOST, SMPT_USER, SMPT_PASS } = process.env;

  const transport = nodemailer.createTransport({
    host: SMPT_HOST,
    port: 587,
    secure: false,
    auth: {
      user: SMPT_USER,
      pass: SMPT_PASS,
    },
  });

  // Generate HTML email body
  const htmlBody = createContactEmailTemplate({ name, email, message });

  // Create subject line if not provided
  const emailSubject = `New Contact Form Submission from ${name}`;

  try {
    const sendResult = await transport.sendMail({
      from: "mdtaqui.jhar@gmail.com", // Use the authenticated user as sender
      to: "mdtaqui.jhar@gmail.com",
      subject: emailSubject,
      html: htmlBody,
      text: `
New Contact Form Submission

Name: ${name}
Email: ${email}
Message: ${message}

Received on: ${new Date().toLocaleString()}
            `.trim(),
    });

    return sendResult.accepted.length > 0 ? true : false;
  } catch (error) {
    console.error("Email sending failed:", error);
    return false;
  }
}
