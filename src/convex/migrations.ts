import { components, internal } from '$convex/api'
import type { DataModel } from '$convex/dataModel'
import { Migrations } from '@convex-dev/migrations'

export const migrations = new Migrations<DataModel>(components.migrations)

export const setDefaultValues = migrations.define({
	table: 'games',
	migrateOne: async (ctx, doc) => {
		console.log('Migrating game', doc._id)
		if (doc.rounds.some((round) => !round.prompt || !round.description)) {
			const rounds = doc.rounds.map((round) => {
				return {
					...round,
					prompt: round.prompt ?? '',
					description: round.description ?? 'Ask me anything to guess who I am!',
				}
			})
			console.log('Setting default values for rounds', rounds)
			await ctx.db.patch(doc._id, { rounds })
		}
	},
})

export const runIt = migrations.runner(internal.migrations.setDefaultValues)
