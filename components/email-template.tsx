interface EmailTemplateProps {
  firstName: string;
}

export function EmailTemplate({ firstName }: EmailTemplateProps) {
  return (
    <div>
      <h1>Welcome, {firstName}!</h1>
    </div>
  );
}

interface ContactEmailTemplateProps {
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  message: string;
}

export function ContactEmailTemplate({ 
  firstName, 
  lastName, 
  email, 
  subject, 
  message 
}: ContactEmailTemplateProps) {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ backgroundColor: '#f9fafb', padding: '20px', borderRadius: '8px' }}>
        <h1 style={{ color: '#111827', marginBottom: '24px' }}>
          New Contact Form Submission
        </h1>
        
        <div style={{ marginBottom: '16px' }}>
          <strong style={{ color: '#374151' }}>From:</strong>
          <p style={{ margin: '4px 0', color: '#6b7280' }}>
            {firstName} {lastName}
          </p>
        </div>
        
        <div style={{ marginBottom: '16px' }}>
          <strong style={{ color: '#374151' }}>Email:</strong>
          <p style={{ margin: '4px 0', color: '#6b7280' }}>
            <a href={`mailto:${email}`} style={{ color: '#e11d48' }}>{email}</a>
          </p>
        </div>
        
        <div style={{ marginBottom: '16px' }}>
          <strong style={{ color: '#374151' }}>Subject:</strong>
          <p style={{ margin: '4px 0', color: '#6b7280' }}>{subject}</p>
        </div>
        
        <div style={{ marginBottom: '16px' }}>
          <strong style={{ color: '#374151' }}>Message:</strong>
          <div style={{ 
            margin: '8px 0', 
            padding: '16px', 
            backgroundColor: '#ffffff', 
            borderRadius: '4px',
            border: '1px solid #e5e7eb',
            color: '#374151',
            whiteSpace: 'pre-wrap'
          }}>
            {message}
          </div>
        </div>
        
        <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '24px 0' }} />
        
        <p style={{ color: '#9ca3af', fontSize: '12px' }}>
          This email was sent from the CherryCap contact form.
        </p>
      </div>
    </div>
  );
}
