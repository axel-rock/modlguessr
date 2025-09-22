import { games, message } from '$lib/zod/schema'
import { defineTable, defineSchema } from 'convex/server'
import { zodOutputToConvex } from 'convex-helpers/server/zod'
import { v } from 'convex/values'

export default defineSchema({
	users: defineTable({}),
	games: defineTable(zodOutputToConvex(games)).index('by_user', ['user_id']),
	tickets: defineTable({
		user_id: v.string(),
		balance: v.optional(v.number()),
	}).index('by_user', ['user_id']),
	// Streams table for persistent text streaming
	streams: defineTable({
		status: v.union(
			v.literal('pending'),
			v.literal('streaming'),
			v.literal('done'),
			v.literal('error'),
			v.literal('timeout')
		),
	}).index('by_status', ['status']),
	// Chunks table for storing stream chunks
	chunks: defineTable({
		streamId: v.id('streams'),
		text: v.string(),
	}).index('by_stream', ['streamId']),
})
