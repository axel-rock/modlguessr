import type { Doc } from '$convex/dataModel'
import { action, mutation, query } from '$convex/server'
import { games } from '$lib/zod/schema'
import { zodOutputToConvex } from 'convex-helpers/server/zod'
import { v } from 'convex/values'

const MODEL_SETS = {
	easy: [['anthropic/claude-sonnet-4', 'google/gemini-2.5-pro', 'openai/gpt-5', 'xai/grok-4']],
	medium: [['anthropic/claude-sonnet-4', 'google/gemini-2.5-pro', 'openai/gpt-5', 'xai/grok-4']],
	hard: [['anthropic/claude-sonnet-4', 'google/gemini-2.5-pro', 'openai/gpt-5', 'xai/grok-4']],
}

export const create = mutation({
	args: {
		game: zodOutputToConvex(games.pick({ mode: true, difficulty: true })),
	},
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity()
		if (identity === null) throw new Error('Not authenticated')
		const user_id = identity.subject

		const models = getRandomSet(args.game.difficulty)
		const model = getRandomModel(models)

		const first_round: Doc<'games'>['rounds'][number] = {
			model,
			models,
			messages: [],
			started_at: Date.now(),
		}

		const game = {
			...args.game,
			user_id,
			rounds: [first_round],
			live: false,
		}

		return await ctx.db.insert('games', game)
	},
})

export const get = query({
	args: {
		gameId: v.id('games'),
	},
	handler: async (ctx, args) => {
		let game = await ctx.db.get(args.gameId)
		if (!game) throw new Error('Game not found')
		// Remove model details from the rounds
		const rounds = game.rounds.map((round) => ({
			...round,
			model: undefined,
		}))
		return {
			...game,
			rounds,
		}
	},
})

/**
 * Get a game for admin purposes, which includes the model details (otherwise hidden to prevent cheating)
 */
export const getWithModelDetails = query({
	args: {
		gameId: v.id('games'),
		apiKey: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		if (args.apiKey !== process.env.ADMIN_API_KEY) throw new Error('Invalid API key')
		return ctx.db.get(args.gameId)
	},
})

export const pick = mutation({
	args: {
		gameId: v.id('games'),
		model: v.string(),
	},
	handler: async (ctx, args) => {
		const game = await ctx.db.get(args.gameId)
		if (!game) throw new Error('Game not found')
		const round = game.rounds.at(-1)
		if (!round) throw new Error('Round not found')

		if (round.model === args.model) return { success: true }
		return { success: false }
	},
})

function getRandomSet(difficulty: 'easy' | 'medium' | 'hard') {
	return MODEL_SETS[difficulty][~~(Math.random() * MODEL_SETS[difficulty].length)]
}

function getRandomModel(models: string[]) {
	return models[~~(Math.random() * models.length)]
}
