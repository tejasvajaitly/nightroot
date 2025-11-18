import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

/**
 * Create or update a habit entry for a specific date.
 * If an entry already exists for that date, it will be updated.
 */
export const upsertHabitEntry = mutation({
  args: {
    date: v.string(), // YYYY-MM-DD format
    bodyWeight: v.optional(v.number()),
    sleepTime: v.optional(v.number()),
    screenTime: v.optional(v.number()),
    stepsCount: v.optional(v.number()),
    calories: v.optional(v.number()),
    protein: v.optional(v.number()),
    wakeTime: v.optional(v.string()),
    featuresShipped: v.optional(v.number()),
  },
  returns: v.id("habitEntries"),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject;

    // Check if an entry already exists for this date and user
    const existingEntry = userId
      ? await ctx.db
          .query("habitEntries")
          .withIndex("by_user_and_date", (q) =>
            q.eq("userId", userId).eq("date", args.date),
          )
          .first()
      : await ctx.db
          .query("habitEntries")
          .withIndex("by_date", (q) => q.eq("date", args.date))
          .first();

    const entryData = {
      date: args.date,
      userId: userId ?? undefined,
      bodyWeight: args.bodyWeight,
      sleepTime: args.sleepTime,
      screenTime: args.screenTime,
      stepsCount: args.stepsCount,
      calories: args.calories,
      protein: args.protein,
      wakeTime: args.wakeTime,
      featuresShipped: args.featuresShipped,
    };

    if (existingEntry) {
      // Update existing entry
      await ctx.db.patch(existingEntry._id, entryData);
      return existingEntry._id;
    } else {
      // Create new entry
      return await ctx.db.insert("habitEntries", entryData);
    }
  },
});

/**
 * Get a habit entry for a specific date.
 */
export const getHabitEntry = query({
  args: {
    date: v.string(), // YYYY-MM-DD format
  },
  returns: v.union(
    v.object({
      _id: v.id("habitEntries"),
      _creationTime: v.number(),
      date: v.string(),
      userId: v.optional(v.string()),
      bodyWeight: v.optional(v.number()),
      sleepTime: v.optional(v.number()),
      screenTime: v.optional(v.number()),
      stepsCount: v.optional(v.number()),
      calories: v.optional(v.number()),
      protein: v.optional(v.number()),
      wakeTime: v.optional(v.string()),
      featuresShipped: v.optional(v.number()),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject;

    if (userId) {
      return (
        (await ctx.db
          .query("habitEntries")
          .withIndex("by_user_and_date", (q) =>
            q.eq("userId", userId).eq("date", args.date),
          )
          .first()) ?? null
      );
    } else {
      return (
        (await ctx.db
          .query("habitEntries")
          .withIndex("by_date", (q) => q.eq("date", args.date))
          .first()) ?? null
      );
    }
  },
});

/**
 * Get habit entries for a date range.
 */
export const getHabitEntries = query({
  args: {
    startDate: v.string(), // YYYY-MM-DD format
    endDate: v.string(), // YYYY-MM-DD format
  },
  returns: v.array(
    v.object({
      _id: v.id("habitEntries"),
      _creationTime: v.number(),
      date: v.string(),
      userId: v.optional(v.string()),
      bodyWeight: v.optional(v.number()),
      sleepTime: v.optional(v.number()),
      screenTime: v.optional(v.number()),
      stepsCount: v.optional(v.number()),
      calories: v.optional(v.number()),
      protein: v.optional(v.number()),
      wakeTime: v.optional(v.string()),
      featuresShipped: v.optional(v.number()),
    }),
  ),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject;

    let entries;
    if (userId) {
      // Query by user and filter by date range
      entries = await ctx.db
        .query("habitEntries")
        .withIndex("by_user_and_date", (q) => q.eq("userId", userId))
        .collect();
    } else {
      // Query all entries and filter by date range
      entries = await ctx.db
        .query("habitEntries")
        .withIndex("by_date")
        .collect();
    }

    // Filter by date range (since indexes don't support range queries directly)
    return entries.filter(
      (entry) => entry.date >= args.startDate && entry.date <= args.endDate,
    );
  },
});

/**
 * Get all habit entries, ordered by date (most recent first).
 */
export const getAllHabitEntries = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("habitEntries"),
      _creationTime: v.number(),
      date: v.string(),
      userId: v.optional(v.string()),
      bodyWeight: v.optional(v.number()),
      sleepTime: v.optional(v.number()),
      screenTime: v.optional(v.number()),
      stepsCount: v.optional(v.number()),
      calories: v.optional(v.number()),
      protein: v.optional(v.number()),
      wakeTime: v.optional(v.string()),
      featuresShipped: v.optional(v.number()),
    }),
  ),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject;

    let entries;
    if (userId) {
      entries = await ctx.db
        .query("habitEntries")
        .withIndex("by_user_and_date", (q) => q.eq("userId", userId))
        .collect();
    } else {
      entries = await ctx.db.query("habitEntries").collect();
    }

    // Sort by date descending (most recent first)
    return entries.sort((a, b) => b.date.localeCompare(a.date));
  },
});

