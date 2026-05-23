import webpush from 'web-push';
import InvariantError from '../../../exceptions/invariant-error.js';
import NotFoundError from '../../../exceptions/not-found-error.js';
import response from '../../../utils/response.js';
import notificationRepositories from '../repositories/notification-repositories.js';

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

export const subscribe = async (req, res, next) => {
  const { endpoint, keys } = req.validated;
  const { id: userId } = req.user;

  const subscriptionId = await notificationRepositories.addSubscription({
    userId,
    endpoint,
    keysP256dh: keys.p256dh,
    keysAuth: keys.auth,
  });

  if (!subscriptionId) {
    return next(new InvariantError('Gagal menambahkan subscription webpush'));
  }

  return response(res, 201, 'Webpush subscription berhasil ditambahkan', {
    subscriptionId,
  });
};

export const unsubscribe = async (req, res, next) => {
  const { endpoint } = req.body;
  if (!endpoint) {
    return next(new InvariantError('Endpoint harus disertakan'));
  }

  const deletedId = await notificationRepositories.removeSubscription(endpoint);

  if (!deletedId) {
    return next(new NotFoundError('Webpush subscription tidak ditemukan'));
  }

  return response(res, 200, 'Webpush subscription berhasil dihapus');
};

export const testNotification = async (req, res) => {
  const { id: userId } = req.user;

  const subscriptions =
    await notificationRepositories.getSubscriptionsByUserId(userId);

  if (!subscriptions.length) {
    return response(res, 200, 'Tidak ada subscription untuk user ini');
  }

  const payload = JSON.stringify({
    title: 'Test Notification',
    body: 'This is a test notification from Cortisoul backend',
  });

  let successCount = 0;
  for (const sub of subscriptions) {
    const pushSubscription = {
      endpoint: sub.endpoint,
      keys: {
        p256dh: sub.keys_p256dh,
        auth: sub.keys_auth,
      },
    };

    try {
      await webpush.sendNotification(pushSubscription, payload);
      successCount++;
    } catch (error) {
      console.error('Error sending push notification', error);
      if (error.statusCode === 410 || error.statusCode === 404) {
        await notificationRepositories.removeSubscription(sub.endpoint);
      }
    }
  }

  return response(res, 200, `Notifikasi terkirim ke ${successCount} perangkat`);
};
