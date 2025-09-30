import { api } from '$convex/api'
import type { PageServerLoad } from './$types'

export const load = (async ({ locals: { convex } }) => {
	const models = await convex.query(api.models.list, {})
	return { models }
}) satisfies PageServerLoad
