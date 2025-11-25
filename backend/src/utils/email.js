import nodemailer from 'nodemailer';

// Reads SMTP config from env vars. For Gmail you can set:
// EMAIL_SERVICE=gmail
// EMAIL_USER=your@gmail.com
// EMAIL_PASS=app-password

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async ({ to, subject, text, html }) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || 
      process.env.EMAIL_USER === 'your-email@gmail.com' || 
      process.env.EMAIL_PASS === 'your-email-app-password') {
    console.warn('Email credentials not configured (EMAIL_USER/EMAIL_PASS). Skipping email send.');
    // In development, we don't throw — log the message so developer can copy the reset link from logs.
    console.log('=== EMAIL NOT CONFIGURED ===');
    console.log('To:', to);
    console.log('Subject:', subject);
    console.log('Message:', text);
    console.log('===========================');
    // Return success to avoid breaking the password reset flow
    return { messageId: 'dev-mode-no-email' };
  }

  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to,
    subject,
    text,
    html: html || generateBasicHTML(subject, text),
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully to:', to);
    return result;
  } catch (error) {
    console.error('❌ Failed to send email:', error);
    throw error;
  }
};

// Generate basic HTML for emails when no custom HTML is provided
const generateBasicHTML = (subject, text) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f4f4f4;
        }
        .container {
          background-color: #ffffff;
          padding: 30px;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: #10b981;
        }
        .otp-code {
          background-color: #f3f4f6;
          border: 2px dashed #10b981;
          border-radius: 8px;
          padding: 20px;
          text-align: center;
          margin: 20px 0;
        }
        .otp-number {
          font-size: 32px;
          font-weight: bold;
          color: #10b981;
          letter-spacing: 5px;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          font-size: 12px;
          color: #6b7280;
        }
        .warning {
          background-color: #fef3c7;
          border-left: 4px solid #f59e0b;
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">🛍️ Jansan E-commerce</div>
        </div>
        
        ${text.includes('OTP') ? `
          <h2>🔐 Password Reset Request</h2>
          <p>You requested to reset your password for your Jansan E-commerce account.</p>
          
          <div class="otp-code">
            <p style="margin: 0 0 10px 0; font-weight: bold;">Your OTP Code:</p>
            <div class="otp-number">${text.match(/\d{6}/)?.[0] || '------'}</div>
          </div>
          
          <div class="warning">
            <strong>⚠️ Important:</strong>
            <ul style="margin: 10px 0; padding-left: 20px;">
              <li>This OTP expires in 10 minutes</li>
              <li>Never share this code with anyone</li>
              <li>If you didn't request this, please ignore this email</li>
            </ul>
          </div>
        ` : `
          <div style="white-space: pre-line;">${text}</div>
        `}
        
        <div class="footer">
          <p>© 2024 Jansan E-commerce. All rights reserved.</p>
          <p>This is an automated message, please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export default sendEmail;
