import { Id } from "./convex/_generated/dataModel.d.ts";

export type PushSubscription = {
	endpoint: string;
	expirationTime: number | null;
	keys: {
		p256dh: string;
		auth: string;
	};
};

export type User = {
	user: string;
	subscription: PushSubscription;
	_id: Id<"notifications">;
};

export type NotificationEvent = "new" | "veto" | "rate" | "delete" | "unveto";
