/* This file contains the zod schema for the database. It is declared here so that both Convex, SvelteKit Server and SvelteKit Client can use it. */

import { z } from 'zod'
import { zid } from 'convex-helpers/server/zod'

export const message = z.object({
	role: z.enum(['assistant', 'system', 'user']),
	parts: z.array(
		z.object({
			type: z.string(),
			text: z.string().optional(),
		})
	),
	timestamp: z.number(),
})

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
