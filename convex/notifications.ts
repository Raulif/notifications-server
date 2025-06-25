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
      endpoint: args.endpoint,
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
    endpoint: v.string(),
  },
  handler: async (ctx, args) => {
    const { id, endpoint } = args;
    return await ctx.db.patch(id, { endpoint });
  },
});
