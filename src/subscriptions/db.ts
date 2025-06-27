import { ConvexClient } from 'npm:convex/browser';
import { api } from '../../convex/_generated/api.d.ts';
import { Subscription } from '../../types.d.ts';

const convexUrl = Deno.env.get('CONVEX_URL') as string;
const convex = new ConvexClient(convexUrl);
export const getStoredSubscriptions = async (): Promise<Array<Subscription>> =>
  await convex.query(api.subscriptions.get, {});

export const getUserSubscription =  async (user: string):Promise<Subscription|undefined> => {
  const subscriptions = await getStoredSubscriptions()
  const userSubscription =  subscriptions?.find((u) => u.user === user);
  return userSubscription
}