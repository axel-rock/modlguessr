import { message } from '$lib/zod/schema'
import { defineTable, defineSchema } from 'convex/server'
import { zodOutputToConvex } from 'convex-helpers/server/zod'

export default defineSchema({
	users: defineTable({}),
	messages: defineTable(zodOutputToConvex(message)).index('by_user', ['user_id']),
})
