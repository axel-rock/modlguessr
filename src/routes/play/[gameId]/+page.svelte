<script lang="ts">
	import { useConvexClient, useQuery } from 'convex-svelte'
	import type { PageProps } from './$types'
	import { page } from '$app/state'
	import { api } from '$convex/api'
	import type { Doc, Id } from '$convex/dataModel'
	import { PUBLIC_CONVEX_SITE_URL } from '$env/static/public'
	import { DefaultChatTransport, type UIMessage } from 'ai'
	import { Chat } from '@ai-sdk/svelte'
	import { untrack } from 'svelte'
	import { marked } from 'marked'
	import { flip } from 'svelte/animate'
	import { sineIn, sineInOut, sineOut } from 'svelte/easing'
	import { MODEL_SETS } from '$lib/models'
	import { fade, fly, slide } from 'svelte/transition'

	let { data }: PageProps = $props()

	const query = $derived(
		useQuery(api.games.get, {
			gameId: page.params.gameId as Id<'games'>,
		})
	)

	let game = $state<typeof query.data | undefined>(undefined)
	const roundNumber = $derived(game?.rounds.length ?? 0)
	const roundIndex = $derived(roundNumber - 1)
	const round = $derived(game?.rounds[roundIndex])

	$effect(() => {
		if (query.data) {
			game = query.data
		}
	})

	const convex = useConvexClient()

	let input = $state('')

	// Create a custom transport that goes to Convex
	const transport = $derived(
		new DefaultChatTransport({
			body: {
				gameId: page.params.gameId,
				roundIndex,
			},
			api: `${PUBLIC_CONVEX_SITE_URL}/game-stream`,
			headers: {
				'Content-Type': 'application/json',
			},
		})
	)

	// TODO: This doesn't work for watchers (messages don't update). Maybe only create the chat on submit? Otherwise show messages from DB?
	const initialMessages = $derived(
		page.params.gameId && roundNumber ? untrack(() => round?.messages) : []
	)

	$effect(() => {
		$inspect.trace()
		console.log({ transport, roundIndex, initialMessages })
	})

	const chat = $derived(
		new Chat({
			transport,
			messages: initialMessages,
			id: page.params.gameId + '-' + roundIndex,
		})
	)

	const messages = $derived(chat.messages)

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault()

		// Use the AI SDK Chat to send the message
		await chat.sendMessage({ text: input })
	}

	/** Clear the input if the last message is the user's message */
	$effect(() => {
		if (messages.at(-1)?.role === 'user' && messages.at(-1)?.parts[0]?.text === input) {
			input = ''
		}
	})

	async function pick(model: string) {
		const result = await convex.mutation(api.games.pick, {
			gameId: page.params.gameId as Id<'games'>,
			roundIndex,
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

<main id="chat">
	<small>Round #{roundNumber}</small>
	{#if messages.length === 0 && chat.status === 'ready'}
		<h1 class="hero" out:fly={{ y: -50, duration: 200, easing: sineOut }}>
			Ask me anything to guess who I am!
		</h1>
	{:else}
		<ul in:fly={{ y: 50, duration: 200, delay: 200, easing: sineIn }}>
			{#each messages as message}
				<li>
					<div class="message-header">
						<span class="role">{message.role === 'user' ? 'You' : 'AI'}</span>
						<span class="timestamp">{new Date().toLocaleTimeString()}</span>
					</div>
					<div class="message-content">
						{#each message.parts as part, partIndex (partIndex)}
							{#if part.type === 'text' && part.text}
								<div>{@html marked(part.text)}</div>
							{/if}
						{/each}
					</div>
				</li>
			{/each}
		</ul>
	{/if}
	<div id="actions">
		<menu id="vote">
			{#each round?.models ?? MODEL_SETS.easy[0] as model (model)}
				{@const provider = model.split('/')[0]}
				{@const name = model.split('/')[1]}
				<button
					type="submit"
					class="secondary"
					name="model"
					animate:flip={{ duration: 250, easing: sineInOut }}
					onclick={() => pick(model)}
				>
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
			<button type="submit" class="primary" disabled={chat.status !== 'ready'}
				>Send / {chat.status}</button
			>
		</form>
	</div>
</main>

<style>
	main {
		display: flex;
		flex-flow: column nowrap;
		width: min(var(--narrow-page), 100%);
		height: 100%;
		justify-self: center;
	}

	#actions {
		position: sticky;
		bottom: 0;
		background-color: var(--grey-0);
		margin-top: auto;
		padding: 1rem 0;
		display: grid;
		gap: 1rem;
	}

	menu#vote {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		grid-template-columns: 1fr; /* mobile first: 1 column */
		gap: 1rem;
		margin-top: auto;

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

	form#message {
		display: grid;
		grid-template-columns: 1fr auto auto;
		align-items: end;
		box-sizing: border-box;
		justify-self: stretch;
		/* margin-inline: -2rem; */
	}
</style>
