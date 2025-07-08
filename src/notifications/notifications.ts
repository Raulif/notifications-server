import type { NotificationEvent } from '../../types.d.ts';
import { getOtherUserSubscription } from '../subscriptions/db.ts';
import { storeNotificationInDB, updateNotificationConsumption } from './db.ts';
import { sendPushNotification } from './webpush-server.ts';

export const handleNewNotification = async (
  name: string,
  issuer: string,
  eventType: NotificationEvent,
  rate?: string
) => {
  // Save notification to DB
  const newNotification = await storeNotificationInDB(
    name,
    issuer,
    eventType,
    rate
  );
  const otherUserSubscription = await getOtherUserSubscription(issuer);
  if (!otherUserSubscription?.subscription) return;
  const data = {
    notification: newNotification,
  };
  sendPushNotification(
    otherUserSubscription?.subscription,
    JSON.stringify(data)
  );
};

export const handleUpdateNotification = async (id: string, user: string) => {
  return await updateNotificationConsumption(id, user);
};
