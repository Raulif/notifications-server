import type { NotificationEvent } from '../../types.d.ts';
import { getOtherUserSubscription } from '../subscriptions/db.ts';
import { isNotificationConsumed } from './helpers.ts';
import { storeNotificationInDB } from './db.ts';
import { sendPushNotification } from './webpush-server.ts';

export const handleNewNotification = async (
  name: string,
  issuer: string,
  eventType: NotificationEvent,
  rate?: string
) => {
  // Save notification to DB
  const newNotification = await storeNotificationInDB(name, issuer, eventType, rate);
  // 1Delayed check if notification has already been consumed
  const isConsumed = await isNotificationConsumed(newNotification._id, issuer);
  // If not consumed, send push notification
  if (!isConsumed) {
    const otherUserSubscription = await getOtherUserSubscription(issuer);
    if (!otherUserSubscription) return;
    sendPushNotification(
      otherUserSubscription?.subscription,
      newNotification.text
    );
  }
};
