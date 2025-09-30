import { api } from '$convex/api'
import { redirect } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'

export const load = (async ({ params: { code }, locals: { convex }, cookies }) => {
	cookies.set('referral_code', code, { path: '/' })
	const user = await convex.query(api.auth.getCurrentUser, {})

	if (user) {
		const { success, error } = await convex.action(api.referral.applyReferralCode, { code })
		if (error && error.code === 'customer_already_redeemed_referral_code') redirect(302, '/')
		if (error) redirect(302, '/?message=' + encodeURIComponent(error.message))
		if (success) redirect(302, '/?message=' + encodeURIComponent('Referral code applied'))
	}

	redirect(
		302,
		`/login?message=${encodeURIComponent('We got your referral code! Sign up to get 5 free extra tickets!')}`
	)
}) satisfies PageServerLoad
