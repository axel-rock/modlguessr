import type { Doc, Id } from '$convex/dataModel'
import { action, internalMutation, mutation, query, httpAction } from './_generated/server'
import { games, message as messageSchema } from '$lib/zod/schema'
import { zodOutputToConvex } from 'convex-helpers/server/zod'
import { v } from 'convex/values'
import { autumn } from './autumn'
import { api, internal } from '$convex/api'
import { convertToModelMessages, streamText, type TextUIPart, type UIMessage } from 'ai'
import { MODEL_SETS } from '$lib/models'

const TIME_BETWEEN_ROUNDS = 5 * 1000

// Create has to be an action to call autumn.track...
export const create = action({
	args: {
		game: zodOutputToConvex(games.pick({ mode: true, difficulty: true })),
	},
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity()
		if (identity === null) throw new Error('Not authenticated')
		const user_id = identity.subject

		const { data, error: checkError } = await autumn.check(ctx, {
			featureId: 'tickets',
		})

		if (checkError) throw new Error(checkError.message)
		if (!data?.allowed) throw new Error('Not enough tickets')

		const models = getRandomSet(MODEL_SETS, args.game.difficulty)
		console.log({ models })
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

		const gameId = (await ctx.runMutation(internal.games._create, { game })) as Id<'games'>

		await autumn.track(ctx, {
			featureId: 'tickets',
		})

		await ctx.runAction(api.tickets.refresh)

		return gameId
	},
})

// ...so we run the actual mutation here
export const _create = internalMutation({
	args: {
		game: zodOutputToConvex(games),
	},
	handler: async (ctx, args) => ctx.db.insert('games', args.game),
})

export const get = query({
	args: {
		gameId: v.id('games'),
	},
	handler: async (ctx, args) => {
		let game = await ctx.db.get(args.gameId)
		if (!game) throw new Error('Game not found')

		// Remove model details from the rounds (messages are already embedded)
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
		roundIndex: v.number(),
		model: v.string(),
	},
	handler: async (ctx, { gameId, roundIndex, model }) => {
		const game = await ctx.db.get(gameId)
		if (!game) throw new Error('Game not found')
		const round = game.rounds.at(roundIndex)
		if (!round) throw new Error('Round not found')

		if (round.model === model) return { success: true }
		return { success: false }
	},
})

export const stream = httpAction(async (ctx, request) => {
	const rawBody = await request.json()

	const { gameId, roundIndex, messages } = rawBody as {
		gameId: string
		roundIndex: number
		messages: UIMessage[]
	}

	/** User message */
	const message = messageSchema.parse({
		...messages[messages.length - 1],
		timestamp: Date.now(),
	})

	// Get the game and model info
	const game = await ctx.runQuery(api.games.getWithModelDetails, {
		gameId: gameId as Id<'games'>,
		apiKey: process.env.ADMIN_API_KEY,
	})

	if (!game) throw new Error('Game not found')
	const round = game.rounds.at(roundIndex)
	if (!round) throw new Error('Round not found')

	await ctx.runMutation(internal.games.saveMessage, {
		gameId: gameId as Id<'games'>,
		roundIndex,
		message,
	})

	const result = streamText({
		model: round.model,
		messages: convertToModelMessages(messages),
		onFinish: async ({ content: parts, usage, finishReason, response }) => {
			/** Assistant message */
			const message = {
				id: response.id,
				role: 'assistant' as const,
				parts: parts as TextUIPart[],
				timestamp: Date.now(),
			}
			await ctx.runMutation(internal.games.saveMessage, {
				gameId: gameId as Id<'games'>,
				roundIndex,
				message,
			})
		},
	})

	// Return the UI message stream immediately to the browser
	return result.toUIMessageStreamResponse({
		headers: {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'POST, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type',
			Vary: 'Origin',
		},
	})
})

// Internal mutation to save assistant message to the database
export const saveMessage = internalMutation({
	args: {
		gameId: v.id('games'),
		roundIndex: v.number(),
		message: zodOutputToConvex(messageSchema),
	},
	handler: async (ctx, { gameId, roundIndex, message }) => {
		const game = await ctx.db.get(gameId)
		if (!game) throw new Error('Game not found')
		game.rounds[roundIndex].messages.push(message)
		await ctx.db.patch(gameId, { rounds: game.rounds })
		return { success: true }
	},
})

function getRandomSet(sets: typeof MODEL_SETS, difficulty: 'easy' | 'medium' | 'hard') {
	const set = sets[difficulty][~~(Math.random() * MODEL_SETS[difficulty].length)]
	return set.sort(() => Math.random() - 0.5)
}

function getRandomModel(models: string[]) {
	return models[~~(Math.random() * models.length)]
}
