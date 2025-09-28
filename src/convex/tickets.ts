/**
 * This table is just a wrapper around the Autumn API to show the tickets balance in the UI.
 * It might not be necessary in the future, and there are alternative ways to get the info, just not as reactive.
 */

import { action, internalMutation, query } from '$convex/server'
import { v } from 'convex/values'
import { autumn } from './autumn'
import { internal } from '$convex/api'

export const refresh = action({
	args: {},
	handler: async (ctx) => {
		const identity = await ctx.auth.getUserIdentity()
		if (identity === null) throw new Error('Not authenticated')
		const { data, error } = await autumn.check(ctx, {
			featureId: 'tickets',
		})
		if (error) throw new Error(error.message)
		const balance = data?.balance
		if (balance === undefined || balance === null) throw new Error('Balance is undefined')
		await ctx.runMutation(internal.tickets.save, {
			balance,
			user_id: identity.subject as string,
		})
		return balance
	},
})

export const save = internalMutation({
	args: { balance: v.number(), user_id: v.string() },
	handler: async (ctx, { balance, user_id }) => {
		const row = await ctx.db
			.query('tickets')
			.withIndex('by_user', (q) => q.eq('user_id', user_id))
			.first()
		if (!row) {
			await ctx.db.insert('tickets', { user_id, balance })
		} else {
			await ctx.db.patch(row._id, { balance })
		}
	},
})

export const get = query({
	args: {},
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity()
		if (identity === null) return null
		const user_id = identity.subject as string
		const data = await ctx.db
			.query('tickets')
			.withIndex('by_user', (q) => q.eq('user_id', user_id))
			.first()
		return data?.balance
	},
})
