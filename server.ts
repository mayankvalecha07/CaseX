import express from 'express';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory record storing only hashed OTP with security constraints
interface StoredOtpRecord {
  hashedOtp: string;
  salt: string;
  email: string;
  createdAt: number;
  expiresAt: number;
  lastSentAt: number;
  attempts: number;
  userData?: {
    name?: string;
    badgeNumber?: string;
    department?: string;
  };
}

const otpStore = new Map<string, StoredOtpRecord>();

// Helper to configure real SMTP Transporter
function getEmailTransporter() {
  const gmailUser = process.env.GMAIL_USER?.trim();
  const gmailAppPassword = process.env.GMAIL_APP_PASSWORD?.trim();
  const smtpHost = process.env.SMTP_HOST?.trim();
  const smtpUser = process.env.SMTP_USER?.trim();
  const smtpPass = process.env.SMTP_PASS?.trim();
  const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 465;
  const smtpSecure =
    process.env.SMTP_SECURE !== undefined
      ? process.env.SMTP_SECURE === 'true'
      : smtpPort === 465;

  const defaultFrom =
    process.env.EMAIL_FROM ||
    (gmailUser ? `"CaseX Forensics" <${gmailUser}>` : `"CaseX Forensics" <auth@casex.gov>`);

  // Option 1: Gmail with App Password
  if (gmailUser && gmailAppPassword) {
    const transporter = nodemailer.createTransport({
      host: smtpHost || 'smtp.gmail.com',
      port: smtpPort || 465,
      secure: smtpSecure,
      auth: {
        user: gmailUser,
        pass: gmailAppPassword
      }
    });
    return { transporter, from: defaultFrom, type: 'GMAIL_SMTP', user: gmailUser };
  }

  // Option 2: Generic SMTP
  if (smtpHost && smtpUser && smtpPass) {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    });
    return { transporter, from: defaultFrom, type: 'CUSTOM_SMTP', user: smtpUser };
  }

  return null;
}

// Generate Classified CaseX HTML Email Template
function generateOtpEmailHtml(data: {
  otp: string;
  name?: string;
  email: string;
  expiryMinutes: number;
}) {
  const { otp, name, email, expiryMinutes } = data;
  const greeting = name ? `Investigator ${name}` : 'Authorized Investigator';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CaseX Forensic Verification Code</title>
</head>
<body style="margin: 0; padding: 0; background-color: #030712; color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #030712; padding: 36px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 580px; background-color: #0a0f1d; border: 1px solid rgba(6, 182, 212, 0.4); border-radius: 16px; overflow: hidden; box-shadow: 0 20px 50px rgba(0, 0, 0, 0.9);">
          
          <!-- Header Banner -->
          <tr>
            <td style="padding: 28px 32px; background: linear-gradient(180deg, #111e38 0%, #0a0f1d 100%); border-bottom: 1px solid rgba(6, 182, 212, 0.2);">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <div style="font-size: 24px; font-weight: 900; letter-spacing: 3px; color: #ffffff; text-transform: uppercase;">
                      CASE<span style="color: #06b6d4;">X</span>
                    </div>
                    <div style="font-size: 11px; font-family: 'Courier New', monospace; letter-spacing: 1.5px; color: #38bdf8; margin-top: 5px; text-transform: uppercase; font-weight: 600;">
                      Digital Crime Scene Investigation Platform
                    </div>
                  </td>
                  <td align="right" valign="top">
                    <span style="display: inline-block; padding: 5px 12px; background-color: rgba(6, 182, 212, 0.12); border: 1px solid rgba(6, 182, 212, 0.5); border-radius: 6px; font-size: 10px; font-family: 'Courier New', monospace; color: #38bdf8; font-weight: bold; letter-spacing: 1px;">
                      CLASSIFIED // 2FA
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 36px 32px;">
              <h2 style="margin: 0 0 14px; font-size: 18px; font-weight: 700; color: #ffffff; letter-spacing: 0.5px;">
                SECURITY ACCESS AUTHORIZATION
              </h2>
              <p style="margin: 0 0 22px; font-size: 14px; line-height: 1.6; color: #94a3b8;">
                Greetings <strong style="color: #f8fafc;">${greeting}</strong>. A verification request has been initiated for access to CaseX digital evidence dossiers associated with (<code style="color: #38bdf8; background-color: rgba(6, 182, 212, 0.1); padding: 3px 7px; border-radius: 4px; border: 1px solid rgba(6,182,212,0.2);">${email}</code>).
              </p>

              <!-- OTP Code Display Box -->
              <table role="presentation" width="100%" style="background-color: #030712; border: 1px solid rgba(6, 182, 212, 0.5); border-radius: 12px; margin: 26px 0;">
                <tr>
                  <td align="center" style="padding: 26px 20px;">
                    <div style="font-size: 11px; font-family: 'Courier New', monospace; letter-spacing: 2px; color: #06b6d4; text-transform: uppercase; margin-bottom: 10px; font-weight: bold;">
                      YOUR ONE-TIME VERIFICATION CODE
                    </div>
                    <div style="font-size: 38px; font-weight: 800; letter-spacing: 12px; color: #38bdf8; font-family: 'Courier New', Courier, monospace; text-shadow: 0 0 20px rgba(6, 182, 212, 0.6); padding-left: 12px;">
                      ${otp}
                    </div>
                    <div style="font-size: 11px; color: #64748b; margin-top: 12px; font-family: 'Courier New', monospace; font-weight: 600;">
                      VALID FOR ${expiryMinutes} MINUTES // SINGLE-USE ONLY
                    </div>
                  </td>
                </tr>
              </table>

              <p style="margin: 22px 0 0; font-size: 13px; line-height: 1.6; color: #94a3b8;">
                Enter this code into the CaseX terminal to verify your identity and unlock full case records, 3D interactive crime scenes, ballistics data, and forensic logs.
              </p>

              <!-- Security Notice Warning -->
              <div style="margin-top: 28px; padding: 16px 18px; background-color: rgba(225, 29, 72, 0.08); border-left: 4px solid #f43f5e; border-radius: 6px;">
                <p style="margin: 0; font-size: 11px; font-family: 'Courier New', monospace; color: #fecdd3; line-height: 1.6;">
                  <strong>SECURITY WARNING:</strong> Never disclose this verification code to anyone. CaseX staff will never ask for your code. If you did not initiate this request, unauthorized access may have been attempted.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 22px 32px; background-color: #050914; border-top: 1px solid rgba(255, 255, 255, 0.06); text-align: center;">
              <p style="margin: 0; font-size: 11px; font-family: 'Courier New', monospace; color: #64748b; line-height: 1.5;">
                CASEX DIGITAL CRIME SCENE INVESTIGATION PLATFORM<br>
                Official Case Management Protocol &copy; ${new Date().getFullYear()} CaseX Forensics Network
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

// -------------------------------------------------------------
// API ROUTES
// -------------------------------------------------------------

// Check status of email configuration
app.get('/api/auth/email-config-status', (req, res) => {
  const mailConfig = getEmailTransporter();
  res.json({
    configured: !!mailConfig,
    transportType: mailConfig ? mailConfig.type : 'UNCONFIGURED',
    sender: mailConfig ? mailConfig.from : null
  });
});

// Endpoint: Send OTP to User's Email (POST /api/auth/send-otp)
app.post('/api/auth/send-otp', async (req, res) => {
  try {
    const { email, name, badgeNumber, department } = req.body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid official email address.'
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const now = Date.now();

    // 1. Check for 60-second resend cooldown
    const existingRecord = otpStore.get(cleanEmail);
    if (existingRecord) {
      const elapsedSeconds = Math.floor((now - existingRecord.lastSentAt) / 1000);
      const cooldownLimit = 60;
      if (elapsedSeconds < cooldownLimit) {
        const remainingCooldown = cooldownLimit - elapsedSeconds;
        return res.status(429).json({
          success: false,
          error: `Please wait ${remainingCooldown} second${remainingCooldown === 1 ? '' : 's'} before requesting another verification code.`
        });
      }
    }

    // 2. Check SMTP Transporter configuration
    const mailConfig = getEmailTransporter();
    if (!mailConfig) {
      console.error('[CaseX Mailer] SMTP credentials not configured. GMAIL_USER or SMTP_HOST missing.');
      return res.status(503).json({
        success: false,
        error:
          'Email service is not configured. Please set GMAIL_USER and GMAIL_APP_PASSWORD (or SMTP credentials) in your environment settings to receive OTP emails.'
      });
    }

    // 3. Generate Cryptographically Secure 6-digit OTP
    const otpNumber = crypto.randomInt(100000, 1000000);
    const otp = otpNumber.toString();
    const expiryMinutes = 10;
    const expiresAt = now + expiryMinutes * 60 * 1000;

    // 4. Hash the OTP using SHA-256 with a unique salt
    const salt = crypto.randomBytes(16).toString('hex');
    const hashedOtp = crypto
      .createHash('sha256')
      .update(cleanEmail + otp + salt)
      .digest('hex');

    // 5. Store ONLY the hashed OTP on the server
    otpStore.set(cleanEmail, {
      hashedOtp,
      salt,
      email: cleanEmail,
      createdAt: now,
      expiresAt,
      lastSentAt: now,
      attempts: 0,
      userData: {
        name,
        badgeNumber,
        department
      }
    });

    // 6. Send OTP via Nodemailer
    const emailHtml = generateOtpEmailHtml({
      otp,
      name,
      email: cleanEmail,
      expiryMinutes
    });

    const emailSubject = `CaseX Verification Code: ${otp}`;

    try {
      console.log(`[CaseX Mailer] Transmitting verification email via ${mailConfig.type} to: ${cleanEmail}`);
      await mailConfig.transporter.sendMail({
        from: mailConfig.from,
        to: cleanEmail,
        subject: emailSubject,
        html: emailHtml,
        text: `CASEX - Digital Crime Scene Investigation Platform\n\nYour verification code is: ${otp}\n\nThis code is valid for ${expiryMinutes} minutes.\nNever share this code with anyone.`
      });
      console.log(`[CaseX Mailer] Verification email successfully delivered to: ${cleanEmail}`);
    } catch (smtpErr: any) {
      console.error('[CaseX Mailer] SMTP Transmission Error:', smtpErr.message || smtpErr);
      // Remove stored OTP if delivery failed
      otpStore.delete(cleanEmail);
      return res.status(500).json({
        success: false,
        error: `Failed to deliver email: ${smtpErr.message || 'SMTP transmission error. Verify your Gmail App Password and SMTP settings.'}`
      });
    }

    // 7. Return success response (NEVER return the OTP)
    return res.json({
      success: true,
      message: `Verification code sent to ${cleanEmail}. Check your inbox and spam folders.`,
      expiresInSeconds: expiryMinutes * 60,
      cooldownSeconds: 60
    });
  } catch (error: any) {
    console.error('[CaseX Mailer] Unexpected error in /api/auth/send-otp:', error.message || error);
    return res.status(500).json({
      success: false,
      error: 'An internal error occurred while dispatching verification code.'
    });
  }
});

// Endpoint: Verify OTP from User (POST /api/auth/verify-otp)
app.post('/api/auth/verify-otp', (req, res) => {
  try {
    const { email, otp, name, badgeNumber, department } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        error: 'Email and 6-digit verification code are required.'
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otp.toString().trim().replace(/\D/g, '');

    if (cleanOtp.length !== 6) {
      return res.status(400).json({
        success: false,
        error: 'Please enter a valid 6-digit numeric verification code.'
      });
    }

    const record = otpStore.get(cleanEmail);

    if (!record) {
      return res.status(400).json({
        success: false,
        error: 'No active verification session found for this email. Please request a new code.'
      });
    }

    // Check expiration (10 minutes)
    if (Date.now() > record.expiresAt) {
      otpStore.delete(cleanEmail);
      return res.status(400).json({
        success: false,
        error: 'Verification code has expired. Please click "Resend Code" to receive a fresh code.'
      });
    }

    // Check attempt limit (max 5 attempts)
    if (record.attempts >= 5) {
      otpStore.delete(cleanEmail);
      return res.status(429).json({
        success: false,
        error: 'Maximum verification attempts exceeded. Security session locked. Please request a new code.'
      });
    }

    // Verify hashed OTP
    const computedHash = crypto
      .createHash('sha256')
      .update(cleanEmail + cleanOtp + record.salt)
      .digest('hex');

    if (computedHash !== record.hashedOtp) {
      record.attempts += 1;
      const remainingAttempts = 5 - record.attempts;

      if (remainingAttempts <= 0) {
        otpStore.delete(cleanEmail);
        return res.status(429).json({
          success: false,
          error: 'Too many incorrect attempts. Session invalidated. Please request a new code.'
        });
      }

      return res.status(400).json({
        success: false,
        error: `Invalid verification code. ${remainingAttempts} attempt${remainingAttempts === 1 ? '' : 's'} remaining.`
      });
    }

    // OTP is valid! Consume and remove from store
    const resolvedName = name || record.userData?.name || 'Investigator';
    const resolvedBadge = badgeNumber || record.userData?.badgeNumber || `DET-${Math.floor(1000 + Math.random() * 9000)}`;
    const resolvedDept = department || record.userData?.department || 'Cyber & Special Crimes Division';

    otpStore.delete(cleanEmail);

    const userProfile = {
      id: `inv-${Date.now().toString(36)}`,
      name: resolvedName,
      email: cleanEmail,
      role: 'Special Agent / Lead Investigator',
      clearanceLevel: 'LEVEL 4 // TOP SECRET',
      badgeNumber: resolvedBadge,
      department: resolvedDept,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
      activeCaseId: 'CASE-2024-001',
      assignedCasesCount: 4,
      solvedCasesCount: 12
    };

    return res.json({
      success: true,
      message: 'Authorization verified successfully.',
      user: userProfile
    });
  } catch (error: any) {
    console.error('[CaseX Mailer] Unexpected error in /api/auth/verify-otp:', error.message || error);
    return res.status(500).json({
      success: false,
      error: 'An internal error occurred while verifying the security code.'
    });
  }
});

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Cache to prevent duplicate case resolution emails within 30 seconds
const resolutionEmailTracker = new Map<string, number>();

// Endpoint: Send Case Resolution Notification Email (POST /api/cases/send-resolution-email)
app.post('/api/cases/send-resolution-email', async (req, res) => {
  try {
    const { caseId, caseTitle, resolutionSummary, resolvedBy, recipientEmail, resolutionDate } = req.body;

    if (!caseId || !caseTitle) {
      return res.status(400).json({
        success: false,
        error: 'Case ID and Case Title are required to dispatch resolution email.'
      });
    }

    const cleanCaseId = String(caseId).trim();
    const now = Date.now();
    const lastSent = resolutionEmailTracker.get(cleanCaseId);
    if (lastSent && now - lastSent < 30000) {
      const waitSec = Math.ceil((30000 - (now - lastSent)) / 1000);
      return res.status(429).json({
        success: false,
        error: `Resolution email for case ${cleanCaseId} was dispatched recently. Please wait ${waitSec}s to resend.`
      });
    }

    const mailConfig = getEmailTransporter();
    if (!mailConfig) {
      return res.status(503).json({
        success: false,
        configured: false,
        error: 'Email service is unconfigured. Configure GMAIL_USER and GMAIL_APP_PASSWORD (or SMTP credentials) in server environment settings.'
      });
    }

    const targetEmail = (recipientEmail && typeof recipientEmail === 'string' && recipientEmail.includes('@'))
      ? recipientEmail.trim()
      : (process.env.NOTIFICATION_EMAIL || process.env.GMAIL_USER || 'hq@casex.gov');

    const formattedDate = resolutionDate || new Date().toISOString().split('T')[0];
    const investigatorName = resolvedBy || 'Lead Investigator';
    const summary = resolutionSummary || 'The investigation has successfully concluded all judicial evidentiary requirements and judicial warrant verification.';

    const emailSubject = `Case Resolved — CaseX [${cleanCaseId}]`;
    const emailHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Case Resolved — CaseX</title>
</head>
<body style="margin: 0; padding: 0; background-color: #030712; color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #030712; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #0a0f1d; border: 1px solid rgba(16, 185, 129, 0.4); border-radius: 14px; overflow: hidden; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.85);">
          <!-- Header -->
          <tr>
            <td style="padding: 24px 30px; background: linear-gradient(180deg, #064e3b 0%, #0a0f1d 100%); border-bottom: 1px solid rgba(16, 185, 129, 0.3);">
              <table role="presentation" width="100%">
                <tr>
                  <td>
                    <div style="font-size: 22px; font-weight: 900; letter-spacing: 2px; color: #ffffff; text-transform: uppercase;">
                      CASE<span style="color: #10b981;">X</span> FORENSIC COMMAND
                    </div>
                    <div style="font-size: 11px; font-family: 'Courier New', monospace; letter-spacing: 1.5px; color: #6ee7b7; margin-top: 4px;">
                      OFFICIAL INVESTIGATION RESOLUTION NOTICE
                    </div>
                  </td>
                  <td align="right" valign="top">
                    <span style="display: inline-block; padding: 4px 10px; background-color: rgba(16, 185, 129, 0.15); border: 1px solid #10b981; border-radius: 6px; font-size: 10px; font-family: 'Courier New', monospace; color: #6ee7b7; font-weight: bold;">
                      STATUS // SOLVED
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 30px;">
              <h2 style="margin: 0 0 10px; font-size: 18px; color: #ffffff;">
                Case Dossier Successfully Closed
              </h2>
              <p style="margin: 0 0 20px; font-size: 13px; color: #94a3b8; line-height: 1.6;">
                This transmission confirms that <strong>${cleanCaseId}: ${caseTitle}</strong> has officially been marked <strong>SOLVED</strong> by <strong>${investigatorName}</strong> on <strong>${formattedDate}</strong>.
              </p>

              <!-- Dossier Details Table -->
              <table role="presentation" width="100%" style="background-color: #030712; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; margin-bottom: 20px;">
                <tr>
                  <td style="padding: 12px 16px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); font-size: 11px; font-family: 'Courier New', monospace; color: #64748b; width: 35%;">CASE DOSSIER ID</td>
                  <td style="padding: 12px 16px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); font-size: 12px; font-family: 'Courier New', monospace; color: #38bdf8; font-weight: bold;">${cleanCaseId}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); font-size: 11px; font-family: 'Courier New', monospace; color: #64748b;">CASE TITLE</td>
                  <td style="padding: 12px 16px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); font-size: 12px; color: #ffffff; font-weight: bold;">${caseTitle}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); font-size: 11px; font-family: 'Courier New', monospace; color: #64748b;">RESOLUTION DATE</td>
                  <td style="padding: 12px 16px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); font-size: 12px; color: #e2e8f0;">${formattedDate}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; font-size: 11px; font-family: 'Courier New', monospace; color: #64748b;">LEAD INVESTIGATOR</td>
                  <td style="padding: 12px 16px; font-size: 12px; color: #e2e8f0;">${investigatorName}</td>
                </tr>
              </table>

              <!-- Resolution Summary Box -->
              <div style="background-color: rgba(16, 185, 129, 0.06); border-left: 3px solid #10b981; padding: 14px 16px; border-radius: 4px; margin-bottom: 22px;">
                <div style="font-size: 11px; font-family: 'Courier New', monospace; color: #6ee7b7; font-weight: bold; margin-bottom: 6px;">
                  JUDICIAL RESOLUTION SUMMARY
                </div>
                <div style="font-size: 13px; color: #d1d5db; line-height: 1.6;">
                  ${summary}
                </div>
              </div>

              <p style="margin: 0; font-size: 12px; color: #64748b; line-height: 1.5;">
                All evidence exhibits, suspect statements, and forensic timelines have been sealed and archived in the CaseX judicial storage repository.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 16px 30px; background-color: #050914; border-top: 1px solid rgba(255, 255, 255, 0.06); text-align: center;">
              <p style="margin: 0; font-size: 10px; font-family: 'Courier New', monospace; color: #64748b;">
                CASEX DIGITAL CRIME SCENE INVESTIGATION PLATFORM &bull; NOTIFICATION SERVICE
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    await mailConfig.transporter.sendMail({
      from: mailConfig.from,
      to: targetEmail,
      subject: emailSubject,
      html: emailHtml,
      text: `CASE RESOLVED — CASEX [${cleanCaseId}]\n\nCase: ${caseTitle}\nDate: ${formattedDate}\nInvestigator: ${investigatorName}\n\nSummary:\n${summary}\n`
    });

    resolutionEmailTracker.set(cleanCaseId, now);

    return res.json({
      success: true,
      message: `Resolution notification successfully delivered to ${targetEmail}.`,
      recipient: targetEmail,
      sentAt: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('[CaseX Mailer] Unexpected error in /api/cases/send-resolution-email:', error.message || error);
    return res.status(500).json({
      success: false,
      error: `Failed to dispatch case resolution email: ${error.message || 'Transmission error'}`
    });
  }
});

// -------------------------------------------------------------
// VITE / STATIC INTEGRATION
// -------------------------------------------------------------

async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[CaseX Server] Running on http://localhost:${PORT}`);
  });
}

start();
