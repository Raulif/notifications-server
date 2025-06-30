import {
  isNotificationConsumed,
  storeNotificationInDB,
} from './notification-helpers.ts';
import { sendPushNotification } from './webpush-server.ts';
import { getOtherUserSubscription } from '../subscriptions/db.ts';

export const handleNewNameNotification = async (
  name: string,
  issuer: string
) => {
  // Save notification to DB
  const storedNotification = await storeNotificationInDB(name, issuer, 'new');
  // Delayed check if notification has already been consumed
  const isConsumed = await isNotificationConsumed(
    storedNotification._id,
    issuer
  );
  // If not consumed, send push notification
  if (!isConsumed) {
    const otherUserSubscription = await getOtherUserSubscription(issuer);
    console.log('SUBSCRIPTION IN HANDLE NEW NAME NOTIFICATOIN');
    console.log(otherUserSubscription);
    console.log('STORED NOTIFICATION IN NEW NAME NOTIFICATION');
    console.log(storedNotification);
    if (!otherUserSubscription) return;
    sendPushNotification(otherUserSubscription?.subscription, storedNotification.text);
  }
};
