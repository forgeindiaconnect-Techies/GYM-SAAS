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
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #D9E2E3; border-radius: 16px; background-color: #FFFFFF;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #167D78; margin: 0; font-size: 28px; font-weight: 800;">Gymora</h1>
        <p style="color: #697778; font-size: 14px; margin-top: 4px;">Smart Gym Management Platform</p>
      </div>

      <div style="background-color: #E8EFF0; border: 1px solid #D8EAE7; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
        <h2 style="color: #344B4A; margin-top: 0; font-size: 18px;">Email Verification Code</h2>
        <p style="color: #697778; font-size: 14px; margin-bottom: 16px;">Use the following 6-digit One-Time Password (OTP) to complete your verification:</p>
        <div style="display: inline-block; background-color: #167D78; color: #FFFFFF; font-size: 32px; font-weight: 800; letter-spacing: 6px; padding: 12px 32px; border-radius: 10px; margin: 8px 0;">
          ${otp}
        </div>
        <p style="color: #697778; font-size: 12px; margin-top: 16px;">This OTP is valid for 10 minutes. Do not share this code with anyone.</p>
      </div>

      <div style="color: #697778; font-size: 12px; text-align: center; border-top: 1px solid #D9E2E3; padding-top: 16px;">
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
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 28px; border: 1px solid #D9E2E3; border-radius: 16px; background-color: #FFFFFF;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #167D78; margin: 0; font-size: 28px; font-weight: 800;">Gymora</h1>
        <p style="color: #697778; font-size: 14px; margin-top: 4px;">Smart Gym Management Platform</p>
      </div>

      <div style="background-color: #E8EFF0; border: 1px solid #D8EAE7; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
        <h2 style="color: #344B4A; margin-top: 0; font-size: 20px;">You're Invited to Register Your Gym!</h2>
        <p style="color: #697778; font-size: 15px; margin-bottom: 20px; line-height: 1.6;">
          Hello <strong>${ownerName || 'Gym Partner'}</strong>,<br/>
          You have been personally invited to register and manage your gym on our AI-powered gym management platform.
        </p>

        <a href="${inviteLink}" style="display: inline-block; background-color: #167D78; color: #FFFFFF; font-size: 16px; font-weight: 700; text-decoration: none; padding: 14px 32px; border-radius: 10px; margin: 12px 0; box-shadow: 0 4px 12px rgba(22, 125, 120, 0.35);">
          Complete Gym Registration &rarr;
        </a>

        <p style="color: #697778; font-size: 13px; margin-top: 20px; line-height: 1.5;">
          Or copy and paste this link into your browser:<br/>
          <a href="${inviteLink}" style="color: #167D78; word-break: break-all; font-size: 12px;">${inviteLink}</a>
        </p>
        
        <p style="color: #697778; font-size: 12px; margin-top: 18px;">
          ⏳ This invitation link expires in <strong>${expiry}</strong>.
        </p>
      </div>

      <div style="color: #697778; font-size: 12px; text-align: center; border-top: 1px solid #D9E2E3; padding-top: 16px;">
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
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 28px; border: 1px solid #D9E2E3; border-radius: 16px; background-color: #FFFFFF;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #167D78; margin: 0; font-size: 28px; font-weight: 800;">Gymora</h1>
        <p style="color: #697778; font-size: 14px; margin-top: 4px;">Smart Gym Management Platform</p>
      </div>

      <div style="background-color: #FEF2F2; border: 1px solid #FECACA; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
        <div style="display: inline-block; background-color: #C43D35; color: #FFFFFF; font-size: 12px; font-weight: 800; padding: 4px 12px; border-radius: 9999px; text-transform: uppercase; margin-bottom: 12px;">
          URGENT: EXPIRING SOON
        </div>
        <h2 style="color: #C43D35; margin-top: 0; font-size: 22px;">Your Registration Link Will Expire Soon!</h2>
        <p style="color: #697778; font-size: 15px; margin-bottom: 20px; line-height: 1.6;">
          Hello <strong>${ownerName || 'Gym Partner'}</strong>,<br/>
          This is an urgent reminder that your gym onboarding invitation link will expire in approximately <strong>${timeLeftText}</strong>.
          Once expired, the link will no longer work and you will need to request a new invitation.
        </p>

        <a href="${inviteLink}" style="display: inline-block; background-color: #C43D35; color: #FFFFFF; font-size: 16px; font-weight: 700; text-decoration: none; padding: 14px 32px; border-radius: 10px; margin: 12px 0; box-shadow: 0 4px 12px rgba(196, 61, 53, 0.35);">
          Complete Registration Before Expiry &rarr;
        </a>

        <p style="color: #697778; font-size: 13px; margin-top: 20px; line-height: 1.5;">
          Direct link:<br/>
          <a href="${inviteLink}" style="color: #167D78; word-break: break-all; font-size: 12px;">${inviteLink}</a>
        </p>
      </div>

      <div style="color: #697778; font-size: 12px; text-align: center; border-top: 1px solid #D9E2E3; padding-top: 16px;">
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

export const sendReferralInvitationEmail = async (
  toEmail: string,
  recipientName: string,
  senderName: string,
  gymName: string,
  referralCode: string,
  inviteLink: string,
  discountDetails: string,
  personalMessage?: string
): Promise<{ success: boolean; message?: string; error?: string }> => {
  const rawKey = process.env.BREVO_API_KEY || '';
  const apiKey = rawKey.trim().replace(/[\r\n\t\f\v"']/g, '');
  const senderEmail = (process.env.BREVO_SENDER_EMAIL || 'renugopal603@gmail.com').trim().replace(/[\r\n\t\f\v"']/g, '');
  const brandName = (process.env.BREVO_SENDER_NAME || gymName || 'Gymora').trim().replace(/[\r\n\t\f\v"']/g, '');

  const displayRecipient = recipientName?.trim() || 'Friend';
  const displaySender = senderName?.trim() || 'Your Friend';
  const displayGym = gymName?.trim() || 'Our Gym';

  const htmlContent = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 620px; margin: 0 auto; padding: 28px; border: 1px solid #343434; border-radius: 16px; background-color: #111111; color: #F5F5F5;">
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 24px; border-bottom: 1px solid #222222; padding-bottom: 20px;">
        <span style="display: inline-block; padding: 6px 14px; background-color: rgba(212, 167, 44, 0.15); border: 1px solid #D4A72C; border-radius: 9999px; color: #F2D58A; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px;">
          Exclusive VIP Invitation
        </span>
        <h1 style="color: #D4A72C; margin: 0; font-size: 26px; font-weight: 900; letter-spacing: -0.5px;">${displayGym}</h1>
        <p style="color: #A6A6A6; font-size: 13px; margin-top: 4px;">Premium Fitness & Wellness Club</p>
      </div>

      <!-- Main Body -->
      <div style="background-color: #1B1B1B; border: 1px solid #343434; border-radius: 14px; padding: 26px; text-align: center; margin-bottom: 24px;">
        <h2 style="color: #F5F5F5; margin-top: 0; font-size: 20px; font-weight: 800;">
          ${displaySender} invited you to workout together!
        </h2>
        
        <p style="color: #A6A6A6; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
          Hello <strong style="color: #F5F5F5;">${displayRecipient}</strong>,<br/>
          Your friend <strong>${displaySender}</strong> thinks you'd love achieving your fitness goals at <strong>${displayGym}</strong>. 
          They’ve gifted you an exclusive referral discount on your gym membership!
        </p>

        ${
          personalMessage
            ? `<div style="background-color: #080808; border-left: 3px solid #D4A72C; padding: 12px 16px; border-radius: 8px; text-align: left; margin: 16px 0; color: #E5E5E5; font-style: italic; font-size: 13px;">
                "${personalMessage}"
               </div>`
            : ''
        }

        <!-- Referral Code Box -->
        <div style="margin: 22px 0; padding: 18px; background-color: #080808; border: 1px dashed #D4A72C; border-radius: 12px;">
          <div style="font-size: 11px; color: #A6A6A6; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; margin-bottom: 6px;">
            Your Referral Promo Code
          </div>
          <div style="font-family: monospace; font-size: 28px; font-weight: 900; color: #F2D58A; letter-spacing: 4px;">
            ${referralCode}
          </div>
          <div style="font-size: 12px; color: #22C55E; font-weight: 700; margin-top: 6px;">
            🎉 Gives you: ${discountDetails || 'Exclusive Membership Discount'}
          </div>
        </div>

        <!-- CTA Button -->
        <a href="${inviteLink}" style="display: inline-block; background-color: #D4A72C; color: #17130A; font-size: 15px; font-weight: 800; text-decoration: none; padding: 14px 34px; border-radius: 12px; margin: 10px 0; box-shadow: 0 4px 16px rgba(212, 167, 44, 0.35);">
          Claim Discount & Register Now &rarr;
        </a>

        <p style="color: #A6A6A6; font-size: 12px; margin-top: 20px; line-height: 1.5;">
          Direct signup link:<br/>
          <a href="${inviteLink}" style="color: #D4A72C; word-break: break-all; font-size: 11px;">${inviteLink}</a>
        </p>
      </div>

      <!-- Footer -->
      <div style="color: #737373; font-size: 11px; text-align: center; border-top: 1px solid #222222; padding-top: 16px;">
        You received this invitation because ${displaySender} sent it to ${toEmail}.<br/>
        &copy; ${new Date().getFullYear()} ${displayGym}. Powered by Gymora SaaS.
      </div>
    </div>
  `;

  if (!apiKey) {
    console.warn('[EmailService] BREVO_API_KEY is not set. Simulating referral email delivery to:', toEmail);
    return {
      success: true,
      message: `Invitation email simulated successfully to ${toEmail} (API Key not set in test environment)`
    };
  }

  const payload = JSON.stringify({
    sender: { name: brandName, email: senderEmail },
    to: [{ email: toEmail, name: displayRecipient }],
    subject: `🎁 ${displaySender} invited you to join ${displayGym} (${discountDetails || 'Discount Inside'}!)`,
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
            console.log(`[EmailService] Referral invite email sent successfully to ${toEmail}`);
            resolve({ success: true, message: 'Invitation email sent successfully!' });
          } else {
            let errorMsg = `HTTP ${res.statusCode}: ${data}`;
            try {
              const parsed = JSON.parse(data);
              if (parsed.message) errorMsg = parsed.message;
            } catch (_) {}
            console.error(`[EmailService] Failed to send referral invite email: ${errorMsg}`);
            resolve({ success: false, error: errorMsg });
          }
        });
      });

      req.on('error', (err) => {
        console.error(`[EmailService] Referral invite request error: ${err.message}`);
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

export interface MembershipConfirmationEmailParams {
  toEmail: string;
  customerName: string;
  customerId: string;
  gymName: string;
  gymLogo?: string;
  gymPhone?: string;
  gymEmail?: string;
  gymAddress?: string;
  membershipId: string;
  packageName: string;
  packageDescription?: string;
  features: string[];
  duration: string;
  startDate: Date | string;
  endDate: Date | string;
  membershipStatus?: string;
  orderId: string;
  transactionId: string;
  paymentDate: Date | string;
  packagePrice: number;
  discount?: number;
  tax?: number;
  finalAmount: number;
  paymentMethod: string;
  paymentStatus?: string;
  clientUrl?: string;
}

export const sendMembershipConfirmationEmail = async (
  params: MembershipConfirmationEmailParams
): Promise<{ success: boolean; message?: string; error?: string }> => {
  const rawKey = process.env.BREVO_API_KEY || '';
  const apiKey = rawKey.trim().replace(/[\r\n\t\f\v"']/g, '');
  const senderEmail = (process.env.BREVO_SENDER_EMAIL || 'renugopal603@gmail.com').trim().replace(/[\r\n\t\f\v"']/g, '');
  const senderName = (process.env.BREVO_SENDER_NAME || params.gymName || 'Gymora AI Gym').trim().replace(/[\r\n\t\f\v"']/g, '');

  const clientBaseUrl = (params.clientUrl || process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '');
  const membershipLink = `${clientBaseUrl}/member/subscription`;

  const startDateObj = new Date(params.startDate);
  const endDateObj = new Date(params.endDate);
  const paymentDateObj = new Date(params.paymentDate);

  const formattedStartDate = startDateObj.toLocaleDateString('en-IN', {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
  });
  const formattedStartTime = startDateObj.toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit'
  });
  const formattedEndDate = endDateObj.toLocaleDateString('en-IN', {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
  });
  const formattedPaymentDate = paymentDateObj.toLocaleDateString('en-IN', {
    year: 'numeric', month: 'short', day: 'numeric'
  });
  const formattedPaymentTime = paymentDateObj.toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit'
  });

  const featureItemsHtml = (params.features && params.features.length > 0)
    ? params.features.map(f => `
      <li style="margin-bottom: 6px; display: flex; align-items: flex-start; color: #FFFFFF; font-size: 13px;">
        <span style="color: #4361EE; font-weight: bold; margin-right: 8px;">✓</span>
        <span>${f}</span>
      </li>
    `).join('')
    : '<li style="color: #A1A1AA; font-size: 13px;">Full gym facility and workout access included.</li>';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Membership Purchase Confirmed</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #000000; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #FFFFFF; -webkit-font-smoothing: antialiased;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #000000; padding: 30px 15px;">
        <tr>
          <td align="center">
            <!-- Container Box -->
            <table width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; width: 100%; background-color: #121212; border: 1px solid #282828; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.8);">
              
              <!-- Brand Header -->
              <tr>
                <td style="padding: 32px 32px 24px 32px; background: linear-gradient(180deg, #181818 0%, #121212 100%); border-bottom: 1px solid #282828; text-align: center;">
                  ${params.gymLogo ? `<img src="${params.gymLogo}" alt="${params.gymName}" style="max-height: 52px; margin-bottom: 12px; border-radius: 8px;" />` : ''}
                  <div style="display: inline-block; padding: 4px 14px; background-color: rgba(67, 97, 238, 0.15); border: 1px solid #4361EE; border-radius: 9999px; color: #FFFFFF; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px;">
                    Payment Verified & Active
                  </div>
                  <h1 style="margin: 0; font-size: 26px; font-weight: 900; color: #FFFFFF; letter-spacing: -0.5px;">${params.gymName}</h1>
                  <p style="margin: 6px 0 0 0; color: #A1A1AA; font-size: 13px;">Official Membership Purchase Confirmation & Receipt</p>
                </td>
              </tr>

              <!-- Greeting & Status Banner -->
              <tr>
                <td style="padding: 28px 32px 16px 32px;">
                  <h2 style="margin: 0 0 10px 0; font-size: 18px; font-weight: 700; color: #FFFFFF;">
                    Dear ${params.customerName},
                  </h2>
                  <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #A1A1AA;">
                    Thank you for purchasing a membership at <strong style="color: #FFFFFF;">${params.gymName}</strong>. 
                    Your payment has been successfully verified, and your membership is now <strong style="color: #22C55E;">Active</strong>.
                  </p>
                </td>
              </tr>

              <!-- Membership Details Card -->
              <tr>
                <td style="padding: 10px 32px;">
                  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #181818; border: 1px solid #282828; border-radius: 14px; padding: 20px;">
                    <tr>
                      <td colspan="2" style="padding-bottom: 14px; border-bottom: 1px solid #282828;">
                        <span style="font-size: 11px; font-weight: 800; color: #E5C583; text-transform: uppercase; letter-spacing: 1px;">MEMBERSHIP DETAILS</span>
                        <div style="font-size: 20px; font-weight: 800; color: #FFFFFF; margin-top: 4px;">
                          ${params.packageName}
                          <span style="font-size: 12px; font-weight: 600; background: rgba(34, 197, 94, 0.15); color: #22C55E; border: 1px solid rgba(34, 197, 94, 0.3); padding: 2px 10px; border-radius: 9999px; margin-left: 8px; vertical-align: middle;">
                            ${params.membershipStatus || 'Active'}
                          </span>
                        </div>
                        ${params.packageDescription ? `<p style="margin: 6px 0 0 0; font-size: 12px; color: #A1A1AA;">${params.packageDescription}</p>` : ''}
                      </td>
                    </tr>
                    <tr>
                      <td style="padding-top: 14px; width: 50%; vertical-align: top;">
                        <div style="font-size: 11px; color: #A1A1AA; text-transform: uppercase;">Membership ID</div>
                        <div style="font-size: 14px; font-weight: 700; color: #E5C583; font-family: monospace; margin-top: 2px;">
                          ${params.membershipId}
                        </div>
                        <div style="font-size: 11px; color: #A1A1AA; text-transform: uppercase; margin-top: 12px;">Duration</div>
                        <div style="font-size: 13px; font-weight: 700; color: #FFFFFF; margin-top: 2px;">${params.duration}</div>
                      </td>
                      <td style="padding-top: 14px; width: 50%; vertical-align: top;">
                        <div style="font-size: 11px; color: #A1A1AA; text-transform: uppercase;">Start Date & Time</div>
                        <div style="font-size: 13px; font-weight: 700; color: #FFFFFF; margin-top: 2px;">
                          ${formattedStartDate} (${formattedStartTime})
                        </div>
                        <div style="font-size: 11px; color: #A1A1AA; text-transform: uppercase; margin-top: 12px;">Expiry Date</div>
                        <div style="font-size: 13px; font-weight: 700; color: #E5C583; margin-top: 2px;">
                          ${formattedEndDate}
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td colspan="2" style="padding-top: 16px;">
                        <div style="font-size: 11px; font-weight: 700; color: #A1A1AA; text-transform: uppercase; margin-bottom: 8px;">Included Package Benefits:</div>
                        <ul style="margin: 0; padding-left: 0; list-style: none;">
                          ${featureItemsHtml}
                        </ul>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Payment Breakdown Table -->
              <tr>
                <td style="padding: 16px 32px;">
                  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #181818; border: 1px solid #282828; border-radius: 14px; padding: 20px;">
                    <tr>
                      <td colspan="2" style="padding-bottom: 12px; border-bottom: 1px solid #282828;">
                        <span style="font-size: 11px; font-weight: 800; color: #4361EE; text-transform: uppercase; letter-spacing: 1px;">PAYMENT TRANSACTION RECEIPT</span>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 10px 0; color: #A1A1AA; font-size: 13px;">Order / Receipt Number</td>
                      <td align="right" style="padding: 10px 0; color: #FFFFFF; font-weight: 700; font-size: 13px; font-family: monospace;">${params.orderId}</td>
                    </tr>
                    <tr>
                      <td style="padding: 6px 0; color: #A1A1AA; font-size: 13px;">Transaction Reference ID</td>
                      <td align="right" style="padding: 6px 0; color: #FFFFFF; font-weight: 700; font-size: 13px; font-family: monospace;">${params.transactionId}</td>
                    </tr>
                    <tr>
                      <td style="padding: 6px 0; color: #A1A1AA; font-size: 13px;">Payment Date & Time</td>
                      <td align="right" style="padding: 6px 0; color: #FFFFFF; font-size: 13px;">${formattedPaymentDate} ${formattedPaymentTime}</td>
                    </tr>
                    <tr>
                      <td style="padding: 6px 0; color: #A1A1AA; font-size: 13px;">Payment Method</td>
                      <td align="right" style="padding: 6px 0; color: #FFFFFF; font-size: 13px;">${params.paymentMethod}</td>
                    </tr>
                    <tr>
                      <td style="padding: 6px 0; color: #A1A1AA; font-size: 13px;">Package Price</td>
                      <td align="right" style="padding: 6px 0; color: #FFFFFF; font-size: 13px;">₹${Number(params.packagePrice || 0).toLocaleString('en-IN')}</td>
                    </tr>
                    ${params.discount ? `
                    <tr>
                      <td style="padding: 6px 0; color: #22C55E; font-size: 13px;">Promotional Discount</td>
                      <td align="right" style="padding: 6px 0; color: #22C55E; font-weight: 700; font-size: 13px;">-₹${Number(params.discount).toLocaleString('en-IN')}</td>
                    </tr>` : ''}
                    ${params.tax ? `
                    <tr>
                      <td style="padding: 6px 0; color: #A1A1AA; font-size: 13px;">Taxes & GST (18%)</td>
                      <td align="right" style="padding: 6px 0; color: #FFFFFF; font-size: 13px;">+₹${Number(params.tax).toLocaleString('en-IN')}</td>
                    </tr>` : ''}
                    <tr>
                      <td style="padding-top: 14px; border-top: 1px solid #282828; font-size: 15px; font-weight: 800; color: #FFFFFF;">Total Paid</td>
                      <td align="right" style="padding-top: 14px; border-top: 1px solid #282828; font-size: 18px; font-weight: 900; color: #E5C583;">
                        ₹${Number(params.finalAmount || 0).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Customer & Gym Info -->
              <tr>
                <td style="padding: 0 32px 16px 32px;">
                  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #181818; border: 1px solid #282828; border-radius: 14px; padding: 18px;">
                    <tr>
                      <td style="width: 50%; vertical-align: top; padding-right: 12px; border-right: 1px solid #282828;">
                        <div style="font-size: 11px; font-weight: 800; color: #A1A1AA; text-transform: uppercase;">Customer Details</div>
                        <div style="font-size: 13px; font-weight: 700; color: #FFFFFF; margin-top: 4px;">${params.customerName}</div>
                        <div style="font-size: 12px; color: #A1A1AA; margin-top: 2px;">Email: ${params.toEmail}</div>
                        <div style="font-size: 11px; font-family: monospace; color: #A1A1AA; margin-top: 2px;">ID: ${params.customerId}</div>
                      </td>
                      <td style="width: 50%; vertical-align: top; padding-left: 16px;">
                        <div style="font-size: 11px; font-weight: 800; color: #A1A1AA; text-transform: uppercase;">Gym Details & Support</div>
                        <div style="font-size: 13px; font-weight: 700; color: #FFFFFF; margin-top: 4px;">${params.gymName}</div>
                        ${params.gymPhone ? `<div style="font-size: 12px; color: #A1A1AA; margin-top: 2px;">Tel: ${params.gymPhone}</div>` : ''}
                        ${params.gymEmail ? `<div style="font-size: 12px; color: #A1A1AA; margin-top: 2px;">Email: ${params.gymEmail}</div>` : ''}
                        ${params.gymAddress ? `<div style="font-size: 11px; color: #71717A; margin-top: 2px;">${params.gymAddress}</div>` : ''}
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Important Information Box -->
              <tr>
                <td style="padding: 0 32px 24px 32px;">
                  <div style="background-color: rgba(67, 97, 238, 0.08); border-left: 3px solid #4361EE; border-radius: 8px; padding: 14px 16px; font-size: 12px; color: #A1A1AA; line-height: 1.5;">
                    <strong style="color: #FFFFFF;">Important Guidelines:</strong><br/>
                    • Your membership validity is strictly from <strong>${formattedStartDate}</strong> to <strong>${formattedEndDate}</strong>.<br/>
                    • Present your Membership ID at the gym reception or biometric checkpoint upon entry.<br/>
                    • Renewals can be initiated seamlessly before expiry to ensure uninterrupted workout and AI feature access.<br/>
                    • All membership benefits are subject to package terms and gym safety regulations.
                  </div>
                </td>
              </tr>

              <!-- Primary CTA Button -->
              <tr>
                <td align="center" style="padding: 0 32px 32px 32px;">
                  <a href="${membershipLink}" style="display: inline-block; background-color: #4361EE; color: #FFFFFF; font-size: 15px; font-weight: 700; text-decoration: none; padding: 14px 36px; border-radius: 12px; box-shadow: 0 4px 16px rgba(67, 97, 238, 0.35);">
                    View My Membership &rarr;
                  </a>
                  <p style="margin: 14px 0 0 0; font-size: 11px; color: #71717A;">
                    Direct link: <a href="${membershipLink}" style="color: #4361EE; text-decoration: underline;">${membershipLink}</a>
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding: 24px 32px; background-color: #0D0D0D; border-top: 1px solid #282828; text-align: center; color: #71717A; font-size: 11px; line-height: 1.5;">
                  This is an automated purchase receipt generated by Gymora AI Gym Platform.<br/>
                  No sensitive payment credentials or passwords are ever stored or exposed in this email.<br/>
                  &copy; ${new Date().getFullYear()} ${params.gymName}. All rights reserved.
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  if (!apiKey) {
    console.warn(`[EmailService] BREVO_API_KEY is not set. Simulating membership confirmation email delivery to: ${params.toEmail}`);
    return {
      success: true,
      message: `Membership confirmation simulated successfully to ${params.toEmail}`
    };
  }

  const payload = JSON.stringify({
    sender: { name: senderName, email: senderEmail },
    to: [{ email: params.toEmail, name: params.customerName }],
    subject: `Membership Purchase Confirmed – ${params.gymName}`,
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
            console.log(`[EmailService] Membership confirmation email sent successfully to ${params.toEmail}`);
            resolve({ success: true, message: 'Membership confirmation email sent successfully' });
          } else {
            let errorMsg = `HTTP ${res.statusCode}: ${data}`;
            try {
              const parsed = JSON.parse(data);
              if (parsed.message) errorMsg = parsed.message;
            } catch (_) {}
            console.error(`[EmailService] Failed to send membership confirmation email: ${errorMsg}`);
            resolve({ success: false, error: errorMsg });
          }
        });
      });

      req.on('error', (err) => {
        console.error(`[EmailService] Confirmation email request error: ${err.message}`);
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

export interface MembershipExpiryReminderEmailParams {
  toEmail: string;
  customerName: string;
  gymName: string;
  packageName: string;
  membershipId: string;
  expiryDate: Date | string;
  reminderType: '7_DAYS' | '3_DAYS' | 'EXPIRED_TODAY';
  clientUrl?: string;
}

export const sendMembershipExpiryReminderEmail = async (
  params: MembershipExpiryReminderEmailParams
): Promise<{ success: boolean; message?: string; error?: string }> => {
  const rawKey = process.env.BREVO_API_KEY || '';
  const apiKey = rawKey.trim().replace(/[\r\n\t\f\v"']/g, '');
  const senderEmail = (process.env.BREVO_SENDER_EMAIL || 'renugopal603@gmail.com').trim().replace(/[\r\n\t\f\v"']/g, '');
  const senderName = (process.env.BREVO_SENDER_NAME || params.gymName || 'Gymora AI Gym').trim().replace(/[\r\n\t\f\v"']/g, '');

  const clientBaseUrl = (params.clientUrl || process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '');
  const renewLink = `${clientBaseUrl}/member/subscription`;

  const expiryDateObj = new Date(params.expiryDate);
  const formattedExpiryDate = expiryDateObj.toLocaleDateString('en-IN', {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
  });

  let subjectTitle = '';
  let headline = '';
  let urgencyNote = '';

  if (params.reminderType === '7_DAYS') {
    subjectTitle = `Reminder: Your ${params.packageName} membership at ${params.gymName} expires in 7 days`;
    headline = 'Your Gym Membership Expires in 7 Days';
    urgencyNote = 'Keep your fitness momentum going! Renew before expiry to maintain your personal training logs and streak.';
  } else if (params.reminderType === '3_DAYS') {
    subjectTitle = `⚠️ Action Required: Your ${params.packageName} membership at ${params.gymName} expires in 3 days`;
    headline = 'Urgent: Membership Expiring in 3 Days';
    urgencyNote = 'Your membership validity ends very soon. Renew today to avoid any interruption at the gym.';
  } else {
    subjectTitle = `Your ${params.packageName} membership at ${params.gymName} has expired`;
    headline = 'Your Gym Membership Has Expired';
    urgencyNote = 'Your membership has concluded. Select an active package today to reactivate your gym access and AI workout plans.';
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #000000; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #FFFFFF;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #000000; padding: 30px 15px;">
        <tr>
          <td align="center">
            <table width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; width: 100%; background-color: #121212; border: 1px solid #282828; border-radius: 20px; overflow: hidden;">
              <tr>
                <td style="padding: 30px; text-align: center; background: linear-gradient(180deg, #181818 0%, #121212 100%); border-bottom: 1px solid #282828;">
                  <span style="display: inline-block; padding: 4px 14px; background-color: rgba(229, 197, 131, 0.15); border: 1px solid #E5C583; border-radius: 9999px; color: #E5C583; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-bottom: 8px;">
                    Membership Notice
                  </span>
                  <h1 style="margin: 0; font-size: 22px; font-weight: 900; color: #FFFFFF;">${headline}</h1>
                  <p style="margin: 4px 0 0 0; color: #A1A1AA; font-size: 13px;">${params.gymName}</p>
                </td>
              </tr>
              <tr>
                <td style="padding: 24px 30px;">
                  <p style="margin: 0 0 14px 0; font-size: 14px; color: #FFFFFF;">Hello <strong>${params.customerName}</strong>,</p>
                  <p style="margin: 0 0 18px 0; font-size: 13px; line-height: 1.6; color: #A1A1AA;">${urgencyNote}</p>
                  
                  <div style="background-color: #181818; border: 1px solid #282828; border-radius: 12px; padding: 18px; margin-bottom: 24px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                      <span style="font-size: 12px; color: #A1A1AA;">Package:</span>
                      <strong style="font-size: 13px; color: #FFFFFF;">${params.packageName}</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                      <span style="font-size: 12px; color: #A1A1AA;">Membership ID:</span>
                      <strong style="font-size: 13px; color: #E5C583; font-family: monospace;">${params.membershipId}</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                      <span style="font-size: 12px; color: #A1A1AA;">Expiry Date:</span>
                      <strong style="font-size: 13px; color: #EF4444;">${formattedExpiryDate}</strong>
                    </div>
                  </div>

                  <div style="text-align: center; margin: 24px 0;">
                    <a href="${renewLink}" style="display: inline-block; background-color: #4361EE; color: #FFFFFF; font-size: 14px; font-weight: 700; text-decoration: none; padding: 12px 32px; border-radius: 10px; box-shadow: 0 4px 14px rgba(67, 97, 238, 0.35);">
                      Renew Membership Now &rarr;
                    </a>
                  </div>
                </td>
              </tr>
              <tr>
                <td style="padding: 16px 30px; background-color: #0D0D0D; border-top: 1px solid #282828; text-align: center; color: #71717A; font-size: 11px;">
                  &copy; ${new Date().getFullYear()} ${params.gymName}. Powered by Gymora AI Gym SaaS.
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  if (!apiKey) {
    console.warn(`[EmailService] BREVO_API_KEY is not set. Simulating expiry reminder (${params.reminderType}) to: ${params.toEmail}`);
    return { success: true, message: `Expiry reminder simulated to ${params.toEmail}` };
  }

  const payload = JSON.stringify({
    sender: { name: senderName, email: senderEmail },
    to: [{ email: params.toEmail, name: params.customerName }],
    subject: subjectTitle,
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
            console.log(`[EmailService] Expiry reminder (${params.reminderType}) sent to ${params.toEmail}`);
            resolve({ success: true, message: 'Expiry reminder email sent successfully' });
          } else {
            let errorMsg = `HTTP ${res.statusCode}: ${data}`;
            try {
              const parsed = JSON.parse(data);
              if (parsed.message) errorMsg = parsed.message;
            } catch (_) {}
            console.error(`[EmailService] Failed to send reminder email: ${errorMsg}`);
            resolve({ success: false, error: errorMsg });
          }
        });
      });

      req.on('error', (err) => {
        console.error(`[EmailService] Reminder email error: ${err.message}`);
        resolve({ success: false, error: err.message });
      });

      req.write(payload);
      req.end();
    } catch (err: any) {
      console.error(`[EmailService] Header error: ${err.message}`);
      resolve({ success: false, error: err.message });
    }
  });
};

export interface GymOwnerSubscriptionConfirmationEmailParams {
  toEmail: string;
  ownerName: string;
  gymName: string;
  planName: string;
  billingCycle: string;
  amount: number;
  paymentMethod?: string;
  transactionId?: string;
  startDate: Date | string;
  endDate: Date | string;
  limits?: {
    members?: number | string;
    trainers?: number | string;
    staff?: number | string;
    branches?: number | string;
  };
  features?: string[];
  clientUrl?: string;
}

export const sendGymOwnerSubscriptionConfirmationEmail = async (
  params: GymOwnerSubscriptionConfirmationEmailParams
): Promise<{ success: boolean; message?: string; error?: string }> => {
  const rawKey = process.env.BREVO_API_KEY || '';
  const apiKey = rawKey.trim().replace(/[\r\n\t\f\v"']/g, '');
  const senderEmail = (process.env.BREVO_SENDER_EMAIL || 'renugopal603@gmail.com').trim().replace(/[\r\n\t\f\v"']/g, '');
  const senderName = (process.env.BREVO_SENDER_NAME || 'Gymora AI SaaS Platform').trim().replace(/[\r\n\t\f\v"']/g, '');

  const clientBaseUrl = (params.clientUrl || process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '');
  const dashboardLink = `${clientBaseUrl}/admin/subscription`;

  const startDateObj = new Date(params.startDate);
  const endDateObj = new Date(params.endDate);

  const formattedStartDate = startDateObj.toLocaleDateString('en-IN', {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
  });
  const formattedEndDate = endDateObj.toLocaleDateString('en-IN', {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
  });

  const defaultFeatures = [
    'Gym Profile & Branding Management',
    'Full Member Directory & Biometric Check-ins',
    'Trainer & Staff Role Management',
    'AI Fitness Assessment & Diet Engine',
    'Automated Member Renewal Reminders',
    'Gym Financial & Membership Reports',
    'AI Smart Assistant Support'
  ];

  const featuresToRender = (params.features && params.features.length > 0) ? params.features : defaultFeatures;

  const featureItemsHtml = featuresToRender.map(f => `
    <li style="margin-bottom: 8px; display: flex; align-items: flex-start; color: #FFFFFF; font-size: 13px;">
      <span style="color: #4361EE; font-weight: bold; margin-right: 8px;">✓</span>
      <span>${f}</span>
    </li>
  `).join('');

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>SaaS Subscription Confirmed</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #000000; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #FFFFFF; -webkit-font-smoothing: antialiased;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #000000; padding: 30px 15px;">
        <tr>
          <td align="center">
            <!-- Container Box -->
            <table width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; width: 100%; background-color: #121212; border: 1px solid #282828; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.85);">
              
              <!-- Brand Header -->
              <tr>
                <td style="padding: 32px 32px 24px 32px; background: linear-gradient(180deg, #181818 0%, #121212 100%); border-bottom: 1px solid #282828; text-align: center;">
                  <div style="display: inline-block; padding: 4px 14px; background-color: rgba(67, 97, 238, 0.15); border: 1px solid #4361EE; border-radius: 9999px; color: #FFFFFF; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px;">
                    ⭐ GYM OWNER SAAS LICENSE ACTIVE
                  </div>
                  <h1 style="margin: 0; font-size: 26px; font-weight: 900; color: #FFFFFF; letter-spacing: -0.5px;">Gymora SaaS Platform</h1>
                  <p style="margin: 6px 0 0 0; color: #A1A1AA; font-size: 13px;">Official Gym Management Subscription Confirmation & Tax Invoice</p>
                </td>
              </tr>

              <!-- Greeting & Status -->
              <tr>
                <td style="padding: 28px 32px 16px 32px;">
                  <h2 style="margin: 0 0 8px 0; font-size: 18px; font-weight: 700; color: #FFFFFF;">
                    Hello ${params.ownerName},
                  </h2>
                  <p style="margin: 0; color: #A1A1AA; font-size: 14px; line-height: 1.6;">
                    Thank you for your payment! Your Gym Management SaaS license for <strong style="color: #FFFFFF;">${params.gymName}</strong> is now officially active.
                  </p>
                </td>
              </tr>

              <!-- Plan Highlight Card -->
              <tr>
                <td style="padding: 0 32px 20px 32px;">
                  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background: linear-gradient(135deg, rgba(67, 97, 238, 0.12) 0%, rgba(229, 197, 131, 0.08) 100%); border: 1px solid #282828; border-radius: 16px; padding: 22px;">
                    <tr>
                      <td>
                        <span style="font-size: 11px; font-weight: 800; color: #E5C583; text-transform: uppercase; letter-spacing: 1px;">SUBSCRIBED PLAN</span>
                        <h3 style="margin: 4px 0 0 0; font-size: 24px; font-weight: 900; color: #FFFFFF;">${params.planName}</h3>
                        <p style="margin: 4px 0 0 0; color: #A1A1AA; font-size: 12px; text-transform: capitalize;">Billing Cycle: ${params.billingCycle}</p>
                      </td>
                      <td align="right" style="vertical-align: middle;">
                        <span style="font-size: 12px; color: #A1A1AA;">Total Amount Paid</span>
                        <div style="font-size: 28px; font-weight: 900; color: #E5C583;">₹${Number(params.amount).toLocaleString('en-IN')}</div>
                        <span style="display: inline-block; padding: 2px 10px; background-color: rgba(34, 197, 94, 0.15); border: 1px solid #22C55E; border-radius: 9999px; color: #4ADE80; font-size: 10px; font-weight: bold; margin-top: 4px;">PAID & VERIFIED</span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Payment & Validity Grid -->
              <tr>
                <td style="padding: 0 32px 20px 32px;">
                  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #181818; border: 1px solid #282828; border-radius: 14px; padding: 20px;">
                    <tr>
                      <td colspan="2" style="padding-bottom: 12px; border-bottom: 1px solid #282828;">
                        <span style="font-size: 11px; font-weight: 800; color: #4361EE; text-transform: uppercase; letter-spacing: 1px;">LICENSE & PAYMENT SUMMARY</span>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 10px 0; color: #A1A1AA; font-size: 13px;">Gym Enterprise Name</td>
                      <td align="right" style="padding: 10px 0; color: #FFFFFF; font-weight: 700; font-size: 13px;">${params.gymName}</td>
                    </tr>
                    <tr>
                      <td style="padding: 6px 0; color: #A1A1AA; font-size: 13px;">Registered Gym Owner</td>
                      <td align="right" style="padding: 6px 0; color: #FFFFFF; font-size: 13px;">${params.ownerName} (${params.toEmail})</td>
                    </tr>
                    <tr>
                      <td style="padding: 6px 0; color: #A1A1AA; font-size: 13px;">Transaction Reference ID</td>
                      <td align="right" style="padding: 6px 0; color: #FFFFFF; font-weight: 700; font-size: 13px; font-family: monospace;">${params.transactionId || 'Manual / Online'}</td>
                    </tr>
                    <tr>
                      <td style="padding: 6px 0; color: #A1A1AA; font-size: 13px;">Payment Method</td>
                      <td align="right" style="padding: 6px 0; color: #FFFFFF; font-size: 13px;">${params.paymentMethod || 'Online Payment'}</td>
                    </tr>
                    <tr>
                      <td style="padding: 6px 0; color: #A1A1AA; font-size: 13px;">Subscription Start Date</td>
                      <td align="right" style="padding: 6px 0; color: #FFFFFF; font-size: 13px;">${formattedStartDate}</td>
                    </tr>
                    <tr>
                      <td style="padding: 6px 0; color: #A1A1AA; font-size: 13px;">Next Renewal / Expiry Date</td>
                      <td align="right" style="padding: 6px 0; color: #E5C583; font-weight: 700; font-size: 13px;">${formattedEndDate}</td>
                    </tr>
                    ${params.limits ? `
                    <tr>
                      <td colspan="2" style="padding-top: 14px; padding-bottom: 8px; border-top: 1px solid #282828;">
                        <span style="font-size: 11px; font-weight: 800; color: #A1A1AA; text-transform: uppercase;">PLAN CAPACITY LIMITS</span>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 4px 0; color: #A1A1AA; font-size: 13px;">Max Active Members</td>
                      <td align="right" style="padding: 4px 0; color: #FFFFFF; font-weight: bold; font-size: 13px;">${params.limits.members ?? 100} Members</td>
                    </tr>
                    <tr>
                      <td style="padding: 4px 0; color: #A1A1AA; font-size: 13px;">Max Trainers</td>
                      <td align="right" style="padding: 4px 0; color: #FFFFFF; font-weight: bold; font-size: 13px;">${params.limits.trainers ?? 5} Trainers</td>
                    </tr>
                    <tr>
                      <td style="padding: 4px 0; color: #A1A1AA; font-size: 13px;">Branch Licenses</td>
                      <td align="right" style="padding: 4px 0; color: #FFFFFF; font-weight: bold; font-size: 13px;">${params.limits.branches ?? 1} Branch</td>
                    </tr>
                    ` : ''}
                  </table>
                </td>
              </tr>

              <!-- Included Features -->
              <tr>
                <td style="padding: 0 32px 24px 32px;">
                  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #181818; border: 1px solid #282828; border-radius: 14px; padding: 20px;">
                    <tr>
                      <td style="padding-bottom: 12px; border-bottom: 1px solid #282828;">
                        <span style="font-size: 11px; font-weight: 800; color: #E5C583; text-transform: uppercase; letter-spacing: 1px;">INCLUDED SAAS PLATFORM CAPABILITIES</span>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding-top: 12px;">
                        <ul style="margin: 0; padding: 0; list-style: none;">
                          ${featureItemsHtml}
                        </ul>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Primary CTA Button -->
              <tr>
                <td align="center" style="padding: 0 32px 32px 32px;">
                  <a href="${dashboardLink}" style="display: inline-block; background-color: #4361EE; color: #FFFFFF; font-size: 15px; font-weight: 700; text-decoration: none; padding: 14px 36px; border-radius: 12px; box-shadow: 0 4px 16px rgba(67, 97, 238, 0.35);">
                    Open Gym Admin Portal &rarr;
                  </a>
                  <p style="margin: 14px 0 0 0; font-size: 11px; color: #71717A;">
                    Dashboard Link: <a href="${dashboardLink}" style="color: #4361EE; text-decoration: underline;">${dashboardLink}</a>
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding: 24px 32px; background-color: #0D0D0D; border-top: 1px solid #282828; text-align: center; color: #71717A; font-size: 11px; line-height: 1.5;">
                  This is an official transaction confirmation and license key receipt for your AI Gym SaaS Platform.<br/>
                  For billing inquiries, contact us at support@gymora.com.<br/>
                  &copy; ${new Date().getFullYear()} Gymora AI Management SaaS. All rights reserved.
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  if (!apiKey) {
    console.warn(`[EmailService] BREVO_API_KEY is not set. Simulating subscription confirmation email to: ${params.toEmail}`);
    return {
      success: true,
      message: `Subscription confirmation simulated successfully to ${params.toEmail}`
    };
  }

  const payload = JSON.stringify({
    sender: { name: senderName, email: senderEmail },
    to: [{ email: params.toEmail, name: params.ownerName }],
    subject: `SaaS Subscription Activated: ${params.planName} – ${params.gymName}`,
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
            console.log(`[EmailService] Subscription confirmation email sent successfully to ${params.toEmail}`);
            resolve({ success: true, message: 'Subscription confirmation email sent successfully' });
          } else {
            let errorMsg = `HTTP ${res.statusCode}: ${data}`;
            try {
              const parsed = JSON.parse(data);
              if (parsed.message) errorMsg = parsed.message;
            } catch (_) {}
            console.error(`[EmailService] Failed to send subscription confirmation email: ${errorMsg}`);
            resolve({ success: false, error: errorMsg });
          }
        });
      });

      req.on('error', (err) => {
        console.error(`[EmailService] Subscription email request error: ${err.message}`);
        resolve({ success: false, error: err.message });
      });

      req.write(payload);
      req.end();
    } catch (err: any) {
      console.error(`[EmailService] Header error: ${err.message}`);
      resolve({ success: false, error: err.message });
    }
  });
};


