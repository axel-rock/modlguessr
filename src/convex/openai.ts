import { action } from '$convex/server'
import { generateObject } from 'ai'
import { authComponent } from './auth'
import z from 'zod'

export const getUsernameSuggestions = action({
	args: {},
	handler: async (ctx) => {
		const userMetadata = await authComponent.safeGetAuthUser(ctx)
		if (!userMetadata) return null

		const { object } = await generateObject({
			model: 'openai/gpt-oss-20b',
			output: 'array',
			schema: z.object({
				username: z.string().min(3),
			}),
			prompt: `Generate 10 possible usernames based on the following user informations. The username should be a string of characters, numbers, and underscores. Simplest and most obvious ones first. ${JSON.stringify(userMetadata)}`,
			providerOptions: {
				gateway: {
					order: ['groq'],
				},
			},
		})

		const usernames = object.map((o) => o.username)

		return usernames
	},
})
