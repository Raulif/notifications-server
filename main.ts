import { Application } from 'jsr:@oak/oak/application';
import { Router } from 'jsr:@oak/oak/router';
// import webpush from 'npm:web-push';

import { ConvexClient } from 'npm:convex/browser';
import { api } from './convex/_generated/api.js';
import { Id } from './convex/_generated/dataModel.d.ts';

const convexUrl = Deno.env.get('CONVEX_URL') as string;
const publicVapidKey = Deno.env.get('PUBLIC_VAPID_KEY') as string;
const convex = new ConvexClient(convexUrl);

type PushSubscription = {
  endpoint: string;
  expirationTime: number | null;
  keys: {
    p256dh: string;
    auth: string;
  };
};

type User = {
  user: string;
  subscription: PushSubscription;
  _id: Id<'notifications'>;
};

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

    // If user data is not provided, respond with not OK
    if (!subscription?.endpoint || !user) {
      ctx.response.status = 418;
      ctx.response.body = { ok: false };
    // } else {
    //   console.log('subscription');
    //   console.log(subscription);
      // Get existing users
      const storedUsers = ((await convex.query(api.notifications.get, {})) ||
        []) as Array<User>;

      const currentUser = storedUsers?.find((u) => u.user === user);
      if (currentUser) {
        // If user exist, update user subscription in DB
        await convex.mutation(api.notifications.put, {
          id: currentUser._id,
          subscription,
        });
      } else {
        // If user does not exist, store new in DB
        await convex.mutation(api.notifications.post, {
          user,
          subscription,
        });
      }
      // Respond with OK
      ctx.response.status = 200;
      ctx.response.body = { ok: true };
    }
  } catch (e) {
    // Respond with error
    console.error(e);
    ctx.response.status = 500;
    ctx.response.body = { ok: false };
  }
});

router.get('/public-vapid-key', (ctx) => {
  ctx.response.status = 200;
  ctx.response.body = { publicVapidKey, ok: true };
});

app.use(router.routes());
app.use(router.allowedMethods());
await app.listen({ port: 8080 });
console.log('Listening on port 8080');
