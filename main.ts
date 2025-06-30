import { Application } from 'jsr:@oak/oak/application';
import { Router } from 'jsr:@oak/oak/router';

import { ConvexClient } from 'npm:convex/browser';
import { api } from './convex/_generated/api.js';

import type { NotificationEvent, PushSubscription } from './types.d.ts';
import { getUserSubscription } from './src/subscriptions/db.ts';
import { handleNewNameNotification } from './src/notifications/new-name.ts';
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
router.post('/new-subscription', async (ctx) => {
  try {
    const body = await ctx.request.body.json();
    const subscription: PushSubscription = body.subscription;
    const user: string = body.user;
    console.log('[ROUTE] NEW SUBSCRIPTION')
    console.log({subscription})
    console.log({user})
    // If user data is not provided, respond with not OK
    if (!subscription?.endpoint || !user) {
      ctx.response.status = 418;
      ctx.response.body = { ok: false };
    } else {
      // Get existing users
      const userSubscription = await getUserSubscription(user);
      console.log('User subscription found')
      console.log({userSubscription})
      if (
        userSubscription &&
        userSubscription.subscription.endpoint !== subscription.endpoint
      ) {
        console.log('Endpoint is different. Updating subscription.')
        // If user exist, update user subscription in DB
        const updatedSubscription = await convex.mutation(api.subscriptions.update, {
          id: userSubscription._id,
          subscription,
        });
        console.log({updatedSubscription})
      } else {
        // If user does not exist, store new in DB
        const newSubscription = await convex.mutation(api.subscriptions.post, {
          user,
          subscription,
        });
        console.log({newSubscription})
      }
      // Respond with OK
      ctx.response.status = 200;
      ctx.response.body = { ok: true };
    }
  } catch (e) {
    // Respond with error
    console.error("ERROR IN NEW SUBSCRIPTION")
    console.error(e);
    ctx.response.status = 500;
    ctx.response.body = { ok: false };
  }
});

router.get('/public-vapid-key', (ctx) => {
  ctx.response.status = 200;
  ctx.response.body = { publicVapidKey, ok: true };
});

router.post('/send-notification', async (ctx) => {
  try {
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

    switch (eventType) {
      case 'new':
        handleNewNameNotification(name, user);
        ctx.response.body = { ok: true };
        ctx.response.status = 200;
        return;
      default:
        ctx.response.body = { ok: false };
        ctx.response.status = 500;
    }

    // const storedSubscriptions = ((await convex.query(
    //   api.subscriptions.get,
    //   {}
    // )) || []) as Array<Subscription>;

    // const otherUser = storedSubscriptions.find((sub) => sub.user !== user);
    // if (!otherUser) {
    //   ctx.response.status = 200;
    //   ctx.response.body = { ok: true };
    //   return;
    // }
    // const subscription = otherUser.subscription;
    // switch (eventType) {
    //   case 'new':
    //     sendNewNameNotification(name, subscription, user);
    //     ctx.response.body = { ok: true };
    //     ctx.response.status = 200;
    //     break;
    //   case 'delete':
    //     sendDeleteNameNotification(name, subscription, user);
    //     ctx.response.body = { ok: true };
    //     ctx.response.status = 200;
    //     break;
    //   case 'rate':
    //     sendRateNotification(name, subscription, user, rate);
    //     ctx.response.body = { ok: true };
    //     ctx.response.status = 200;
    //     break;
    //   case 'veto':
    //     sendVetoNotification(name, subscription, user);
    //     ctx.response.body = { ok: true };
    //     ctx.response.status = 200;
    //     break;
    //   case 'unveto':
    //     sendUnvetoNotification(name, subscription, user);
    //     ctx.response.body = { ok: true };
    //     ctx.response.status = 200;
    //     break;
    //   default:
    //     ctx.response.body = { ok: false };
    //     ctx.response.status = 500;
    // }
  } catch (e) {
    console.error('General error in route send-notification', e);
  }
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
