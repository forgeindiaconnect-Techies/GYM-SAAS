import https from 'https';

export const sendOtpEmail = async (toEmail: string, otp: string): Promise<boolean> => {
  const rawKey = process.env.BREVO_API_KEY || '';
  // Sanitize string to prevent "Invalid character in header content" errors
  const apiKey = rawKey.trim().replace(/[\r\n\t\f\v"']/g, '');
  const senderEmail = (process.env.BREVO_SENDER_EMAIL || 'renugopal603@gmail.com').trim().replace(/[\r\n\t\f\v"']/g, '');
  const senderName = (process.env.BREVO_SENDER_NAME || 'Gymora').trim().replace(/[\r\n\t\f\v"']/g, '');

  if (!apiKey) {
    console.error('[EmailService] BREVO_API_KEY is not set in environment variables');
    return false;
  }

  const htmlContent = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #E2E8F0; border-radius: 16px; background-color: #FFFFFF;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #F97316; margin: 0; font-size: 28px; font-weight: 800;">Gymora</h1>
        <p style="color: #64748B; font-size: 14px; margin-top: 4px;">Smart Gym Management Platform</p>
      </div>

      <div style="background-color: #FFF7ED; border: 1px solid #FFEDD5; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
        <h2 style="color: #1E293B; margin-top: 0; font-size: 18px;">Email Verification Code</h2>
        <p style="color: #475569; font-size: 14px; margin-bottom: 16px;">Use the following 6-digit One-Time Password (OTP) to complete your verification:</p>
        <div style="display: inline-block; background-color: #F97316; color: #FFFFFF; font-size: 32px; font-weight: 800; letter-spacing: 6px; padding: 12px 32px; border-radius: 10px; margin: 8px 0;">
          ${otp}
        </div>
        <p style="color: #94A3B8; font-size: 12px; margin-top: 16px;">This OTP is valid for 10 minutes. Do not share this code with anyone.</p>
      </div>

      <div style="color: #94A3B8; font-size: 12px; text-align: center; border-top: 1px solid #F1F5F9; padding-top: 16px;">
        If you did not request this code, please ignore this email.<br/>
        &copy; ${new Date().getFullYear()} Gymora Platform. All rights reserved.
      </div>
    </div>
  `;

  const payload = JSON.stringify({
    sender: { name: senderName, email: senderEmail },
    to: [{ email: toEmail }],
    subject: `${otp} is your Gymora verification code`,
    htmlContent: htmlContent
  });

  return new Promise((resolve) => {
    try {
      const options = {
        hostname: 'api.brevo.com',
        path: '/v3/smtp/email',
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': apiKey,
          'content-type': 'application/json',
          'content-length': Buffer.byteLength(payload)
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            console.log(`[EmailService] OTP Email sent successfully to ${toEmail}`);
            resolve(true);
          } else {
            console.error(`[EmailService] Failed to send email. Status: ${res.statusCode}, Body: ${data}`);
            resolve(false);
          }
        });
      });

      req.on('error', (err) => {
        console.error(`[EmailService] Request error: ${err.message}`);
        resolve(false);
      });

      req.write(payload);
      req.end();
    } catch (err: any) {
      console.error(`[EmailService] Header/Connection error: ${err.message}`);
      resolve(false);
    }
  });
};

export const sendGymOwnerInvitationEmail = async (
  toEmail: string,
  ownerName: string,
  inviteLink: string,
  expiry: string = '1 Day'
): Promise<{ success: boolean; message?: string; error?: string }> => {
  const rawKey = process.env.BREVO_API_KEY || '';
  const apiKey = rawKey.trim().replace(/[\r\n\t\f\v"']/g, '');
  const senderEmail = (process.env.BREVO_SENDER_EMAIL || 'renugopal603@gmail.com').trim().replace(/[\r\n\t\f\v"']/g, '');
  const senderName = (process.env.BREVO_SENDER_NAME || 'Gymora').trim().replace(/[\r\n\t\f\v"']/g, '');

  if (!apiKey) {
    console.error('[EmailService] BREVO_API_KEY is not set in environment variables');
    return { success: false, error: 'BREVO_API_KEY is not set in environment variables' };
  }

  const htmlContent = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 28px; border: 1px solid #E2E8F0; border-radius: 16px; background-color: #FFFFFF;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #F97316; margin: 0; font-size: 28px; font-weight: 800;">Gymora</h1>
        <p style="color: #64748B; font-size: 14px; margin-top: 4px;">Smart Gym Management Platform</p>
      </div>

      <div style="background-color: #FFF7ED; border: 1px solid #FFEDD5; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
        <h2 style="color: #1E293B; margin-top: 0; font-size: 20px;">You're Invited to Register Your Gym!</h2>
        <p style="color: #475569; font-size: 15px; margin-bottom: 20px; line-height: 1.6;">
          Hello <strong>${ownerName || 'Gym Partner'}</strong>,<br/>
          You have been personally invited to register and manage your gym on our AI-powered gym management platform.
        </p>

        <a href="${inviteLink}" style="display: inline-block; background-color: #F97316; color: #FFFFFF; font-size: 16px; font-weight: 700; text-decoration: none; padding: 14px 32px; border-radius: 10px; margin: 12px 0; box-shadow: 0 4px 12px rgba(249, 115, 22, 0.35);">
          Complete Gym Registration &rarr;
        </a>

        <p style="color: #64748B; font-size: 13px; margin-top: 20px; line-height: 1.5;">
          Or copy and paste this link into your browser:<br/>
          <a href="${inviteLink}" style="color: #F97316; word-break: break-all; font-size: 12px;">${inviteLink}</a>
        </p>
        
        <p style="color: #94A3B8; font-size: 12px; margin-top: 18px;">
          ⏳ This invitation link expires in <strong>${expiry}</strong>.
        </p>
      </div>

      <div style="color: #94A3B8; font-size: 12px; text-align: center; border-top: 1px solid #F1F5F9; padding-top: 16px;">
        If you did not expect this invitation, you can safely ignore this email.<br/>
        &copy; ${new Date().getFullYear()} Gymora Platform. All rights reserved.
      </div>
    </div>
  `;

  const payload = JSON.stringify({
    sender: { name: senderName, email: senderEmail },
    to: [{ email: toEmail, name: ownerName || undefined }],
    subject: `Invitation to Register Your Gym on Gymora Platform`,
    htmlContent: htmlContent
  });

  return new Promise((resolve) => {
    try {
      const options = {
        hostname: 'api.brevo.com',
        path: '/v3/smtp/email',
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': apiKey,
          'content-type': 'application/json',
          'content-length': Buffer.byteLength(payload)
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            console.log(`[EmailService] Gym Owner Invitation Email sent successfully to ${toEmail}`);
            resolve({ success: true, message: 'Email sent successfully' });
          } else {
            let errorMsg = `HTTP ${res.statusCode}: ${data}`;
            try {
              const parsed = JSON.parse(data);
              if (parsed.message) errorMsg = parsed.message;
            } catch (_) {}
            console.error(`[EmailService] Failed to send invitation email. Status: ${res.statusCode}, Body: ${data}`);
            resolve({ success: false, error: errorMsg });
          }
        });
      });

      req.on('error', (err) => {
        console.error(`[EmailService] Request error: ${err.message}`);
        resolve({ success: false, error: err.message });
      });

      req.write(payload);
      req.end();
    } catch (err: any) {
      console.error(`[EmailService] Header/Connection error: ${err.message}`);
      resolve({ success: false, error: err.message });
    }
  });
};

export const sendGymOwnerExpiryWarningEmail = async (
  toEmail: string,
  ownerName: string,
  inviteLink: string,
  timeLeftText: string = '1 hour'
): Promise<{ success: boolean; message?: string; error?: string }> => {
  const rawKey = process.env.BREVO_API_KEY || '';
  const apiKey = rawKey.trim().replace(/[\r\n\t\f\v"']/g, '');
  const senderEmail = (process.env.BREVO_SENDER_EMAIL || 'renugopal603@gmail.com').trim().replace(/[\r\n\t\f\v"']/g, '');
  const senderName = (process.env.BREVO_SENDER_NAME || 'Gymora').trim().replace(/[\r\n\t\f\v"']/g, '');

  if (!apiKey) {
    console.error('[EmailService] BREVO_API_KEY is not set in environment variables');
    return { success: false, error: 'BREVO_API_KEY is not set in environment variables' };
  }

  const htmlContent = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 28px; border: 1px solid #E2E8F0; border-radius: 16px; background-color: #FFFFFF;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #F97316; margin: 0; font-size: 28px; font-weight: 800;">Gymora</h1>
        <p style="color: #64748B; font-size: 14px; margin-top: 4px;">Smart Gym Management Platform</p>
      </div>

      <div style="background-color: #FEF2F2; border: 1px solid #FECACA; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
        <div style="display: inline-block; background-color: #EF4444; color: #FFFFFF; font-size: 12px; font-weight: 800; padding: 4px 12px; border-radius: 9999px; text-transform: uppercase; margin-bottom: 12px;">
          URGENT: EXPIRING SOON
        </div>
        <h2 style="color: #991B1B; margin-top: 0; font-size: 22px;">Your Registration Link Will Expire Soon!</h2>
        <p style="color: #475569; font-size: 15px; margin-bottom: 20px; line-height: 1.6;">
          Hello <strong>${ownerName || 'Gym Partner'}</strong>,<br/>
          This is an urgent reminder that your gym onboarding invitation link will expire in approximately <strong>${timeLeftText}</strong>.
          Once expired, the link will no longer work and you will need to request a new invitation.
        </p>

        <a href="${inviteLink}" style="display: inline-block; background-color: #EF4444; color: #FFFFFF; font-size: 16px; font-weight: 700; text-decoration: none; padding: 14px 32px; border-radius: 10px; margin: 12px 0; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.35);">
          Complete Registration Before Expiry &rarr;
        </a>

        <p style="color: #64748B; font-size: 13px; margin-top: 20px; line-height: 1.5;">
          Direct link:<br/>
          <a href="${inviteLink}" style="color: #EF4444; word-break: break-all; font-size: 12px;">${inviteLink}</a>
        </p>
      </div>

      <div style="color: #94A3B8; font-size: 12px; text-align: center; border-top: 1px solid #F1F5F9; padding-top: 16px;">
        &copy; ${new Date().getFullYear()} Gymora Platform. All rights reserved.
      </div>
    </div>
  `;

  const payload = JSON.stringify({
    sender: { name: senderName, email: senderEmail },
    to: [{ email: toEmail, name: ownerName || undefined }],
    subject: `⚠️ URGENT: Your Gymora Registration Link Will Expire Soon (${timeLeftText} left)`,
    htmlContent: htmlContent
  });

  return new Promise((resolve) => {
    try {
      const options = {
        hostname: 'api.brevo.com',
        path: '/v3/smtp/email',
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': apiKey,
          'content-type': 'application/json',
          'content-length': Buffer.byteLength(payload)
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            console.log(`[EmailService] Expiry Warning Email sent successfully to ${toEmail}`);
            resolve({ success: true, message: 'Expiry warning email sent successfully' });
          } else {
            let errorMsg = `HTTP ${res.statusCode}: ${data}`;
            try {
              const parsed = JSON.parse(data);
              if (parsed.message) errorMsg = parsed.message;
            } catch (_) {}
            console.error(`[EmailService] Failed to send expiry warning email: ${errorMsg}`);
            resolve({ success: false, error: errorMsg });
          }
        });
      });

      req.on('error', (err) => {
        console.error(`[EmailService] Request error: ${err.message}`);
        resolve({ success: false, error: err.message });
      });

      req.write(payload);
      req.end();
    } catch (err: any) {
      console.error(`[EmailService] Header/Connection error: ${err.message}`);
      resolve({ success: false, error: err.message });
    }
  });
};

