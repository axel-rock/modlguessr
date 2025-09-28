<script lang="ts">
	import { useConvexClient } from 'convex-svelte'
	import type { PageProps } from './$types'
	import { api } from '$convex/api'
	import { goto } from '$app/navigation'

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
</style>
