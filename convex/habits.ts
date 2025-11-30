import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";

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
    wakeTime: v.optional(v.number()),
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
      wakeTime: v.optional(v.number()),
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
      wakeTime: v.optional(v.number()),
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
      wakeTime: v.optional(v.number()),
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

/**
 * Helper function to get or create an entry for a date
 */
async function getOrCreateEntry(
  ctx: MutationCtx,
  date: string,
  userId: string | undefined,
) {
  const existingEntry = userId
    ? await ctx.db
        .query("habitEntries")
        .withIndex("by_user_and_date", (q) =>
          q.eq("userId", userId).eq("date", date),
        )
        .first()
    : await ctx.db
        .query("habitEntries")
        .withIndex("by_date", (q) => q.eq("date", date))
        .first();

  if (existingEntry) {
    return existingEntry._id;
  } else {
    return await ctx.db.insert("habitEntries", {
      date,
      userId: userId ?? undefined,
    });
  }
}

/**
 * Morning log: Log wake time, weight, sleep time (for today) and previous day's screen time (in hours).
 */
export const logMorning = mutation({
  args: {
    wakeTime: v.number(), // minutes since midnight
    bodyWeight: v.number(),
    sleepTime: v.number(),
    previousDayScreenTime: v.number(), // in hours
    date: v.optional(v.string()),
  },
  returns: v.object({
    todayEntryId: v.id("habitEntries"),
    yesterdayEntryId: v.id("habitEntries"),
  }),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject;

    const today = args.date ?? new Date().toISOString().split("T")[0];
    const todayDate = new Date(today);
    const yesterdayDate = new Date(todayDate);
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterday = yesterdayDate.toISOString().split("T")[0];

    const todayEntryId = await getOrCreateEntry(ctx, today, userId);
    await ctx.db.patch(todayEntryId, {
      wakeTime: args.wakeTime,
      bodyWeight: args.bodyWeight,
      sleepTime: args.sleepTime,
    });

    const yesterdayEntryId = await getOrCreateEntry(ctx, yesterday, userId);
    await ctx.db.patch(yesterdayEntryId, {
      screenTime: args.previousDayScreenTime,
    });

    return {
      todayEntryId,
      yesterdayEntryId,
    };
  },
});

/**
 * Evening log: Log features shipped, calories, protein, and steps for today.
 */
export const logEvening = mutation({
  args: {
    featuresShipped: v.number(),
    calories: v.number(),
    protein: v.number(),
    stepsCount: v.number(),
    date: v.optional(v.string()),
  },
  returns: v.id("habitEntries"),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject;

    const today = args.date ?? new Date().toISOString().split("T")[0];
    const entryId = await getOrCreateEntry(ctx, today, userId);
    await ctx.db.patch(entryId, {
      featuresShipped: args.featuresShipped,
      calories: args.calories,
      protein: args.protein,
      stepsCount: args.stepsCount,
    });

    return entryId;
  },
});

