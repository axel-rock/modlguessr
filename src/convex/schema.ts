import { game } from '$lib/zod/schema'
import { defineTable, defineSchema } from 'convex/server'
import { zodOutputToConvex } from 'convex-helpers/server/zod'
import { v } from 'convex/values'

export default defineSchema({
	users: defineTable({}),
	games: defineTable(zodOutputToConvex(game)).index('by_user', ['user_id']),
	tickets: defineTable({
		user_id: v.string(),
		balance: v.optional(v.number()),
	}).index('by_user', ['user_id']),
})
