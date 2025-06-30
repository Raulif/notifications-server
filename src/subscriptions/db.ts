import { ConvexClient } from 'npm:convex/browser';
import { api } from '../../convex/_generated/api.js';
import { Subscription } from '../../types.d.ts';

const convexUrl = Deno.env.get('CONVEX_URL') as string;
const convex = new ConvexClient(convexUrl);
export const getStoredSubscriptions = async (): Promise<Array<Subscription>> =>
  await convex.query(api.subscriptions.get, {});

export const getOtherUserSubscription = async (
  user: string
): Promise<Subscription | undefined> => {
  const subscriptions = await getStoredSubscriptions();
  const otherUserSubscription = subscriptions?.find((sub) => sub.user !== user);
  return otherUserSubscription;
};

export const getUserSubscription = async (
  user: string
): Promise<Subscription | undefined> => {
  try {
    console.log('IN GET USER SUBSCRIPTION')
    const subscriptions = await getStoredSubscriptions();
    console.log({subscriptions, user})
    const userSubscription = subscriptions?.find((sub) => sub.user === user);
    return userSubscription;
  } catch (e) {
    console.error('ERROR IN GET USER SUBSCRIPTION');
    console.error(e);
    return;
  }
};
