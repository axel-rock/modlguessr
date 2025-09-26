<script lang="ts">
	// import type { PageProps } from './$types'
	import { useConvexClient, useQuery } from 'convex-svelte'
	import { page } from '$app/state'
	import { api } from '$convex/api'
	import type { Id } from '$convex/dataModel'
	import { PUBLIC_CONVEX_SITE_URL } from '$env/static/public'
	import { DefaultChatTransport } from 'ai'
	import { Chat } from '@ai-sdk/svelte'
	import { untrack } from 'svelte'
	import { marked } from 'marked'
	import { flip } from 'svelte/animate'
	import { linear, sineIn, sineInOut, sineOut } from 'svelte/easing'
	import { MODEL_SETS } from '$lib/models'
	import { fly } from 'svelte/transition'
	import Score from './Score.svelte'
	import { type Game } from '$lib/zod/schema'
	import { Tween } from 'svelte/motion'
	import Timer from './Timer.svelte'
	import { MAX_ROUNDS } from '$lib/constants'
	import paperplane from '$lib/assets/paperplane.svg?raw'

	// let { data }: PageProps = $props()

	const query = $derived(
		useQuery(api.games.get, {
			gameId: page.params.gameId as Id<'games'>,
		})
	)

	let selected: string | undefined = $state(undefined)

	let game = $state<Game | undefined>(undefined)
	const roundNumber = $derived(game?.rounds.length ?? 0)
	const roundIndex = $derived(roundNumber - 1)
	const round = $derived(game?.rounds[roundIndex])

	const duration = 1000
	const total = new Tween(0, { duration: duration * 2, easing: linear, delay: duration * 5 })

	$effect(() => {
		if (query.data) {
			game = query.data
		}
	})

	$effect(() => {
		total.set(game?.score ?? 0)
	})

	$effect(() => {
		selected = round?.answer ?? undefined
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
		selected = model
		await convex
			.action(api.games.pick, {
				gameId: page.params.gameId as Id<'games'>,
				roundIndex,
				model,
			})
			.catch((error) => {
				console.error(error)
			})
	}
</script>

<main id="chat">
	<header>
		<small>Round #{roundNumber} - <Timer {round} /></small>
		<label id="total">Total: <output style="width: 6ch;">{total.current.toFixed(0)}</output></label>
	</header>
	{#if messages.length === 0 && chat.status === 'ready'}
		<h1 class="hero" out:fly={{ y: -50, duration: 200, easing: sineOut }}>
			Ask me anything to guess who I am!
		</h1>
	{:else}
		<ul id="messages" in:fly={{ y: 50, duration: 200, delay: 200, easing: sineIn }}>
			{#each messages as message}
				<li class="message {message.role}">
					{#each message.parts as part, partIndex (partIndex)}
						{#if part.type === 'text' && part.text}
							<div>{@html marked(part.text)}</div>
						{/if}
					{/each}
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
					class:selected={selected === model}
					class:correct={round?.model === model}
					class:incorrect={round?.answer === model && round?.model !== model}
					disabled={!game?.live ||
						round?.answer !== undefined ||
						(round?.messages?.length ?? 0) < 2}
				>
					<img src="/logo/{provider}.svg" alt={provider} />
					<span class="provider">{provider}</span>
					<span class="name">{name}</span>
				</button>
			{/each}
		</menu>

		{#if game && round && round.score}
			<Score {game} {round} />
			{#if game.ended_at}
				<div id="end-game">
					<a href="/leaderboard" role="button" class="primary">Leaderboard</a>
					<a href="/play" role="button" class="primary">Play again</a>
				</div>
			{:else}
				<button
					class="contrast"
					onclick={async () => {
						await convex.mutation(api.games.nextRound, {
							gameId: page.params.gameId as Id<'games'>,
						})
					}}>Next round</button
				>
			{/if}
		{:else}
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
				<button id="send" type="submit" disabled={chat.status !== 'ready' || !input}>Send</button>
			</form>
		{/if}
	</div>
</main>

<style>
	main {
		display: flex;
		flex-flow: column nowrap;
		width: min(var(--narrow-page), 100%);
		height: 100%;
		justify-self: center;

		header {
			display: flex;
			flex-flow: row nowrap;
			justify-content: space-between;
			align-items: center;
			gap: 1rem;
			font-size: 1.5rem;

			#total {
				display: flex;
				flex-flow: row nowrap;
				font-size: inherit;
				opacity: 1;

				output {
					padding: 0.25rem 0.5rem;
					background-color: var(--grey-200);
					border-radius: 2rem;
					position: relative;
					box-sizing: initial;
					display: inline-block;
					text-align: right;
					font-variant-numeric: tabular-nums;
				}
			}
		}
	}

	#messages {
		display: grid;
		list-style: none;
		padding: 0;
		margin: 0;

		.message {
			max-width: min(60ch, 85%);
			font-size: 1.2em;
			scroll-snap-align: start;
			scroll-snap-stop: always;
			letter-spacing: -0.02em;
			text-wrap: pretty;

			&.assistant {
				justify-self: start;
			}

			&.user {
				justify-self: end;
				color: var(--grey-600);
			}
		}
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

	#end-game {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
		gap: 1rem;

		a {
			text-align: center;

			&[href='/leaderboard'] {
				/* Leaderboard yellow */
				background-color: var(--yellow);
				color: #000;
			}
		}
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
			grid-template-columns: 2rem auto 1fr;
			font-size: 1.05em;
			text-align: start;
			gap: 0.25rem 0.5rem;
			padding: 0.5rem 1rem;
			border-radius: 3rem;
			--color: var(--grey-100);
			border: 1px solid var(--color);
			background-color: color-mix(in oklab, var(--color) 10%, transparent);

			&.selected {
				--color: var(--grey-200);
			}
			&.incorrect {
				--color: var(--red);
			}
			&.correct {
				--color: var(--green);
			}

			img {
				height: 2rem;
				aspect-ratio: 1;
				justify-self: center;
			}

			.name,
			.provider {
				white-space: nowrap;
				overflow: hidden;
				text-overflow: ellipsis;
			}

			.name {
				opacity: 0.5;
			}
		}
	}

	@media (min-width: 480px) {
		menu#vote {
			grid-template-columns: repeat(2, 1fr); /* tablet: 2 columns */
		}
	}

	form#message {
		display: grid;
		align-items: end;
		box-sizing: border-box;
		justify-self: stretch;
		position: relative;
		/* margin-inline: -2rem; */

		textarea {
			padding: 1rem 4rem 1rem 1.5rem;
		}

		#send {
			all: unset;
			position: absolute;
			right: 1rem;
			bottom: 1rem;
			font-size: 1rem;
			padding: 0;
			margin: 0;
			border: none;
			background-color: transparent;
			color: var(--grey-700);
			cursor: pointer;
			&:hover {
				color: var(--grey-900);
			}
			&:active {
				color: var(--grey-700);
			}
		}
	}
</style>
