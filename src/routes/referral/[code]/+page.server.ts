import { api } from '$convex/api'
import { redirect } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'

export const load = (async ({ params, cookies }) => {
	cookies.set('referral_code', params.code, {
		path: '/',
		maxAge: 60 * 60 * 24 * 30, // 30 days
	})

	redirect(302, '/')
}) satisfies PageServerLoad
