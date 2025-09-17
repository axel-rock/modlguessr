import { zodOutputToConvex } from 'convex-helpers/server/zod'
import { mutation, query } from './_generated/server'
import { message } from '$lib/zod/schema'

export const create = mutation({
	args: {
		message: zodOutputToConvex(message),
	},
	handler: async (ctx, args) => {
		return await ctx.db.insert('messages', args.message)
	},
})

export const list = query({
	args: {},
	handler: async (ctx, args) => {
		return await ctx.db.query('messages').collect()
	},
})
