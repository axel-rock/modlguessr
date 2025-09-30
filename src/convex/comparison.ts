'use node'

import {
	experimental_createMCPClient,
	generateObject,
	generateText,
	stepCountIs,
	type experimental_MCPClient,
} from 'ai'
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js'
import { action } from '$convex/server'
import { zodOutputToConvex } from 'convex-helpers/server/zod'
import { z } from 'zod'
import { model } from '$lib/zod/schema'
import { api, internal } from '$convex/api'

export const compare = action({
	args: {
		models: zodOutputToConvex(z.array(model.pick({ id: true, name: true, description: true }))),
	},
	handler: async (ctx, { models }) => {
		let client: experimental_MCPClient

		try {
			const transport = new StreamableHTTPClientTransport(
				new URL(`https://mcp.firecrawl.dev/${process.env.FIRECRAWL_API_KEY}/v2/mcp`)
			)
			client = await experimental_createMCPClient({
				transport,
			})

			const tools = await client.tools()

			console.log('starting research')
			const researchResults = await Promise.all(
				models.map(async (model) => {
					const gen = await generateText({
						model: 'openai/gpt-5',
						tools,
						stopWhen: stepCountIs(30),
						system: `You are researching the distinctive writing patterns and quirks of an AI model to help users identify it in a guessing game.

Use Firecrawl tools to search for and scrape information about this model's response patterns. Focus on:
- Distinctive phrases or word choices
- Formatting preferences and structure
- Tone and personality traits
- Common patterns that make it recognizable
- Notable strengths or weaknesses in communication style

Keep your research FOCUSED and CONCISE. Prioritize quality over quantity - you need specific, actionable tells that help distinguish this model from others, not exhaustive documentation.

Stop searching once you have 3-5 clear distinctive patterns. Cite your sources.`,
						onStepFinish: (step) => {
							console.log({ step })
						},
						messages: [
							{
								role: 'user',
								content: `Research the response patterns for: ${model.id} (${model.name})`,
							},
						],
					})

					console.log({ gen })

					if (gen.text) {
						await ctx.runMutation(internal.models.update, {
							id: model.id,
							analysis: gen.text,
						})
					}

					return {
						modelId: model.id,
						modelName: model.name,
						research: gen.text,
					}
				})
			)

			console.log('Research results:', researchResults)

			const { object } = await generateObject({
				model: 'openai/gpt-5',
				system: `Based on research about multiple AI models, create a concise comparison focused on how to tell them apart.

Extract only the MOST DISTINCTIVE patterns for each model - the quirks and tells that would help someone playing a guessing game identify which model they're talking to.

Keep the comparison practical and actionable. Focus on observable differences, not general capabilities.`,
				schema: z.object({
					models: z.array(
						z.object({
							id: z.string().describe('The model id'),
							patterns: z.string().describe("Exhaustive list of the model's response patterns"),
							sources: z.array(z.string().url()),
						})
					),
					comparison: z.string().describe('The comparison of the models'),
				}),
				messages: researchResults.map((r) => ({
					role: 'user',
					content: `${r.modelName} (${r.modelId}):\n${r.research}`,
				})),
			})

			console.log(object)
			return object
		} catch (error) {
			console.error(error)
		}
	},
})
