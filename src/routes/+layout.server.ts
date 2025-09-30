import type { LayoutServerLoad } from './$types'

export const load = (async ({ cookies }) => {
	const referralCode = cookies.get('referral_code')
	return {
		referralCode,
	}
}) satisfies LayoutServerLoad
