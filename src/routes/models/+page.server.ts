import type { PageServerLoad } from './$types'

export type AIModel = {
	id: string
	name: string
	description: string
	owned_by: string
	type: 'language' | 'image' | 'document' | 'embedding'
	context_window: number
	max_tokens: number
	pricing: {
		input: number
		output: number
	}
	created: number
}

export const load = (async ({ fetch }) => {
	const modelsRequest = await fetch(`https://ai-gateway.vercel.sh/v1/models`)
	const { data: models } = (await modelsRequest.json()) as { data: AIModel[] }
	return { models }
}) satisfies PageServerLoad
