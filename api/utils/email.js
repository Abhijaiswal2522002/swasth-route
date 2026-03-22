import nodemailer from 'nodemailer';

export const sendAdminNotification = async (pharmacy) => {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"SwasthRoute Admin" <${process.env.EMAIL_USER}>`,
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
    // We don't want to throw error here to avoid failing the signup process
    // if only the email notification fails.
    return null;
  }
};

export const sendPasswordResetEmail = async (email, resetToken, name) => {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const resetUrl = `${process.env.FRONTEND_URL}/auth/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: `"SwasthRoute" <${process.env.EMAIL_USER}>`,
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
