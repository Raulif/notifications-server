import webpush from 'npm:web-push';

import type { PushSubscription } from './types.d.ts';

const publicVapidKey = Deno.env.get('PUBLIC_VAPID_KEY') as string;
const privateVapidKey = Deno.env.get('PRIVATE_VAPID_KEY') as string;
const serverUrl = Deno.env.get('SERVER_URL') as string;

webpush.setVapidDetails(serverUrl, publicVapidKey, privateVapidKey);

const capitalize = (text: string) =>
  text.charAt(0).toUpperCase() + text.substring(1);

export const sendNewNameNotification = (
  name: string,
  subscription: PushSubscription,
  issuer: string
) => {
  const notification = `${capitalize(issuer)} hat ${name.toUpperCase()} hinzugefügt.`;
  webpush.sendNotification(subscription, notification);
};

export const sendDeleteNameNotification = (
  name: string,
  subscription: PushSubscription,
  issuer: string
) => {
  const notification = `${capitalize(issuer)} hat ${name.toUpperCase()} gelöscht.`;
  webpush.sendNotification(subscription, notification);
};

export const sendRateNotification = (
  name: string,
  subscription: PushSubscription,
  issuer: string,
  rate: string
) => {
  const notification = `${capitalize(issuer)} hat ${name.toUpperCase()} mit ${rate}% bewertet.`;
  webpush.sendNotification(subscription, notification);
};

export const sendVetoNotification = (
  name: string,
  subscription: PushSubscription,
  issuer: string
) => {
  const notification = `${capitalize(issuer)} hat ein Veto gegen ${name.toUpperCase()} eingelegt.`;
  webpush.sendNotification(subscription, notification);
};

export const sendUnvetoNotification = (
  name: string,
  subscription: PushSubscription,
  issuer: string
) => {
  const notification = `${capitalize(issuer)} hat das Veto gegen ${name.toUpperCase()} zurückgezogen.`;
  webpush.sendNotification(subscription, notification);
};
