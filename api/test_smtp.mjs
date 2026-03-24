import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config({ path: 'd:/Mern/Swasth/.env' });

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false
    },
    family: 4
  });
};

async function testConnection() {
  const transporter = createTransporter();
  try {
    console.log('Testing SMTP connection...');
    console.log('Host:', process.env.SMTP_HOST);
    console.log('Port:', process.env.SMTP_PORT);
    console.log('User:', process.env.EMAIL_USER);
    await transporter.verify();
    console.log('Connection successful!');
  } catch (error) {
    console.error('Connection failed:', error.message);
  }
}

testConnection();
