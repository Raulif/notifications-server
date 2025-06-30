import { mutation, query } from "./_generated/server.js";
import { v } from "convex/values";

const PushSubscription = v.object({
	endpoint: v.string(),
	expirationTime: v.optional(v.any()),
	keys: v.object({
		p256dh: v.string(),
		auth: v.string(),
	}),
});

export const post = mutation({
	args: {
		user: v.string(),
		subscription: PushSubscription,
	},
	handler: async (ctx, args) => {
		return await ctx.db.insert("subscriptions", {
			user: args.user,
			subscription: args.subscription,
		});
	},
});

export const get = query({
	args: {},
	handler: async (ctx) => {
		const response = await ctx.db.query("subscriptions").collect();
		return response;
	},
});

export const update = mutation({
	args: {
		id: v.id("subscriptions"),
		subscription: PushSubscription,
	},
	handler: async (ctx, args) => {
		const { id, subscription } = args;
		return await ctx.db.patch(id, { subscription });
	},
});
