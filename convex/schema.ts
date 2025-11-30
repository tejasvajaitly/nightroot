import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// The schema is entirely optional.
// You can delete this file (schema.ts) and the
// app will continue to work.
// The schema provides more precise TypeScript types.
export default defineSchema({
  numbers: defineTable({
    value: v.number(),
  }),
  habitEntries: defineTable({
    // Date in YYYY-MM-DD format for easy querying
    date: v.string(),
    // User ID from Clerk auth (optional for now)
    userId: v.optional(v.string()),
    // Body weight in kg or lbs
    bodyWeight: v.optional(v.number()),
    // Sleep time in hours
    sleepTime: v.optional(v.number()),
    // Screen time in hours
    screenTime: v.optional(v.number()),
    // Steps count
    stepsCount: v.optional(v.number()),
    // Calories consumed
    calories: v.optional(v.number()),
    // Protein in grams
    protein: v.optional(v.number()),
    // Wake time in minutes since midnight (0-1439)
    wakeTime: v.optional(v.number()),
    // Number of features shipped at work
    featuresShipped: v.optional(v.number()),
  })
    .index("by_date", ["date"])
    .index("by_user_and_date", ["userId", "date"]),
});
