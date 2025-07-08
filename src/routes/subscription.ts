import type { RouterContext } from 'jsr:@oak/oak/router';
import { ConvexClient } from 'npm:convex/browser';

import { getUserSubscription } from '../subscriptions/db.ts';
import type { PushSubscription } from '../../types.d.ts';
import { api } from '../../convex/_generated/api.js';

const convexUrl = Deno.env.get('CONVEX_URL') as string;
const convex = new ConvexClient(convexUrl);

export const addSubscription = async (
  ctx: RouterContext<
    '/subscription',
    Record<string | number, string | undefined>,
    // deno-lint-ignore no-explicit-any
    Record<string, any>
  >
) => {
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
      // Get existing users
      const userSubscription = await getUserSubscription(user);
      if (!userSubscription) {
        // If user does not exist, store new in DB
        console.log('No subscription found for user in DB. Storing new subscription');
        await convex.mutation(api.subscriptions.post, {
          user,
          subscription,
        });
      }
      if (
        !!userSubscription?.subscription &&
        userSubscription.subscription.endpoint !== subscription.endpoint
      ) {
        console.log('User subscription found. Endpoint is different. Updating subscription.');
        // If user exist, update user subscription in DB
        await convex.mutation(api.subscriptions.update, {
          id: userSubscription._id,
          subscription,
        });
      } else {
        console.log(
          'Same user subscription found in DB. Skipping update.'
        );
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
};
