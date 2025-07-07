import { Application } from 'jsr:@oak/oak/application';
import { Router } from 'jsr:@oak/oak/router';

import { ConvexClient } from 'npm:convex/browser';
import { api } from './convex/_generated/api.js';

import type { NotificationEvent, PushSubscription } from './types.d.ts';
import { getUserSubscription } from './src/subscriptions/db.ts';
import {
  handleNewNotification,
  handleUpdateNotification,
} from './src/notifications/notifications.ts';
import { setUpNotificationServerCredentials } from './src/notifications/webpush-server.ts';

setUpNotificationServerCredentials();
const convexUrl = Deno.env.get('CONVEX_URL') as string;
const publicVapidKey = Deno.env.get('PUBLIC_VAPID_KEY') as string;
const convex = new ConvexClient(convexUrl);

const app = new Application();
app.use((ctx, next) => {
  ctx.response.headers.set('Access-Control-Allow-Origin', '*');
  return next();
});

const router = new Router();
router.post('/subscription', async (ctx) => {
  console.log('[ROUTE] POST NEW SUBSCRIPTION');
  try {
    const body = await ctx.request.body.json();
    const subscription: PushSubscription = body.subscription;
    const user: string = body.user;
    // If user data is not provided, respond with not OK
    if (!subscription?.endpoint || !user) {
      console.log('Missing subscription endpoint or user');
      ctx.response.status = 418;
      ctx.response.body = { ok: false };
    } else {
      console.log('Getting User Subscription');
      // Get existing users
      const userSubscription = await getUserSubscription(user);
      console.log('User subscription found');
      if (
        !!userSubscription?.subscription &&
        userSubscription.subscription.endpoint !== subscription.endpoint
      ) {
        console.log('Endpoint is different. Updating subscription.');
        // If user exist, update user subscription in DB
        await convex.mutation(api.subscriptions.update, {
          id: userSubscription._id,
          subscription,
        });
      } else if (!userSubscription) {
        // If user does not exist, store new in DB
        console.log('Storing new subscription');
        await convex.mutation(api.subscriptions.post, {
          user,
          subscription,
        });
      }
      // Respond with OK
      ctx.response.status = 200;
      ctx.response.body = { ok: true };
    }
    return;
  } catch (e) {
    // Respond with error
    console.error('ERROR IN NEW SUBSCRIPTION');
    console.error(e);
    ctx.response.status = 500;
    ctx.response.body = { ok: false };
  }
});

router.get('/public-vapid-key', (ctx) => {
  console.log('[ROUTE] GET PUBLIC VAPID KEY');
  ctx.response.status = 200;
  ctx.response.body = { publicVapidKey, ok: true };
  return;
});

router.post('/notification', async (ctx) => {
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
});

router.patch('/notification', async (ctx) => {
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
});

app.use(router.routes());
app.use(router.allowedMethods());

app.addEventListener('listen', ({ hostname, port, secure }) => {
  console.log(
    `Listening on: ${secure ? 'https://' : 'http://'}${
      hostname ?? 'localhost'
    }:${port}`
  );
});

await app.listen({ port: 8080 });
