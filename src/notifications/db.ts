import { ConvexClient } from 'npm:convex/browser';
import { api } from '../../convex/_generated/api.js';
import { Notification, NotificationEvent } from "../../types.d.ts";
import { getNotificationText } from "./helpers.ts";
import { getOtherUserName } from "../helpers.ts";

const convexUrl = Deno.env.get('CONVEX_URL') as string;
const convex = new ConvexClient(convexUrl);

export const getNotificationFromDB = async (
  id: string
): Promise<Notification> => {
  const notification = await convex.query(api.notifications.getById, { id });
  return notification;
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
  const newNotification = { ...notification, _id: storedId };
  return newNotification;
};
