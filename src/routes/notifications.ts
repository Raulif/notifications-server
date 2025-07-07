import type { RouterContext } from 'jsr:@oak/oak/router';
import type { NotificationEvent } from '../../types.d.ts';
import {
  handleNewNotification,
  handleUpdateNotification,
} from '../notifications/notifications.ts';
const publicVapidKey = Deno.env.get('PUBLIC_VAPID_KEY') as string;

export const getPublicVapidKey = (
  ctx: RouterContext<
    '/notification/public-vapid-key',
    Record<string | number, string | undefined>,
    // deno-lint-ignore no-explicit-any
    Record<string, any>
  >
) => {
  console.log('[ROUTE] GET PUBLIC VAPID KEY');
  ctx.response.status = 200;
  ctx.response.body = { publicVapidKey, ok: true };
  return;
};

export const addNotification = async (
  ctx: RouterContext<
    '/notification',
    Record<string | number, string | undefined>,
    // deno-lint-ignore no-explicit-any
    Record<string, any>
  >
) => {
  try {
    console.log('[ROUTE] POST NOTIFICATION');
    const body = await ctx.request.body.json();
    const name = body.name as string;
    const user = body.user as string;
    const eventType = body.eventType as NotificationEvent;
    const rate = body.rate;

    if (!eventType || !user || (eventType === 'rate' && !rate)) {
      ctx.response.status = 418;
      ctx.response.body = { ok: false };
      return;
    }

    handleNewNotification(name, user, eventType, rate);
    ctx.response.body = { ok: true };
    ctx.response.status = 200;
    return;
  } catch (e) {
    console.error('General error in route send-notification', e);
  }
};

export const updateNotification = async (
  ctx: RouterContext<
    '/notification',
    Record<string | number, string | undefined>,
    // deno-lint-ignore no-explicit-any
    Record<string, any>
  >
) => {
  console.log('[ROUTE] PATCH NOTIFICATION');
  const params = ctx.request.url.searchParams;
  const id = params.get('id') as string;
  const user = params.get('user') as string;
  if (!id || !user) {
    ctx.response.status = 404;
    ctx.response.body = { ok: false };
    return;
  }
  const updated = await handleUpdateNotification(id, user);
  if (!updated) {
    ctx.response.status = 500;
    ctx.response.body = { ok: false };
    return;
  }
  ctx.response.body = { ok: true };
  ctx.response.status = 200;
  return;
};
