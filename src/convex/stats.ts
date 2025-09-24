import { components } from '$convex/api'
import { query } from '$convex/server'
import { DirectAggregate } from '@convex-dev/aggregate'

export const tokenAggregate = new DirectAggregate<{ Key: number; Id: string }>(
	components.aggregateTokens
)

export const tokens = query({
	args: {},
	handler: async (ctx) => {
		return {
			total: (await tokenAggregate.sum(ctx)) ?? 0,
		}
	},
})
