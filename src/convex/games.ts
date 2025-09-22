import type { Doc, Id } from '$convex/dataModel'
import {
	action,
	internalAction,
	internalMutation,
	mutation,
	query,
	httpAction,
} from './_generated/server'
import { games, message } from '$lib/zod/schema'
import { zodOutputToConvex } from 'convex-helpers/server/zod'
import { v } from 'convex/values'
import { autumn } from './autumn'
import { api, internal } from '$convex/api'
import { convertToModelMessages, streamText, type UIMessage } from 'ai'

const MODEL_SETS = {
	easy: [['anthropic/claude-sonnet-4', 'google/gemini-2.5-pro', 'openai/gpt-5', 'xai/grok-4']],
	medium: [['anthropic/claude-sonnet-4', 'google/gemini-2.5-pro', 'openai/gpt-5', 'xai/grok-4']],
	hard: [['anthropic/claude-sonnet-4', 'google/gemini-2.5-pro', 'openai/gpt-5', 'xai/grok-4']],
}

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

		console.log({ data, checkError })

		if (checkError) throw new Error(checkError.message)
		if (!data?.allowed) throw new Error('Not enough tickets')

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

		const gameId = (await ctx.runMutation(internal.games._create, { game })) as Id<'games'>

		await autumn.track(ctx, {
			featureId: 'tickets',
		})

		await ctx.runAction(api.tickets.refresh)

		return gameId
	},
})

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

// Add a message directly to the current round
export const addMessageToRound = mutation({
	args: {
		gameId: v.id('games'),
		message: zodOutputToConvex(message),
	},
	handler: async (ctx, args) => {
		const game = await ctx.db.get(args.gameId)
		if (!game) throw new Error('Game not found')

		const currentRound = game.rounds.at(-1)
		if (!currentRound) throw new Error('No active round found')

		const updatedRounds = [...game.rounds]
		updatedRounds[updatedRounds.length - 1] = {
			...currentRound,
			messages: [...currentRound.messages, args.message],
		}

		await ctx.db.patch(args.gameId, { rounds: updatedRounds })
		return { success: true }
	},
})

// HTTP action for streaming using the "tee" pattern
export const streamGameChat = httpAction(async (ctx, request) => {
	// Handle CORS preflight request
	if (request.method === 'OPTIONS') {
		return new Response(null, {
			status: 200,
			headers: {
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Methods': 'POST, OPTIONS',
				'Access-Control-Allow-Headers': 'Content-Type',
				'Access-Control-Max-Age': '86400',
			},
		})
	}

	const rawBody = await request.json()

	// The AI SDK Chat sends UIMessages format
	const { gameId, messages } = rawBody as {
		gameId: string
		messages: UIMessage[]
	}

	/** User message */
	const message = messages[messages.length - 1]
	message.timestamp = Date.now()
	delete message.id

	console.log({ message })

	// Get the game and model info
	const game = await ctx.runQuery(api.games.getWithModelDetails, {
		gameId: gameId as Id<'games'>,
		apiKey: process.env.ADMIN_API_KEY,
	})

	if (!game) throw new Error('Game not found')
	const round = game.rounds.at(-1)
	if (!round) throw new Error('Round not found')

	await ctx.scheduler.runAfter(0, internal.games.saveAssistantMessage, {
		gameId: gameId as Id<'games'>,
		message,
	})

	// Stream the response using AI SDK's built-in streaming
	const result = streamText({
		model: round.model,
		messages: convertToModelMessages(messages),
		onFinish: async ({ content: parts, usage, finishReason }) => {
			await ctx.scheduler.runAfter(0, internal.games.saveAssistantMessage, {
				gameId: gameId as Id<'games'>,
				message: {
					role: 'assistant' as const,
					parts,
					timestamp: Date.now(),
				},
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

// Internal action to save assistant message to the database
// TODO: Make this a mutation
export const saveAssistantMessage = internalAction({
	args: {
		gameId: v.string(),
		message: zodOutputToConvex(message),
	},
	handler: async (ctx, args) => {
		await ctx.runMutation(api.games.addMessageToRound, {
			gameId: args.gameId as Id<'games'>,
			message: args.message,
		})
	},
})

function getRandomSet(difficulty: 'easy' | 'medium' | 'hard') {
	return MODEL_SETS[difficulty][~~(Math.random() * MODEL_SETS[difficulty].length)]
}

function getRandomModel(models: string[]) {
	return models[~~(Math.random() * models.length)]
}
