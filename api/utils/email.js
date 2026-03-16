import nodemailer from 'nodemailer';

export const sendAdminNotification = async (pharmacy) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
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
