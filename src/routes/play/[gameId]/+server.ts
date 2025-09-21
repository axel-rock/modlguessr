import { streamText, type UIMessage, convertToModelMessages } from 'ai'
import { env } from '$env/dynamic/private'
import { api } from '$convex/api.js'
import type { Id } from '$convex/dataModel'
import { error } from '@sveltejs/kit'
import { PRIVATE_ADMIN_API_KEY } from '$env/static/private'

process.env.AI_GATEWAY_API_KEY = env.AI_GATEWAY_API_KEY

/** Disclaimer: This logic could/should probably happen on Convex server using the [AI Agent component](https://www.convex.dev/components/agent). At the time if writing, I had a hard time understanding how to link Agents to the front-end without using the custom React client. */

export async function POST({ request, params: { gameId }, locals: { convex } }) {
	const { messages }: { messages: UIMessage[] } = await request.json()

	// await convex.setAuth()
	// await convex.action()
	const game = await convex.query(api.games.getWithModelDetails, {
		gameId: gameId as Id<'games'>,
		apiKey: PRIVATE_ADMIN_API_KEY,
	})

	if (!game) error(404, 'Game not found')

	const round = game.rounds.at(-1)

	if (!round) error(404, 'Round not found')

	const model = round.model

	console.log({ model })

	const result = streamText({
		model: round.model,
		messages: convertToModelMessages(messages),
	})

	/* Save messages to DB */

	return result.toUIMessageStreamResponse()
}
