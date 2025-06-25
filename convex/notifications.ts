import { mutation, query } from "./_generated/server.js";
import { v } from "convex/values";

export const post = mutation({
  args: {
    user: v.string(),
    endpoint: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("notifications", {
      user: args.user,
      enpoint: args.endpoint,
    });
  },
});

export const get = query({
  args: {},
  handler: async (ctx) => {
    const response = await ctx.db.query("notifications").collect();
    console.log('Response from Convex')
    console.log(response)
    return response[0];
  },
});

export const put = mutation({
  args: {
    _id: v.id("notifications"),
    endpoint: v.string(),
  },
  handler: async (ctx, args) => {
    const { _id, endpoint } = args;
    return await ctx.db.patch(_id, { endpoint });
  },
});
