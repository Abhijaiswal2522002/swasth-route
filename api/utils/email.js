import nodemailer from 'nodemailer';

// Create a reusable transporter object using the default SMTP transport
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

export const sendAdminNotification = async (pharmacy) => {
  try {
    const transporter = createTransporter();
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: process.env.ADMIN_EMAIL,
      subject: 'New Pharmacy Registration Request',
      html: `
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
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Admin notification email sent: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending admin notification email:', error);
    return null;
  }
};

export const sendPasswordResetEmail = async (email, resetToken, name) => {
  try {
    const transporter = createTransporter();
    const resetUrl = `${process.env.FRONTEND_URL}/auth/reset-password?token=${resetToken}`;

    const fromEmail = process.env.EMAIL_FROM;
    console.log('Sending email from:', fromEmail);
    console.log('Sending password reset email TO:', email);

    const mailOptions = {
      from: fromEmail, // Simplified format
      to: email,
      subject: 'Password Reset Request',
      html: `
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
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return null;
  }
};

export const sendWelcomeEmail = async (email, name, role) => {
  try {
    const transporter = createTransporter();
    const isPharmacy = role === 'pharmacy';
    const loginUrl = `${process.env.FRONTEND_URL}/auth/login`;

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: isPharmacy ? 'Welcome to SwasthRoute Pharmacy Network' : 'Welcome to SwasthRoute',
      html: `
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
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Welcome email sent: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return null;
  }
};
