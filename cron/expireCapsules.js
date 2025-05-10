const cron = require('node-cron');
const Capsule = require('../models/Capsule');

// Run every day at midnight
cron.schedule('0 0 * * *', async () => {
  console.log('[Cron] Checking for expired capsules...');

  const now = new Date();
  const expirationThreshold = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days ago

  try {
    const expiredCapsules = await Capsule.updateMany(
      {
        unlock_at: { $lte: expirationThreshold },
        isExpired: false
      },
      { $set: { isExpired: true } }
    );

    console.log(`[Cron] Marked ${expiredCapsules.modifiedCount} capsule(s) as expired.`);
  } catch (err) {
    console.error('[Cron] Expiration check failed:', err.message);
  }
});
