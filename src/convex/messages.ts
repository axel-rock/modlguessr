import { zodOutputToConvex } from 'convex-helpers/server/zod'
import { mutation, query } from './_generated/server'
import { message } from '$lib/zod/schema'
import type { Id } from '$convex/dataModel'

export const create = mutation({
	args: {
		message: zodOutputToConvex(message.omit({ user_id: true })),
	},
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity()
		if (identity === null) throw new Error('Not authenticated')
		let message = {
			...args.message,
			user_id: identity.subject as Id<'users'>,
		}

		return await ctx.db.insert('messages', message)
	},
})

export const list = query({
	args: {},
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity()
		if (identity === null) {
			console.warn('Not authenticated')
			return []
		}

		return await ctx.db
			.query('messages')
			.withIndex('by_user', (q) => q.eq('user_id', identity.subject as Id<'users'>))
			.collect()
	},
})
