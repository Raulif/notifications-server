import { NotificationEvent } from '../../types.d.ts';
import { getStoredSubscriptions } from '../subscriptions/db.ts';
import { getNotificationFromDB } from "./db.ts";
import { capitalize } from '../helpers.ts';


export const getNotificationText = (
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

export const isNotificationConsumed = async (
  notificationId: string,
  issuer: string
) => {
  return await new Promise((res) => {
    // Wait 10 secs before retrieving consumption info.
    // This way we give the user time to consume it, if the user is active
    setTimeout(async () => {
      const retrievedNotification = await getNotificationFromDB(notificationId);
      const storedSubscriptions = await getStoredSubscriptions();
      const otherUser = storedSubscriptions.find((sub) => sub.user !== issuer);
      if (!otherUser) res(false);
      const consumption = retrievedNotification.consumptions.find(
        (c) => c.user === otherUser?.user
      );
      res(consumption?.consumed);
    }, 10000);
  });
};
