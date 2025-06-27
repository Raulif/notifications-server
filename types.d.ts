import { Id } from './convex/_generated/dataModel.d.ts';

export type PushSubscription = {
  endpoint: string;
  expirationTime: number | null;
  keys: {
    p256dh: string;
    auth: string;
  };
};

export type Subscription = {
  user: string;
  subscription: PushSubscription;
  _id: Id<'subscriptions'>;
};

export type NotificationEvent = 'new' | 'veto' | 'rate' | 'delete' | 'unveto';

export type NotificationConsumption = {
  consumed: boolean;
  user: string;
};

export type Notification = {
  issuer: string;
  text: string;
  consumptions: Array<NotificationConsumption>;
	  _id: Id<'notifications'>;

};
