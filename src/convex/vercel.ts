import { internal } from '$convex/api'
import { internalAction } from '$convex/server'
import { gateway } from 'ai'
import { model } from '$lib/zod/schema'

export const getModels = internalAction({
	args: {},
	handler: async (ctx) => {
		let data = await gateway.getAvailableModels()
		const models = model.array().parse(data.models)
		await ctx.runMutation(internal.models.insert, { models })
	},
})
