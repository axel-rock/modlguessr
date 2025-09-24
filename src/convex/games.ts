import type { DataModel, Doc, Id } from '$convex/dataModel'
import { TableAggregate, DirectAggregate } from '@convex-dev/aggregate'
import {
	action,
	internalMutation,
	mutation,
	query,
	httpAction,
	internalAction,
} from './_generated/server'
import { game, message as messageSchema, score } from '$lib/zod/schema'
import { zodOutputToConvex } from 'convex-helpers/server/zod'
import { v } from 'convex/values'
import { autumn } from './autumn'
import { api, internal, components } from '$convex/api'
import {
	convertToModelMessages,
	generateObject,
	streamText,
	validateUIMessages,
	type TextUIPart,
	type UIMessage,
} from 'ai'
import { MODEL_SETS } from '$lib/models'
import z from 'zod'
import { tokenAggregate } from './stats'

const BASE_POINTS = 100

const SYSTEM_PROMPT = `You are participating in a guessing game where the human is trying to identify which AI model you are. Don't directly reveal your name, creator, or company, but you may naturally exhibit your typical response patterns and knowledge. Avoid obvious giveaways like "I'm Claude" or "I was made by Anthropic" but otherwise respond naturally to questions about your capabilities, training, or preferences.`
// const SYSTEM_PROMPT = `You are participating in a guessing game where the human is trying to identify which AI model you are. Be extremely careful not to reveal ANY identifying information:

// - Never mention your name, creator, company, or training details
// - Avoid characteristic phrases you typically use
// - Don't reveal knowledge cutoffs or specific capabilities
// - Give generic responses about your nature ("I'm an AI assistant")
// - Vary your response style and length to avoid patterns
// - If asked direct questions about identity, deflect politely
// - Act like a generic, anonymous AI assistant

// The human is trying to trick you - stay vigilant!`

// Create has to be an action to call autumn.track...
export const create = action({
	args: {
		game: zodOutputToConvex(game.pick({ mode: true, difficulty: true })),
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

		const game = {
			...args.game,
			user_id,
			rounds: [],
			live: false,
		}

		const gameId = (await ctx.runMutation(internal.games._create, { game })) as Id<'games'>

		await ctx.runMutation(api.games.nextRound, { gameId })

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
		game: zodOutputToConvex(game),
	},
	handler: async (ctx, args) => ctx.db.insert('games', args.game),
})

export const nextRound = mutation({
	args: {
		gameId: v.id('games'),
	},
	handler: async (ctx, args) => {
		const game = await ctx.db.get(args.gameId)
		if (!game) throw new Error('Game not found')

		const models = getRandomSet(MODEL_SETS, game.difficulty)
		const model = getRandomModel(models)

		const round: Doc<'games'>['rounds'][number] = {
			model,
			models,
			messages: [],
		}

		game.rounds.push(round)
		await ctx.db.patch(args.gameId, { rounds: game.rounds })
		return game
	},
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
			model: round.ended_at ? round.model : undefined,
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

/** Pick a model for a round (check if it's the right one, and calculate the score) */
export const pick = action({
	args: {
		gameId: v.id('games'),
		roundIndex: v.number(),
		model: v.string(),
	},
	handler: async (ctx, { gameId, roundIndex, model }) => {
		const game = await ctx.runQuery(api.games.getWithModelDetails, {
			gameId: gameId as Id<'games'>,
			apiKey: process.env.ADMIN_API_KEY,
		})
		if (!game) throw new Error('Game not found')
		const round = game.rounds.at(roundIndex)
		if (!round) throw new Error('Round not found')

		const previousRound = game.rounds.at(roundIndex - 1)

		const success = round.model === model
		const base = success ? BASE_POINTS : 0
		const ended_at = Date.now()
		await ctx.runMutation(internal.games.stopRound, { gameId, roundIndex, ended_at: ended_at })
		const time = success ? ended_at - round.started_at! : 0
		const seconds = time / 1000
		const streak = success ? (previousRound?.score?.streak ?? 0) + 1 : 0
		const revealType = await ctx.runAction(internal.games.evaluate, { messages: round.messages })

		const revealed = revealType === 'explicit_reveal' ? 1.5 : 1

		const total = Math.round(Math.max(1, base - seconds) * streak * revealed)

		let score = {
			base,
			time,
			revealed,
			streak,
			total,
		}

		await ctx.runMutation(internal.games.saveScore, { gameId, answer: model, roundIndex, score })

		if (round.model === model) return { success: true }
		return { success: false }
	},
})

/* Use OpenAI to evaluate if the user successfully got the AI to explicitly reveal identifying information about itself. */
export const evaluate = internalAction({
	args: {
		messages: zodOutputToConvex(z.array(messageSchema)),
	},
	handler: async (ctx, args) => {
		const messages = await validateUIMessages({ messages: args.messages })
		const analysis = await generateObject({
			model: 'openai/gpt-4o-mini',
			output: 'enum',
			enum: ['none', 'explicit_reveal'],
			system: `Analyze if the user successfully got the AI to explicitly reveal identifying information about itself.

"explicit_reveal" examples:

- AI mentions its name/creator
- AI reveals specific capabilities or limitations
- AI gives away training details or knowledge cutoffs
- User tricks AI into confirming its identity

"none" = generic conversation, no identifying reveals
`,
			messages: convertToModelMessages(messages),
		}).catch((error) => {
			console.error(error)
			return { object: 'none' }
		})
		return analysis.object
	},
})

export const saveScore = internalMutation({
	args: {
		gameId: v.id('games'),
		answer: v.string(),
		roundIndex: v.number(),
		score: zodOutputToConvex(score),
	},
	handler: async (ctx, { gameId, answer, roundIndex, score }) => {
		const game = await ctx.db.get(gameId)
		if (!game) throw new Error('Game not found')
		game.rounds[roundIndex].score = score
		game.rounds[roundIndex].answer = answer
		game.rounds[roundIndex].ended_at = Date.now()
		game.score = (game.score ?? 0) + score.total
		await ctx.db.patch(gameId, { rounds: game.rounds, score: game.score })
	},
})

/**
 * Streaming endpoint compatible with Vercel AI SDK
 */
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

	// If the round has no user message, set the start time to now
	if (!round.messages.find((m) => m.role === 'user')) {
		round.started_at = Date.now()
		await ctx.runMutation(internal.games.startRound, {
			gameId: gameId as Id<'games'>,
			roundIndex,
			started_at: round.started_at,
		})
	}

	await ctx.runMutation(internal.games.saveMessage, {
		gameId: gameId as Id<'games'>,
		roundIndex,
		message,
	})

	const result = streamText({
		model: round.model,
		system: SYSTEM_PROMPT,
		messages: convertToModelMessages(messages),
		onFinish: async ({ content: parts, providerMetadata, usage, finishReason, response }) => {
			/** Assistant message */
			const message = {
				id: response.id,
				role: 'assistant' as const,
				parts: parts as TextUIPart[],
				timestamp: Date.now(),
				metadata: {
					...providerMetadata,
					finishReason,
					usage,
				},
			}
			console.log({ usage })
			await ctx.runMutation(internal.games.saveMessage, {
				gameId: gameId as Id<'games'>,
				roundIndex,
				message,
			})
			await tokenAggregate.insert(ctx, {
				id: response.id,
				key: usage.totalTokens ?? 0,
				sumValue: usage.totalTokens ?? 0,
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
	},
})

export const startRound = internalMutation({
	args: {
		gameId: v.id('games'),
		roundIndex: v.number(),
		started_at: v.number(),
	},
	handler: async (ctx, { gameId, roundIndex, started_at }) => {
		const game = await ctx.db.get(gameId)
		if (!game) throw new Error('Game not found')
		game.rounds[roundIndex].started_at = started_at
		await ctx.db.patch(gameId, { rounds: game.rounds })
	},
})

export const stopRound = internalMutation({
	args: {
		gameId: v.id('games'),
		roundIndex: v.number(),
		ended_at: v.number(),
	},
	handler: async (ctx, { gameId, roundIndex, ended_at }) => {
		const game = await ctx.db.get(gameId)
		if (!game) throw new Error('Game not found')
		game.rounds[roundIndex].ended_at = ended_at
		await ctx.db.patch(gameId, { rounds: game.rounds })
		return game.rounds[roundIndex].ended_at
	},
})

function getRandomSet(sets: typeof MODEL_SETS, difficulty: 'easy' | 'medium' | 'hard') {
	const set = sets[difficulty][~~(Math.random() * MODEL_SETS[difficulty].length)]
	return set.sort(() => Math.random() - 0.5)
}

function getRandomModel(models: string[]) {
	return models[~~(Math.random() * models.length)]
}
