import express from 'express';
import axios from 'axios';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Helper function to get PayPal access token
async function getPayPalAccessToken() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const apiUrl = process.env.PAYPAL_API_URL || 'https://api-m.sandbox.paypal.com';

  if (!clientId || !clientSecret) {
    throw new Error('PayPal credentials missing in environment configurations');
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const response = await axios.post(
    `${apiUrl}/v1/oauth2/token`,
    'grant_type=client_credentials',
    {
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );

  return response.data.access_token;
}

// Create PayPal Order
router.post('/paypal/create-order', verifyToken, async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || isNaN(amount)) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }

    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
    const apiUrl = process.env.PAYPAL_API_URL || 'https://api-m.sandbox.paypal.com';

    // If credentials are not set, fallback to simulated sandbox mode
    if (!clientId || !clientSecret) {
      console.log('[PayPal] Missing credentials. Falling back to sandbox/simulation mode.');
      return res.json({
        simulated: true,
        id: `PAYPAL-MOCK-${Date.now()}`,
        status: 'CREATED',
      });
    }

    const accessToken = await getPayPalAccessToken();

    // PayPal does not support INR natively for checkout in many configurations.
    // Convert INR to USD (approx exchange rate 1 USD = 83 INR)
    const amountInUSD = (Number(amount) / 83).toFixed(2);

    const response = await axios.post(
      `${apiUrl}/v2/checkout/orders`,
      {
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: 'USD',
              value: amountInUSD,
            },
            description: 'SwasthRoute Medicine Delivery Payment',
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    res.json({
      id: response.data.id,
      status: response.data.status,
      simulated: false,
    });
  } catch (error) {
    console.error('[PayPal Create Order Error]:', error.response?.data || error.message);
    res.status(500).json({ error: error.response?.data?.message || error.message });
  }
});

// Capture PayPal Order
router.post('/paypal/capture-order', verifyToken, async (req, res) => {
  try {
    const { orderId } = req.body;
    if (!orderId) {
      return res.status(400).json({ error: 'orderId is required' });
    }

    // Check if it's a simulated order
    if (orderId.startsWith('PAYPAL-MOCK-')) {
      console.log('[PayPal] Capturing simulated order:', orderId);
      return res.json({
        status: 'COMPLETED',
        simulated: true,
        id: orderId,
      });
    }

    const apiUrl = process.env.PAYPAL_API_URL || 'https://api-m.sandbox.paypal.com';
    const accessToken = await getPayPalAccessToken();

    const response = await axios.post(
      `${apiUrl}/v2/checkout/orders/${orderId}/capture`,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    res.json({
      id: response.data.id,
      status: response.data.status,
      simulated: false,
    });
  } catch (error) {
    console.error('[PayPal Capture Order Error]:', error.response?.data || error.message);
    res.status(500).json({ error: error.response?.data?.message || error.message });
  }
});

export default router;
