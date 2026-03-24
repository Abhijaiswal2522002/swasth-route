// email.js using Brevo's REST API (bypasses Render SMTP Free Tier blocks)

const sendBrevoEmail = async (toEmail, toName, subject, htmlContent, fromNameOverride) => {
  try {
    const apiKey = process.env.EMAIL_PASS || process.env.SMTP_PASS;
    const fromEmail = process.env.EMAIL_FROM;
    const fromName = fromNameOverride || 'SwasthRoute';

    if (!apiKey || !fromEmail) {
      console.warn('Skipping email. Missing EMAIL_PASS or EMAIL_FROM in environment.');
      return null;
    }

    console.log(`Sending email API request TO: ${toEmail} FROM: ${fromEmail}`);

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        sender: { name: fromName, email: fromEmail },
        to: [{ email: toEmail, name: toName || toEmail }],
        subject: subject,
        htmlContent: htmlContent
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Brevo API Error:', errorData);
      throw new Error(`Failed to send email: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Email sent successfully via Brevo API:', data.messageId);
    return data;
  } catch (error) {
    console.error('Error in sendBrevoEmail:', error.message);
    return null; // Return null so the calling function doesn't crash the server
  }
};

export const sendAdminNotification = async (pharmacy) => {
  const html = `
    <div style="font-family: sans-serif; padding: 20px; color: #333;">
      <h2 style="color: #2563eb;">New Pharmacy Registration</h2>
      <p>A new pharmacy has registered on SwasthRoute and requires verification.</p>
      <hr />
      <p><strong>Pharmacy Name:</strong> ${pharmacy.name}</p>
      <p><strong>Phone:</strong> ${pharmacy.phone}</p>
      <p><strong>Email:</strong> ${pharmacy.email}</p>
      <p><strong>License Number:</strong> ${pharmacy.licenseNumber}</p>
      <p><strong>City:</strong> ${pharmacy.address.city}</p>
      <p><strong>Location:</strong> ${pharmacy.location.coordinates[1]}, ${pharmacy.location.coordinates[0]}</p>
      <hr />
      <p style="font-size: 12px; color: #666;">Please log in to the admin panel to verify this pharmacy.</p>
    </div>
  `;
  return sendBrevoEmail(process.env.ADMIN_EMAIL, 'Admin', 'New Pharmacy Registration Request', html, 'SwasthRoute Admin');
};

export const sendPasswordResetEmail = async (email, resetToken, name) => {
  const resetUrl = `${process.env.FRONTEND_URL}/auth/reset-password?token=${resetToken}`;
  const html = `
    <div style="font-family: sans-serif; padding: 20px; color: #333;">
      <h2 style="color: #2563eb;">Password Reset Request</h2>
      <p>Hello ${name},</p>
      <p>We received a request to reset your password for your SwasthRoute account.</p>
      <p>Please click the button below to reset your password. This link will expire in 1 hour.</p>
      <div style="margin: 30px 0;">
        <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Reset Password</a>
      </div>
      <p>If you did not request this, please ignore this email.</p>
      <hr />
      <p style="font-size: 12px; color: #666;">If you're having trouble clicking the button, copy and paste the link below into your web browser:</p>
      <p style="font-size: 12px; color: #666;">${resetUrl}</p>
    </div>
  `;
  return sendBrevoEmail(email, name, 'Password Reset Request', html);
};

export const sendWelcomeEmail = async (email, name, role) => {
  const isPharmacy = role === 'pharmacy';
  const loginUrl = `${process.env.FRONTEND_URL}/auth/login`;
  const subject = isPharmacy ? 'Welcome to SwasthRoute Pharmacy Network' : 'Welcome to SwasthRoute';
  
  const html = `
    <div style="font-family: sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #2563eb; margin: 0;">SwasthRoute</h1>
        <p style="color: #666; font-size: 14px;">Your Emergency Medicine Delivery Partner</p>
      </div>
      <h2 style="color: #333;">Welcome, ${name}!</h2>
      <p>We're thrilled to have you join our community.</p>
      
      ${isPharmacy ? `
        <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; font-weight: bold; color: #1e40af;">Registration Status: Pending Verification</p>
          <p style="margin: 10px 0 0; font-size: 14px;">Our team is currently reviewing your pharmacy license and details. You will receive another notification once your account is fully approved.</p>
        </div>
      ` : `
        <p>You can now discover nearby pharmacies, search for emergency medicines, and get them delivered to your doorstep in no time.</p>
      `}
      
      <div style="margin: 30px 0; text-align: center;">
        <a href="${loginUrl}" style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Login to Your Account</a>
      </div>
      
      <p style="font-size: 14px;">If you have any questions or need assistance, feel free to reply to this email or reach out to our support team.</p>
      
      <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
      <div style="text-align: center; font-size: 12px; color: #999;">
        <p>&copy; ${new Date().getFullYear()} SwasthRoute. All rights reserved.</p>
        <p>Providing critical medicine access when it matters most.</p>
      </div>
    </div>
  `;
  return sendBrevoEmail(email, name, subject, html);
};
