import { components, internal } from '$convex/api'
import type { DataModel } from '$convex/dataModel'
import { Migrations } from '@convex-dev/migrations'

export const migrations = new Migrations<DataModel>(components.migrations)

export const updateScores = migrations.define({
	table: 'games',
	migrateOne: async (ctx, doc) => {
		console.log('Migrating game', doc._id)
		let needsUpdate = false
		const rounds = doc.rounds.map((round) => {
			const updatedRound = { ...round }

			// Set default values for prompt and description
			if (!round.prompt || !round.description) {
				updatedRound.prompt = round.prompt ?? ''
				updatedRound.description = round.description ?? 'Ask me anything to guess who I am!'
				needsUpdate = true
			}

			// Migrate score schema from old format to new format
			if (round.score && 'base' in round.score && 'time' in round.score) {
				const oldScore = round.score as any
				updatedRound.score = {
					timeLeft: oldScore.time,
					streak: oldScore.streak,
					revealed: oldScore.revealed,
					total: oldScore.total,
				}
				needsUpdate = true
			}

			return updatedRound
		})

		if (needsUpdate) {
			console.log('Migrating rounds with new schema', rounds)
			await ctx.db.patch(doc._id, { rounds })
		}
	},
})

export const runUpdateScores = migrations.runner(internal.migrations.updateScores)
