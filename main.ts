import { Application } from 'jsr:@oak/oak/application';
import { Router } from 'jsr:@oak/oak/router';
// import webpush from 'npm:web-push';

import { ConvexClient } from 'npm:convex/browser';
import { api } from './convex/_generated/api.js';
import { Id } from './convex/_generated/dataModel.d.ts';

const convexUrl = Deno.env.get('CONVEX_URL') as string;
const publicVapidKey = Deno.env.get('PUBLIC_VAPID_KEY') as string;
const convex = new ConvexClient(convexUrl);
const router = new Router();

type User = {
  user: string;
  endpoint: string;
  id: Id<'notifications'>;
};

router.post('/new-subscription', async (ctx) => {
  try {
    const body = await ctx.request.body.json();

    const { subscription, user } = body;
    console.log(body);
    // If user data is not provided, respond with not OK
    if (!subscription?.endpoint || !user) {
      ctx.response.status = 418;
      ctx.response.body = { ok: false };
    } else {
      // Get existing users
      const storedUsers = (await convex.query(
        api.notifications.get,
        {}
      )) as Array<User>;
      const currentUser = storedUsers?.find((u) => u.user === user);

      if (currentUser) {
        // If user exist, update user endpoint in DB
        await convex.mutation(api.notifications.put, {
          id: currentUser.id,
          endpoint: currentUser.endpoint,
        });
      } else {
        // If user does not exist, store new in DB
        await convex.mutation(api.notifications.post, {
          user,
          endpoint: subscription.endpoint,
        });
      }
      // Respond with OK
      ctx.response.status = 200;
      ctx.response.body = { ok: true };
    }
  } catch (_e) {
    // Respond with error
    ctx.response.status = 500;
    ctx.response.body = { ok: false };
  }
});

router.get('/public-vapid-key', (ctx) => {
  ctx.response.status = 200;
  ctx.response.body = { publicVapidKey, ok: true };
});

const app = new Application();
app.use(router.routes());
app.use(router.allowedMethods());
await app.listen({ port: 8080 });
console.log('Listening on port 8080');
