import type { PageServerLoad } from './$types'

export const load = (async () => {
	return {
		// models: await getModels('easy'),
	}
}) satisfies PageServerLoad
