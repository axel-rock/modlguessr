import { components, internal } from '$convex/api'
import type { DataModel } from '$convex/dataModel'
import { Migrations } from '@convex-dev/migrations'
import { convexToJson } from 'convex/values'

export const migrations = new Migrations<DataModel>(components.migrations)

// export const updateModels5 = migrations.define({
// 	table: 'games',
// 	migrateOne: async (ctx, doc) => {
// 		const models = await ctx.db.query('models').collect()
// 		let rounds = doc.rounds
// 		// Replace all model and models strings with model objects
// 		for (let i = 0; i < rounds.length; i++) {
// 			const round = rounds[i]
// 			const { model: roundModel, models: roundModels, ...rest } = round
// 			rounds[i].model = models.find((model) => model.id === roundModel)!._id
// 			rounds[i].models = roundModels.map((model) => models.find((m) => m.id === model)!._id)
// 		}

// 		await ctx.db.patch(doc._id, { rounds })
// 	},
// })

// export const runUpdateModels = migrations.runner(internal.migrations.updateModels5)
