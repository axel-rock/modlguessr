import type { DataModel } from '$convex/dataModel'
import { components } from '$convex/api'
import { TableAggregate } from '@convex-dev/aggregate'
import { query } from '$convex/server'
import { v } from 'convex/values'
import { authComponent } from './auth'

export const leaderboardAggregate = new TableAggregate<{
	Namespace: string // difficulty only
	Key: number
	DataModel: DataModel
	TableName: 'games'
}>(components.aggregateScores, {
	namespace: (doc) => doc.difficulty,
	sortKey: (doc) => doc.score ?? 0,
})

export const get = query({
	args: {
		difficulty: v.string(),
		limit: v.optional(v.number()),
	},
	handler: async (ctx, { difficulty, limit = 50 }) => {
		const result = await leaderboardAggregate.paginate(ctx, {
			namespace: difficulty,
			order: 'desc',
			pageSize: limit,
		})
		if (result.page.length === 0) return []
		try {
			const entries = await Promise.all(
				result.page.map(async (item) => {
					const game = await ctx.db.get(item.id)
					const user = await authComponent.getAnyUserById(ctx, game!.user_id)
					return {
						user_id: game!.user_id,
						score: item.key,
						gameId: game!._id,
						user: {
							username: user!.username,
							displayUsername: user!.displayUsername,
							image: user!.image,
							id: user!.userId,
						},
					}
				})
			)
			return entries.filter(
				(entry, index, self) => index === self.findIndex((t) => t.user_id === entry.user_id)
			)
		} catch (error) {
			console.error(error)
			return []
		}
	},
})
