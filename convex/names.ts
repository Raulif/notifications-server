import { v } from 'convex/values';
import { mutation, query } from './_generated/server.js';

const Rate = v.object({ rate: v.number(), parent: v.string() });
const Veto = v.object({ parent: v.string(), veto: v.boolean() });
const Name = v.object({
	name: v.string(),
	parent: v.string(),
	rate: v.array(Rate),
	gender: v.string(),
	veto: v.array(Veto)
});

export const post = mutation({
	handler: async (ctx, args) => {
		return await ctx.db.insert('names', { names: args.names });
	}
});

export const get = query({
	args: {},
	handler: async (ctx) => {
		const response = await ctx.db.query('names').collect();
		return response[0];
	}
});

export const put = mutation({
	args: {
		id: v.id('names'),
		names: v.array(Name)
	},
	handler: async (ctx, args) => {
		const { id, names } = args;
		return await ctx.db.patch(id, { names });
	}
});
