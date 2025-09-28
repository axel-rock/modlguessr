<script lang="ts">
	import { useConvexClient, useQuery } from 'convex-svelte'
	// import type { PageProps } from './$types'
	import { api } from '$convex/api'
	import { goto } from '$app/navigation'
	import { formatDateRelative } from '$lib/utils/intl.svelte'

	// let { data }: PageProps = $props()
	const convex = useConvexClient()

	async function createGame(difficulty: 'easy' | 'medium' | 'hard') {
		const gameId = await convex.action(api.games.create, {
			game: {
				mode: 'simple',
				difficulty,
			},
		})
		goto(`/play/${gameId}`)
	}

	const unfinishedGamesQuery = useQuery(api.games.list, {})
	const unfinishedGames = $derived(
		unfinishedGamesQuery.data?.filter((game) => !game.ended_at) ?? []
	)
</script>

<main>
	<h1 class="hero">Difficulty</h1>
	<menu id="difficulties">
		<li>
			<article id="easy">
				<h2>Easy</h2>
				<button onclick={() => createGame('easy')}>Play</button>
				<p>Play with a selection of known models, and a flexible system prompt.</p>
			</article>
		</li>
		<li>
			<article id="medium">
				<h2>Medium</h2>
				<button onclick={() => createGame('medium')}>Play</button>
				<p>Wider selection of models, more difficult system prompt.</p>
			</article>
		</li>
		<li>
			<article id="hard">
				<h2>Hard</h2>
				<button onclick={() => createGame('hard')}>Play</button>
				<p>All the models, completely random, super strict system prompt.</p>
			</article>
		</li>
	</menu>

	{#if unfinishedGames.length > 0}
		<hr />

		<h2 class="hero">Pick up where you left off</h2>
		<menu class="unfinished-games">
			{#each unfinishedGames as game}
				<li>
					<a href={`/play/${game._id}`}
						>{game.difficulty} - {formatDateRelative(game._creationTime ?? 0)} - Round #{game.rounds
							.length} - Score: {game.score ?? 0}</a
					>
				</li>
			{/each}
		</menu>
	{/if}
</main>

<style>
	main {
		display: grid;
		place-items: center;
	}

	menu#difficulties {
		display: grid;
		width: min(var(--narrow-page), 100%);
		gap: 1rem;
		justify-content: stretch;

		#easy {
			--bg: var(--blue);
			--color: #000;
		}

		#medium {
			--bg: var(--yellow);
			--color: #000;
		}

		#hard {
			--bg: var(--pink);
			--color: #fff;
		}

		li {
			display: contents;

			/* Difficulty */
			article {
				border: solid 1px color-mix(in oklab, var(--bg) 100%, transparent);
				display: grid;
				grid-template-columns: 1fr auto;
				gap: 1rem;
				align-items: center;
				padding: 1rem 1.5rem;
				border-radius: 1rem;
				position: relative;

				* {
					margin: 0;
				}

				p {
					grid-column: 1 / -1;
					text-wrap: pretty;
				}

				&:hover {
					background-color: color-mix(in oklab, var(--bg) 100%, transparent);
					* {
						color: var(--color);
					}
				}

				button::before {
					content: '';
					display: block;
					inset: 0;
					position: absolute;
				}
			}
		}
	}

	menu.unfinished-games {
		display: grid;
		grid-template-columns: 1fr;
		gap: 1rem;

		/* Unfinished games */
		a {
			text-transform: capitalize;
			font-size: 1.25rem;
		}
	}
</style>
