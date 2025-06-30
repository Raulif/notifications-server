import webpush from 'npm:web-push';

import type { PushSubscription } from '../../types.d.ts';
import {
  isNotificationConsumed,
  storeNotificationInDB,
} from './notification-helpers.ts';
import { getUserSubscription } from "../subscriptions/db.ts";

export const sendNewNameNotification = (
  subscription: PushSubscription,
  message: string
) => {
  webpush.sendNotification(subscription, message);
};

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
    const subscription = await getUserSubscription(issuer)
    console.log('SUBSCRIPTION IN HANDLE NEW NAME NOTIFICATOIN')
    console.log(subscription)
        console.log('STORED NOTIFICATION IN NEW NAME NOTIFICATION')
    console.log(storeNotificationInDB)
    if (!subscription) return
    sendNewNameNotification(subscription?.subscription as PushSubscription, storedNotification.text);
  }
};
