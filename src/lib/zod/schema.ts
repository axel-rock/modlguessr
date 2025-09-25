/* This file contains the zod schema for the database. It is declared here so that both Convex, SvelteKit Server and SvelteKit Client can use it. */

import { z } from 'zod'
import { zid } from 'convex-helpers/server/zod'
import { type UIMessage } from 'ai'

const TextUIPartSchema = z.object({
	type: z.literal('text'),
	text: z.string(),
	state: z.optional(z.enum(['streaming', 'done'])),
	providerMetadata: z.optional(z.record(z.string(), z.any())),
})
const ReasoningUIPartSchema = z.object({
	type: z.literal('reasoning'),
	text: z.string(),
	state: z.optional(z.enum(['streaming', 'done'])),
	providerMetadata: z.optional(z.record(z.string(), z.any())),
})

export const message = z.object({
	id: z.string(),
	role: z.enum(['assistant', 'system', 'user']),
	parts: z.array(z.union([ReasoningUIPartSchema, TextUIPartSchema])),
	metadata: z.optional(z.record(z.string(), z.unknown())),
	timestamp: z.number(),
}) satisfies z.ZodType<UIMessage>

export const score = z.object({
	base: z.number(), // Base points for correct answer
	time: z.number(), // Time bonus/penalty
	streak: z.number(), // Current streak multiplier
	revealed: z.number(), // Bonus from forcing a model to reveal itself
	total: z.number(),
})

const round = z.object({
	started_at: z.optional(z.number()),
	ended_at: z.optional(z.number()),
	model: z.string(),
	models: z.array(z.string()),
	answer: z.optional(z.string()),
	messages: z.array(message),
	score: z.optional(score),
})

export const game = z.object({
	user_id: z.string(),
	score: z.optional(z.number()), // Total score
	difficulty: z.enum(['easy', 'medium', 'hard']),
	mode: z.enum(['simple']),
	rounds: z.array(round),
	started_at: z.optional(z.number()),
	ended_at: z.optional(z.number()),
	live: z.boolean(),
})

export const public_game = game
	.omit({ rounds: true })
	.extend({ rounds: z.array(round.partial({ model: true })) })
/** Game object representation for the front-end */
export type Game = z.infer<typeof public_game>
