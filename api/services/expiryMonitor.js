import Pharmacy from '../models/Pharmacy.js';
import Notification from '../models/Notification.js';
import { sendExpiryAlertEmail } from '../utils/email.js';
import { getIO } from '../socket.js';

export async function checkInventoryExpiry() {
  console.log('[Expiry Monitor] Starting daily inventory scan...');
  try {
    const pharmacies = await Pharmacy.find({});
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);

    for (const pharmacy of pharmacies) {
      const expired = [];
      const nearExpiry = [];

      for (const item of pharmacy.inventory) {
        if (!item.expiryDate) continue;
        
        const expiry = new Date(item.expiryDate);
        if (expiry < now) {
          expired.push(item);
        } else if (expiry < thirtyDaysFromNow) {
          nearExpiry.push(item);
        }
      }

      if (expired.length > 0 || nearExpiry.length > 0) {
        console.log(`[Expiry Monitor] Found expiry issues in pharmacy ${pharmacy.name}: ${expired.length} expired, ${nearExpiry.length} near expiry`);

        // 1. Create In-App Notification
        const notification = new Notification({
          recipientId: pharmacy._id,
          recipientModel: 'Pharmacy',
          title: '⚠️ Inventory Expiry Alert',
          message: `You have ${expired.length} expired items and ${nearExpiry.length} items expiring within 30 days.`,
          type: 'expiry_alert',
          metadata: {
            expiredCount: expired.length,
            nearExpiryCount: nearExpiry.length,
          },
        });
        await notification.save();

        // 2. Dispatch Live Socket Notification
        try {
          const io = getIO();
          io.to(`user-${pharmacy._id}`).emit('new-notification', {
            _id: notification._id,
            title: notification.title,
            message: notification.message,
            type: notification.type,
            createdAt: notification.createdAt,
            isRead: false,
          });
          console.log(`[Expiry Monitor] Dispatched live alert via Socket.io to room user-${pharmacy._id}`);
        } catch (socketErr) {
          // Socket might not be initialized or active yet
          console.log(`[Expiry Monitor] Socket dispatch skipped: ${socketErr.message}`);
        }

        // 3. Send HTML Email Alert via Brevo API
        if (pharmacy.email) {
          await sendExpiryAlertEmail(pharmacy.email, pharmacy.name, expired, nearExpiry);
          console.log(`[Expiry Monitor] Sent email alert to ${pharmacy.email}`);
        }
      }
    }
    console.log('[Expiry Monitor] Scan complete.');
  } catch (error) {
    console.error('[Expiry Monitor Error]:', error);
  }
}

export function startExpiryScheduler() {
  const CHECK_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours
  setInterval(checkInventoryExpiry, CHECK_INTERVAL);

  // Also run once on startup with a slight delay
  setTimeout(() => {
    checkInventoryExpiry();
  }, 15000); // 15-second delay to let server start up fully
}
