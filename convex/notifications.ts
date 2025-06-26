import { mutation, query } from "./_generated/server.js";
import { v } from "convex/values";

const Subscription = v.object({
	endpoint: v.string(),
	expirationTime: v.optional(v.string()),
	keys: v.object({
		p256dh: v.string(),
		auth: v.string(),
	}),
});

export const post = mutation({
	args: {
		user: v.string(),
		subscription: Subscription,
	},
	handler: async (ctx, args) => {
		return await ctx.db.insert("notifications", {
			user: args.user,
			subscription: args.subscription,
		});
	},
});

export const get = query({
	args: {},
	handler: async (ctx) => {
		const response = await ctx.db.query("notifications").collect();
		return response;
	},
});

export const put = mutation({
	args: {
		id: v.id("notifications"),
		subscription: Subscription,
	},
	handler: async (ctx, args) => {
		const { id, subscription } = args;
		return await ctx.db.patch(id, { subscription });
	},
});
