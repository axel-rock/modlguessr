import { games, message } from '$lib/zod/schema'
import { defineTable, defineSchema } from 'convex/server'
import { zodOutputToConvex } from 'convex-helpers/server/zod'
import { v } from 'convex/values'

export default defineSchema({
	users: defineTable({}),
	messages: defineTable(zodOutputToConvex(message)).index('by_user', ['user_id']),
	games: defineTable(zodOutputToConvex(games)).index('by_user', ['user_id']),
	tickets: defineTable({
		user_id: v.string(),
		balance: v.optional(v.number()),
	}).index('by_user', ['user_id']),
})
