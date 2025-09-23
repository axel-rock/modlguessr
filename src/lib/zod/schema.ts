/* This file contains the zod schema for the database. It is declared here so that both Convex, SvelteKit Server and SvelteKit Client can use it. */

import { z } from 'zod'
import { zid } from 'convex-helpers/server/zod'
import type { UIMessage } from 'ai'

const TextUIPartSchema = z.object({
	type: z.literal('text'),
	text: z.string(),
})
const ReasoningUIPartSchema = z.object({
	type: z.literal('reasoning'),
	text: z.string(),
})

export const message = z.object({
	id: z.string(),
	role: z.enum(['assistant', 'system', 'user']),
	parts: z.array(z.union([ReasoningUIPartSchema, TextUIPartSchema])),
	timestamp: z.number(),
}) satisfies z.ZodType<UIMessage>

export const games = z.object({
	user_id: z.string(),
	score: z.optional(z.number()),
	difficulty: z.enum(['easy', 'medium', 'hard']),
	mode: z.enum(['simple']),
	rounds: z.array(
		z.object({
			started_at: z.number(),
			model: z.string(),
			models: z.array(z.string()),
			messages: z.array(message),
		})
	),
	started_at: z.optional(z.number()),
	ended_at: z.optional(z.number()),
	live: z.boolean(),
})
