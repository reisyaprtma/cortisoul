import cron from 'node-cron';
import notificationRepositories from '../repositories/notification-repositories.js';
import { sendPushNotifications } from '../../../utils/push-helper.js';

const sendDailyNotifications = async () => {
  try {
    const subscriptions = await notificationRepositories.getAllSubscriptions();

    if (!subscriptions) {
      console.log('[Cron] No user is subscribed to receive notifications');
      return;
    }

    const payload = JSON.stringify({
      title: 'Time for Daily Journal!',
      body: "How are you feeling today? Let's fill in your daily journal on Cortisoul.",
    });

    const successCount = await sendPushNotifications(subscriptions, payload);

    console.log(
      `[Cron] Successfully sent daily notifications to ${successCount} out of ${subscriptions.length} devices`
    );
  } catch (error) {
    console.error('[Cron] Error running notification schedule:', error);
  }
};

// Menjalankan tugas setiap hari pada jam 21:00
const startCronJob = () => {
  cron.schedule(
    '0 21 * * *',
    () => {
      sendDailyNotifications();
    },
    {
      scheduled: true,
      timezone: 'Asia/Jakarta',
    }
  );
};

export default startCronJob;
