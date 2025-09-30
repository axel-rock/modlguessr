import type { LayoutServerLoad } from './$types'
import { api } from '$convex/api'

export const load = (async ({ cookies, locals: { convex } }) => {
	const referralCode = cookies.get('referral_code')
	if (referralCode) {
		try {
			const { data } = await convex.action(api.autumn.redeemReferralCode, { code: referralCode })
			if (data) {
				cookies.delete('referral_code', { path: '/' })
			}
		} catch (error) {
			console.error(error)
		}
	}
	return {}
}) satisfies LayoutServerLoad
