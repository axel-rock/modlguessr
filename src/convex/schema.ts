import { message } from '$lib/zod/schema'
import { defineTable, defineSchema } from 'convex/server'
import { zodOutputToConvex } from 'convex-helpers/server/zod'

export default defineSchema({
	messages: defineTable(zodOutputToConvex(message)),
})
