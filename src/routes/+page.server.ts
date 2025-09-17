import type { Actions } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'
import { api } from '$convex/api'

export const load = (async () => {
	return {}
}) satisfies PageServerLoad

export const actions = {
	default: async ({ request, locals: { convex } }) => {
		const formData = await request.formData()
		const message = formData.get('message') as string
		//
		await convex.mutation(api.messages.create, {
			message: {
				parts: [
					{
						type: 'text',
						text: message,
					},
				],
				role: 'user',
				metadata: {},
				status: 'pending',
			},
		})
		return { message }
	},
} satisfies Actions
