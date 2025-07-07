import { mutation, query } from './_generated/server.js';
import { v } from 'convex/values';

const Consumption = v.object({
  consumed: v.boolean(),
  user: v.string(),
});

const Notification = v.object({
  issuer: v.optional(v.string()),
  text: v.optional(v.string()),
  consumptions: v.optional(v.array(Consumption)),
  eventType: v.optional(v.string()),
  _creationTime: v.optional(v.any()),
  _id: v.optional(v.id('notifications'))
});

export const post = mutation({
  args: {
    notification: Notification,
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('notifications', {
      ...args.notification,
    });
  },
});

export const get = query({
  args: {},
  handler: async (ctx) => {
    const response = await ctx.db.query('notifications').collect();
    return response;
  },
});

export const getById = query({
  args: {
    id: v.id('notifications'),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const update = mutation({
  args: {
    id: v.id('notifications'),
    notification: Notification,
  },
  handler: async (ctx, args) => {
    const { id, notification } = args;
    return await ctx.db.patch(id, notification);
  },
});
