import { Application } from 'jsr:@oak/oak/application';
import { Router } from 'jsr:@oak/oak/router';

import { ConvexClient } from 'npm:convex/browser';
import { api } from './convex/_generated/api.js';

const convexUrl = Deno.env.get('CONVEX_URL') as string;
const convex = new ConvexClient(convexUrl);
const router = new Router();

router.post('/new-subscription', async (ctx) => {
  try {
    const body = await ctx.request.body.json();

    const { endpoint, user } = body;

    if (!endpoint || !user) {
      ctx.response.body = {};
    } else {
      const storedUser = await convex.query(api.notifications.get, {});
      if (!storedUser) {
        const newUser = await convex.mutation(api.notifications.post, {
          user: body.user,
          endpoint: body.endpoint,
        });

        console.log({ stored: newUser });
        ctx.response.body = newUser;
      }
      ctx.response.body = storedUser;
    }
  } catch (_e) {
    ctx.response.body = {};
  }
});

const app = new Application();
app.use(router.routes());
app.use(router.allowedMethods());
await app.listen({ port: 8080 });
console.log('Listening in port 8080');
