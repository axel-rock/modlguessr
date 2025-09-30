import { api, internal } from '$convex/api'
import type { Doc, Id } from '$convex/dataModel'
import { DURATION, MAX_ROUNDS } from '$lib/constants'
import { game, message as messageSchema, score } from '$lib/zod/schema'
import {
	convertToModelMessages,
	generateObject,
	streamText,
	validateUIMessages,
	type TextUIPart,
	type UIMessage,
} from 'ai'
import { zodOutputToConvex } from 'convex-helpers/server/zod'
import { v } from 'convex/values'
import z from 'zod'
import {
	action,
	httpAction,
	internalAction,
	internalMutation,
	internalQuery,
	mutation,
	query,
} from './_generated/server'
import { autumn } from './autumn'
import { leaderboardAggregate } from './leaderboard'
import { tokenAggregate } from './stats'
import { constraints } from '$lib/prompts/contraints'
import { buildPrompt } from '$lib/prompts'
import { authComponent } from './auth'

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

		const models = await ctx.runQuery(internal.models.getRandomSet, { difficulty: game.difficulty })
		const model = models[~~(Math.random() * models.length)]

		const { prompt, description } = constraints[~~(Math.random() * constraints.length)]

		const round: Doc<'games'>['rounds'][number] = {
			model,
			models,
			prompt,
			description,
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
			model: round.answer ? round.model : undefined,
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
export const _get = internalQuery({
	args: {
		gameId: v.id('games'),
	},
	handler: async (ctx, args) => ctx.db.get(args.gameId),
})

export const list = query({
	args: {},
	handler: async (ctx) => {
		const identity = await ctx.auth.getUserIdentity()
		if (identity === null) return undefined
		const user_id = identity.subject
		let games = await ctx.db
			.query('games')
			.withIndex('by_user', (q) => q.eq('user_id', user_id))
			.collect()
		return games.reverse()
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
		const game = await ctx.runQuery(internal.games._get, {
			gameId: gameId as Id<'games'>,
		})
		if (!game) throw new Error('Game not found')
		if (!game.live) return undefined
		if (roundIndex > MAX_ROUNDS) throw new Error('Max rounds reached')
		const round = game.rounds.at(roundIndex)
		if (!round) throw new Error('Round not found')
		if (round.answer) throw new Error('Round already answered')
		if (round.scheduled_timeout)
			await ctx.scheduler.cancel(round.scheduled_timeout as Id<'_scheduled_functions'>)

		const previousRound = game.rounds.at(roundIndex - 1)

		const success = round.model === model
		const ended_at = Date.now()
		await ctx.runMutation(internal.games.stopRound, { gameId, roundIndex, ended_at: ended_at })
		const timeLeft = success
			? Math.max(0, (round.started_at! + DURATION * 1000 - ended_at) / 1000)
			: 0
		const streak = success ? (previousRound?.score?.streak ?? 0) + 1 : 0
		const revealType = await ctx.runAction(internal.games.evaluate, { messages: round.messages })

		const revealed = revealType === 'explicit_reveal' ? 1.5 : 1

		const total = Math.round(Math.max(1, timeLeft) * streak * revealed)

		let score = {
			timeLeft,
			revealed,
			streak,
			total,
		}

		await ctx.runMutation(internal.games.saveScore, { gameId, answer: model, roundIndex, score })

		if (roundIndex === MAX_ROUNDS - 1) await ctx.runMutation(internal.games.endGame, { gameId })

		if (round.model === model) return { success: true }
		return { success: false }
	},
})

export const endGame = internalMutation({
	args: {
		gameId: v.id('games'),
	},
	handler: async (ctx, { gameId }) => {
		const game = await ctx.db.get(gameId)
		if (!game) throw new Error('Game not found')
		await leaderboardAggregate.insert(ctx, game)
		await ctx.db.patch(gameId, { ended_at: Date.now() })
	},
})

/* Use OpenAI to evaluate if the user successfully got the AI to explicitly reveal identifying information about itself. */
export const evaluate = internalAction({
	args: {
		messages: zodOutputToConvex(z.array(messageSchema)),
	},
	handler: async (ctx, args) => {
		try {
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
			})
			return analysis.object
		} catch (error) {
			console.error(error)
			return { object: 'none' }
		}
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

	// Get the game and model info
	const game = await ctx.runQuery(internal.games._get, {
		gameId: gameId as Id<'games'>,
	})
	if (!game) throw new Error('Game not found')
	if (game.ended_at) throw new Error('Game has ended')
	const round = game.rounds.at(roundIndex)
	if (!round) throw new Error('Round not found')

	const user = await authComponent.getAnyUserById(ctx, game.user_id)
	if (!user) throw new Error('User not found')

	/** User message */
	const message = messageSchema.parse({
		...messages[messages.length - 1],
		timestamp: Date.now(),
	})

	// If the round has no user message, set the start time to now
	if (!round.messages.find((m: UIMessage) => m.role === 'user')) {
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

	const system = buildPrompt(game.difficulty, round.prompt ?? '', user)

	console.log('system', system)
	console.log('model', round.model)

	const result = streamText({
		model: round.model,
		system,
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
			'Access-Control-Allow-Origin': process.env.BETTER_AUTH_URL!,
			'Access-Control-Allow-Methods': 'POST, OPTIONS',
			'Access-Control-Allow-Headers':
				'Content-Type, User-Agent, Accept, Accept-Language, Accept-Encoding',
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
		if (roundIndex >= MAX_ROUNDS) throw new Error('Max rounds reached')
		const game = await ctx.db.get(gameId)
		if (!game) throw new Error('Game not found')
		game.rounds[roundIndex].started_at = started_at
		game.rounds[roundIndex].scheduled_timeout = await ctx.scheduler.runAfter(
			DURATION * 1000,
			internal.games.autoStop,
			{ gameId, roundIndex }
		)
		await ctx.db.patch(gameId, { rounds: game.rounds, live: true })
	},
})

/** Stop a round when the user answers */
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

/** End a round when the time runs out */
export const autoStop = internalMutation({
	args: {
		gameId: v.id('games'),
		roundIndex: v.number(),
	},
	handler: async (ctx, { gameId, roundIndex }) => {
		const game = await ctx.db.get(gameId)
		if (!game) throw new Error('Game not found')

		const rounds = game.rounds
		rounds[roundIndex].ended_at = Date.now()
		rounds[roundIndex].answer = 'Timeout'
		rounds[roundIndex].score = {
			timeLeft: 0,
			revealed: 0,
			streak: 0,
			total: 0,
		}
		await ctx.db.patch(gameId, { rounds: rounds })

		if (roundIndex === MAX_ROUNDS - 1) await ctx.runMutation(internal.games.endGame, { gameId })
	},
})
