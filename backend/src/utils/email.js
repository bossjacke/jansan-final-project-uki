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
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('Email credentials not configured (EMAIL_USER/EMAIL_PASS). Skipping email send.');
    // In development, we don't throw — log the message so developer can copy the reset link from logs.
    console.log('Email payload:', { to, subject, text, html });
    return;
  }

  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to,
    subject,
    text,
    html,
  };

  return transporter.sendMail(mailOptions);
};

export default sendEmail;
