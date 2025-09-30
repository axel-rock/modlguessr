import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

/**
 * Simple endpoint to delete the referral code cookie after client-side redemption.
 * The actual redemption happens client-side where Convex auth context is guaranteed.
 */
export const POST: RequestHandler = async ({ cookies }) => {
	const referralCode = cookies.get('referral_code')

	if (!referralCode) {
		return json({ success: false, error: 'No referral code found' }, { status: 400 })
	}

	// Simply delete the cookie - redemption already happened client-side
	cookies.delete('referral_code', { path: '/' })
	return json({ success: true })
}
