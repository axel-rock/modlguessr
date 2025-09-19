<script lang="ts">
	import { useConvexClient, useQuery } from 'convex-svelte'
	import type { PageProps } from './$types'
	import { page } from '$app/state'
	import { api } from '$convex/api'
	import type { Id } from '$convex/dataModel'
	import { Chat } from '@ai-sdk/svelte'
	import { DefaultChatTransport } from 'ai'

	let { data }: PageProps = $props()

	const game = useQuery(api.games.get, {
		gameId: page.params.gameId as Id<'games'>,
	})

	const convex = useConvexClient()

	let round = $derived(game.data?.rounds.at(-1))

	const transport = $derived(new DefaultChatTransport({ api: `./${page.params.gameId}` }))

	let input = $state('')
	const chat = $derived(new Chat({ transport }))

	function handleSubmit(event: SubmitEvent) {
		event.preventDefault()
		chat.sendMessage({ text: input })
		input = ''
	}

	async function pick(model: string) {
		const result = await convex.mutation(api.games.pick, {
			gameId: page.params.gameId as Id<'games'>,
			model,
		})
		console.log({ result })
		if (result.success) {
			alert('You picked the correct model!')
		} else {
			alert('You picked the wrong model!')
		}
	}
</script>

{#if round}
	<div id="game">
		<div id="chat">
			<ul>
				{#each chat.messages as message, messageIndex (messageIndex)}
					<li>
						<div>{message.role}</div>
						<div>
							{#each message.parts as part, partIndex (partIndex)}
								{#if part.type === 'text'}
									<div>{part.text}</div>
								{/if}
							{/each}
						</div>
					</li>
				{/each}
			</ul>
			<menu id="vote">
				{#each round.models as model}
					{@const provider = model.split('/')[0]}
					{@const name = model.split('/')[1]}
					<button type="submit" class="secondary" name="model" onclick={() => pick(model)}>
						<img src="/logo/{provider}.svg" alt={provider} />
						<span class="name">{name}</span>
						<span class="provider">{provider}</span>
					</button>
				{/each}
			</menu>
			<form id="message" onsubmit={handleSubmit}>
				<textarea
					name="message"
					id="message"
					placeholder="Type your message here..."
					onkeydown={(event: KeyboardEvent) => {
						// Use a Slack-like submit behaviour: "Enter" submits. Any combo of Enter + CTRL, Shift, Alt will jump a line instead
						const form = (event.target as HTMLElement).closest('form') as HTMLFormElement
						if (event.key === 'Enter' && !event.altKey && !event.shiftKey && !event.metaKey) {
							event.stopPropagation()
							event.preventDefault()
							form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }))
						}
					}}
					bind:value={input}
				></textarea>
				<button type="submit" class="primary">Send</button>
			</form>
		</div>
	</div>
{/if}

<style>
	menu#vote {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		grid-template-columns: 1fr; /* mobile first: 1 column */
		gap: 1rem;

		button {
			display: grid;
			grid-template-columns: 2rem 1fr;

			text-align: start;
			justify-content: start;
			gap: 0.25rem 0.5rem;

			img {
				aspect-ratio: 1;
				object-fit: contain;
				grid-row: span 2;
			}

			.provider {
				font-size: 0.75rem;
				opacity: 0.5;
			}
		}
	}

	@media (min-width: 480px) {
		menu#vote {
			grid-template-columns: repeat(2, 1fr); /* tablet: 2 columns */
		}
	}

	@media (min-width: 768px) {
		menu#vote {
			grid-template-columns: repeat(4, 1fr); /* desktop: 4 columns */
		}
	}
	#chat {
		width: min(var(--narrow-page), 100%);
		justify-self: center;

		form#message {
			display: grid;
			grid-template-columns: 1fr auto auto;
			align-items: end;
			box-sizing: border-box;
			justify-self: stretch;
			padding: 1rem 0;
			/* margin-inline: -2rem; */
			position: sticky;
			bottom: 0;
		}
	}
</style>
