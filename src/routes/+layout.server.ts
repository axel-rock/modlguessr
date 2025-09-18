import type { LayoutServerLoad } from './$types'
import { api } from '$convex/api'

export const load = (async ({ locals: { convex } }) => {
	return {
		// session: convex.query(api.auth.getSession, {}).then((err) => {
		// 	console.error(err)
		// 	return undefined
		// }), // Run this without await
	}
}) satisfies LayoutServerLoad
