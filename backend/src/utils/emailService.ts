import https from 'https';

export const sendOtpEmail = async (toEmail: string, otp: string): Promise<boolean> => {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL || 'renugopal603@gmail.com';
  const senderName = process.env.BREVO_SENDER_NAME || 'AI GYM';

  if (!apiKey) {
    console.error('[EmailService] BREVO_API_KEY is not set in environment variables');
    return false;
  }

  const htmlContent = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #E2E8F0; border-radius: 16px; background-color: #FFFFFF;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #F97316; margin: 0; font-size: 28px; font-weight: 800;">AI GYM</h1>
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
        &copy; ${new Date().getFullYear()} AI GYM Platform. All rights reserved.
      </div>
    </div>
  `;

  const payload = JSON.stringify({
    sender: { name: senderName, email: senderEmail },
    to: [{ email: toEmail }],
    subject: `${otp} is your AI GYM verification code`,
    htmlContent: htmlContent
  });

  return new Promise((resolve) => {
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
  });
};
