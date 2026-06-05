import nodemailer from 'nodemailer';
import logger from './logger';

// Load SMTP config from environment variables
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: Number(process.env.SMTP_PORT) === 465, 
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
  fromName?: string;
}

/**
 * Generic email sender that supports Resend HTTP API (if RESEND_API_KEY is defined)
 * or falls back to traditional SMTP.
 */
async function sendEmail({ to, subject, html, text, fromName = 'CoachOS' }: SendEmailParams): Promise<void> {
  const resendApiKey = process.env.RESEND_API_KEY;

  if (resendApiKey) {
    const fromEmail = process.env.MAIL_FROM || 'onboarding@resend.dev';
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: `"${fromName}" <${fromEmail}>`,
        to: [to],
        subject,
        html,
        text,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Resend API error (${response.status}): ${errorText}`);
    }

    logger.info(`[MAIL] Email sent via Resend API to ${to}`);
    return;
  }

  // Fallback to SMTP
  const mailOptions = {
    from: `"${fromName}" <${process.env.SMTP_USER}>`,
    to,
    subject,
    text,
    html,
  };

  await transporter.sendMail(mailOptions);
  logger.info(`[MAIL] Email sent via SMTP to ${to}`);
}

/**
 * Send an OTP email to the specified address.
 */
export async function sendOtpEmail(email: string, otp: string): Promise<void> {
  const subject = 'Your CoachOS verification code';
  const text = `Your verification code is ${otp}. It expires in ${process.env.OTP_EXPIRY_MINUTES || '10'} minutes.`;
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
      <h2 style="color: #4f46e5;">Welcome to CoachOS</h2>
      <p>Use the following code to complete your registration:</p>
      <div style="font-size: 24px; font-weight: bold; color: #4f46e5; background: #f5f3ff; padding: 10px; text-align: center; border-radius: 5px; margin: 20px 0;">
        ${otp}
      </div>
      <p style="color: #666; font-size: 14px;">This code expires in ${process.env.OTP_EXPIRY_MINUTES || '10'} minutes. If you didn't request this, please ignore this email.</p>
    </div>
  `;

  try {
    await sendEmail({ to: email, subject, html, text });
  } catch (err) {
    logger.error('[MAIL] Failed to send OTP email', { error: err });
    throw Object.assign(new Error('Failed to send OTP email'), { statusCode: 500, code: 'MAIL_SEND_FAILURE' });
  }
}

/**
 * Send a login OTP email to the specified address.
 */
export async function sendLoginOtpEmail(email: string, otp: string): Promise<void> {
  const subject = 'Your CoachOS login code';
  const text = `Your login code is ${otp}. It expires in ${process.env.OTP_EXPIRY_MINUTES || '10'} minutes.`;
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
      <h2 style="color: #4f46e5;">Log in to CoachOS</h2>
      <p>Use the following code to log in to your account:</p>
      <div style="font-size: 24px; font-weight: bold; color: #4f46e5; background: #f5f3ff; padding: 10px; text-align: center; border-radius: 5px; margin: 20px 0;">
        ${otp}
      </div>
      <p style="color: #666; font-size: 14px;">This code expires in ${process.env.OTP_EXPIRY_MINUTES || '10'} minutes. If you didn't request this, please ignore this email.</p>
    </div>
  `;

  try {
    await sendEmail({ to: email, subject, html, text });
  } catch (err) {
    logger.error('[MAIL] Failed to send login OTP email', { error: err });
    throw Object.assign(new Error('Failed to send login OTP email'), { statusCode: 500, code: 'MAIL_SEND_FAILURE' });
  }
}

/**
 * Send a premium custom email
 */
export async function sendCustomEmail(to: string, subject: string, content: string, title: string = 'Update from VidyaPlus'): Promise<void> {
  const html = `
    <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; padding: 40px 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);">
        <!-- Premium Header -->
        <div style="background-color: #09090b; padding: 40px; text-align: center;">
          <div style="display: inline-block; padding: 12px 24px; background-color: #10b981; border-radius: 12px; color: #ffffff; font-weight: 800; font-size: 20px; letter-spacing: -0.02em;">
            VidyaPlus
          </div>
          <h1 style="color: #ffffff; font-size: 24px; margin-top: 24px; font-weight: 700; letter-spacing: -0.025em;">${title}</h1>
        </div>
        
        <!-- Content Section -->
        <div style="padding: 40px;">
          <div style="color: #334155; font-size: 16px; line-height: 1.6; margin-bottom: 32px; font-weight: 500;">
            ${content.replace(/\n/g, '<br/>')}
          </div>
          
          <div style="padding-top: 32px; border-top: 1px solid #f1f5f9;">
            <p style="color: #64748b; font-size: 14px; margin-bottom: 8px;">Need assistance?</p>
            <a href="https://vidyaplus.com/support" style="color: #10b981; font-weight: 700; text-decoration: none; font-size: 14px;">Contact Academic Support →</a>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f8fafc; padding: 24px; text-align: center;">
          <p style="color: #94a3b8; font-size: 12px; margin: 0; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em;">
            Managed by CoachOS Technology Suite
          </p>
        </div>
      </div>
    </div>
  `;

  try {
    await sendEmail({ to, subject, html, fromName: 'VidyaPlus' });
  } catch (err) {
    logger.error('[MAIL] Failed to send custom email', { error: err });
    throw Object.assign(new Error('Failed to send email'), { statusCode: 500, code: 'MAIL_SEND_FAILURE' });
  }
}
