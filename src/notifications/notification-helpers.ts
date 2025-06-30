import { ConvexClient } from 'npm:convex/browser';
import { Notification, NotificationEvent } from '../../types.d.ts';
import { api } from '../../convex/_generated/api.js';
import { getStoredSubscriptions } from '../subscriptions/db.ts';
import { capitalize, getOtherUserName } from "../helpers.ts";

const convexUrl = Deno.env.get('CONVEX_URL') as string;
const convex = new ConvexClient(convexUrl);

const getNotificationText = (
  name: string,
  issuer: string,
  eventType: NotificationEvent,
  rate?: string
) => {
  switch (eventType) {
    case 'new':
      return `${capitalize(issuer)} hat ${name.toUpperCase()} hinzugefügt.`;
    case 'delete':
      return `${capitalize(issuer)} hat ${name.toUpperCase()} gelöscht.`;
    case 'rate':
      return `${capitalize(issuer)} hat ${name.toUpperCase()} mit ${rate}% bewertet.`;
    case 'veto':
      return `${capitalize(issuer)} hat ein Veto gegen ${name.toUpperCase()} eingelegt.`;
    case 'unveto':
      return `${capitalize(issuer)} hat das Veto gegen ${name.toUpperCase()} zurückgezogen.`;
    default:
      return '';
  }
};

export const storeNotificationInDB = async (
  name: string,
  issuer: string,
  eventType: NotificationEvent,
  rate?: string
): Promise<Notification> => {
  const text = getNotificationText(name, issuer, eventType, rate);
  const notification = {
    issuer,
    text,
    eventType,
    consumptions: [
      { user: issuer, consumed: true },
      { user: getOtherUserName(issuer), consumed: false },
    ],
  };
  const storedId = await convex.mutation(api.notifications.post, {
    notification: notification,
  });
const newNotification = {...notification, _id: storedId} 
 return newNotification;
};

export const getNotificationFromDB = async (
  id: string
): Promise<Notification> => {
  const notification = await convex.query(api.notifications.getById, { id });
  return notification;
};

export const isNotificationConsumed = async (
  notificationId: string,
  issuer: string
) => {
  return await new Promise((res) => {
    setTimeout(async () => {
      const retrievedNotification = await getNotificationFromDB(notificationId);
      const storedSubscriptions = await getStoredSubscriptions();
      const otherUser = storedSubscriptions.find((sub) => sub.user !== issuer);
      if (!otherUser) res(false)
      const consumption = retrievedNotification.consumptions.find(
        (c) => c.user === otherUser?.user
      );
      res(consumption?.consumed);
    }, 10000);
  });
};

export const consumeNotification = async (
  notification: Notification,
  user: string
) => {
  const consumptions = notification.consumptions.map((con) =>
    con.user === user ? { ...con, consumed: true } : con
  );
  const updatedNotification: Notification = {
    ...notification,
    consumptions,
  };
  await convex.mutation(api.notifications.update, {
    id: notification._id,
    notification: updatedNotification,
  });
};

