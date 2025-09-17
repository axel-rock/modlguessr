import type { LayoutServerLoad } from './$types'
import { api } from '$convex/api'

export const load = (async ({ locals: { convex } }) => {
	return {
		session: convex.query(api.auth.getSession, {}), // Run this without await
	}
}) satisfies LayoutServerLoad
