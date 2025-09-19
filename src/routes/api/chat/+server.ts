import { streamText, type UIMessage, convertToModelMessages } from 'ai'
import { env } from '$env/dynamic/private'
process.env.AI_GATEWAY_API_KEY = env.AI_GATEWAY_API_KEY

export async function POST({ request, params }) {
	const { messages }: { messages: UIMessage[] } = await request.json()

	const result = streamText({
		model: 'openai/gpt-5',
		messages: convertToModelMessages(messages),
	})

	return result.toUIMessageStreamResponse()
}
