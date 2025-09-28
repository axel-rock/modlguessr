import { query, internalMutation, internalQuery } from '$convex/server'
import { model } from '$lib/zod/schema'
import { zodOutputToConvex } from 'convex-helpers/server/zod'
import { z } from 'zod'

const flagships = [
	'anthropic/claude-3.5-haiku',
	'anthropic/claude-sonnet-4',
	'deepseek/deepseek-v3.1',
	'google/gemini-2.5-flash',
	'meta/llama-3.2-1b',
	'meta/llama-4-maverick',
	'mistral/mistral-medium',
	'mistral/mistral-small',
	'openai/gpt-4.1-mini',
	'openai/gpt-4.1-nano',
	'openai/gpt-4o-mini',
	'openai/gpt-5',
	'openai/gpt-5-mini',
	'openai/gpt-5-nano',
	'perplexity/sonar',
	'xai/grok-4-fast-non-reasoning',
]

const price_cap = 1.5 / 1_000_000

export const insert = internalMutation({
	args: {
		models: zodOutputToConvex(z.array(model)),
	},
	handler: async (ctx, { models }) => {
		for (const model of models) {
			await ctx.db.insert('models', model)
		}
	},
})

export const list = query({
	args: {},
	handler: async (ctx) => ctx.db.query('models').collect(),
})

export const getRandomSet = internalQuery({
	args: {
		difficulty: zodOutputToConvex(z.enum(['easy', 'medium', 'hard'])),
	},
	handler: async (ctx, { difficulty }) => {
		let models = await ctx.db.query('models').collect()
		models = models.filter((model) => model.modelType === 'language')
		models = models.filter((model) => model.pricing && +model.pricing.input <= price_cap)
		models = models.filter((model) => !model.id.includes('code') && !model.id.includes('morph')) // Remove coding models
		models = models.filter((model) => model.specification.provider !== 'stealth') // Stealth models are Grok
		models = models.sort(() => Math.random() - 0.5)

		// Easy, only flagships
		if (difficulty === 'easy')
			models = models.filter((model) => flagships.includes(model.id)).filter(keepOnePerProvider)

		// Medium, only one per provider
		if (difficulty === 'medium') models = models.filter(keepOnePerProvider)

		return models.slice(0, 4).map((model) => model.id)

		function keepOnePerProvider(
			model: (typeof models)[number],
			index: number,
			self: (typeof models)[number][]
		) {
			const provider = model.id.split('/')[0] // model.specification.provider can be "azure" for some OpenAI models for example, leading to multiple models with the same "visual" provider
			return index === self.findIndex((t) => t.id.split('/')[0] === provider)
		}
	},
})
