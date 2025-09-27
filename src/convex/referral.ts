import { action } from '$convex/server'
import { api } from '$convex/api'
import { v } from 'convex/values'
import { resend } from './email'
import { authComponent } from './auth'

const BETTER_AUTH_URL = process.env.BETTER_AUTH_URL as string

export const applyReferralCode = action({
	args: { code: v.string() },
	handler: async (
		ctx,
		args
	): Promise<{ success: boolean; error?: { code: string; message: string } }> => {
		const user = await ctx.auth.getUserIdentity()
		if (!user)
			return { success: false, error: { message: 'Not authenticated', code: 'not_authenticated' } }

		const { data, error } = await ctx.runAction(api.autumn.redeemReferralCode, args)

		if (error) {
			console.error(error)
			const message = error.message
			const code = error.code
			return {
				success: false,
				error: { message, code },
			}
		}

		if (!data) {
			console.error('No data returned from redeemReferralCode')
			return {
				success: false,
				error: { message: 'No data returned from redeemReferralCode', code: 'no_data' },
			}
		}

		if (!data.referrer.email) {
			console.error('Referrer email not found')
			return { success: true }
		}

		const customer = await authComponent.getAnyUserById(ctx, user.subject)

		const referee =
			customer?.displayUsername ??
			customer?.name ??
			user.preferredUsername ??
			user.name ??
			'Your friend'

		await resend.sendEmail(ctx, {
			from: 'ModlGuessr Referral Program <referral@modlguessr.com>',
			to: data.referrer.email,
			subject: 'You got a referral!',
			html: `<p>Congrats! <b>${referee}</b> just used your referral code to sign up for ModlGuessr! You both got 5 free games!</p><p><a href="${BETTER_AUTH_URL}">Play now</a></p>`,
		})

		return { success: true }
	},
})
