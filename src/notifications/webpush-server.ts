import webpush from 'npm:web-push';
import type { PushSubscription } from '../../types.d.ts';

const publicVapidKey = Deno.env.get('PUBLIC_VAPID_KEY') as string;
const privateVapidKey = Deno.env.get('PRIVATE_VAPID_KEY') as string;
const serverUrl = Deno.env.get('SERVER_URL') as string;

export const setUpNotificationServerCredentials = () => {
  webpush.setVapidDetails(serverUrl, publicVapidKey, privateVapidKey);
};

export const sendPushNotification = (
  subscription: PushSubscription,
  message: string
) => {
  console.log('SEND PUSH NOTIFICATION');
  console.log(subscription.endpoint);
  console.log(message);
  webpush.sendNotification(subscription, message);
};
