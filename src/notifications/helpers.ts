import { NotificationEvent } from '../../types.d.ts';

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
