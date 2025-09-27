import type { PageServerLoad } from './$types'
import { getModels } from '$lib/models'

export const load = (async () => {
	return {
		// models: await getModels('easy'),
	}
}) satisfies PageServerLoad
