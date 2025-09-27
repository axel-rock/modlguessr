import { gateway } from 'ai'
// import { env } from '$env/dynamic/private'
// if (!process.env.AI_GATEWAY_API_KEY) process.env.AI_GATEWAY_API_KEY = env.AI_GATEWAY_API_KEY

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

export const MODEL_SETS = {
	easy: [
		[
			'anthropic/claude-sonnet-4',
			'google/gemini-2.5-flash',
			'openai/gpt-5-mini',
			'xai/grok-4-fast-non-reasoning',
		],
	],
	medium: [['anthropic/claude-sonnet-4', 'google/gemini-2.5-pro', 'openai/gpt-5', 'xai/grok-4']],
	hard: [['anthropic/claude-sonnet-4', 'google/gemini-2.5-pro', 'openai/gpt-5', 'xai/grok-4']],
}

export async function getModels(mode: 'easy' | 'medium' | 'hard', amount: number = 4) {
	let { models } = await gateway.getAvailableModels()

	models = models
		.filter((model) => model.modelType === 'language')
		.filter((model) => model.pricing && +model.pricing.input <= price_cap)
		.filter((model) => !model.id.includes('code') && !model.id.includes('morph')) // Remove coding models
		.filter((model) => model.specification.provider !== 'stealth') // Stealth models are Grok
		.sort((a, b) => {
			return Math.random() - 0.5
		})

	// Hard, all models
	if (mode === 'hard') return models.slice(0, amount)

	// Medium, only one per provider
	if (mode === 'medium') return models.filter(keepOnePerProvider).slice(0, amount)

	// Easy, only flagships
	return models
		.filter((model) => flagships.includes(model.id))
		.filter(keepOnePerProvider)
		.slice(0, amount)

	function keepOnePerProvider(
		model: (typeof models)[number],
		index: number,
		self: (typeof models)[number][]
	) {
		const provider = model.id.split('/')[0] // model.specification.provider can be "azure" for some OpenAI models for example, leading to multiple models with the same "visual" provider
		return index === self.findIndex((t) => t.id.split('/')[0] === provider)
	}
}
