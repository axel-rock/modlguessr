<script lang="ts">
	import { useQuery } from 'convex-svelte'
	import type { PageProps } from './$types'
	import { api } from '$convex/api'
	import { flip } from 'svelte/animate'
	import { sineInOut } from 'svelte/easing'
	import { formatDateRelative } from '$lib/utils/intl.svelte'

	let { data }: PageProps = $props()

	let difficulty = $state('easy')
	let limit = 100

	const leaderboardQueries = {
		easy: useQuery(api.leaderboard.get, {
			difficulty: 'easy',
			limit,
		}),
		medium: useQuery(api.leaderboard.get, {
			difficulty: 'medium',
			limit,
		}),
		hard: useQuery(api.leaderboard.get, {
			difficulty: 'hard',
			limit,
		}),
	}

	const leaderboard = $derived(
		leaderboardQueries[difficulty as keyof typeof leaderboardQueries].data ?? []
	)

	let recentGamesQuery = $derived(useQuery(api.games.list, {}))

	const recentGames = $derived(recentGamesQuery.data ?? [])
</script>

<main id="leaderboard">
	<div class="wrapper">
		<h1 class="hero">Leaderboard</h1>

		<menu>
			<li>
				<button
					onclick={() => (difficulty = 'easy')}
					class="big"
					class:selected={difficulty === 'easy'}>Easy</button
				>
			</li>
			<li>
				<button
					onclick={() => (difficulty = 'medium')}
					class="big"
					class:selected={difficulty === 'medium'}>Medium</button
				>
			</li>
			<li>
				<button
					onclick={() => (difficulty = 'hard')}
					class="big"
					class:selected={difficulty === 'hard'}>Hard</button
				>
			</li>
		</menu>

		<ul class="leaderboard">
			{#if leaderboard.length === 0}
				<li>No entries</li>
			{/if}
			{#each leaderboard as entry, index (entry)}
				<li animate:flip={{ duration: 250, easing: sineInOut }}>
					<span class="rank">#{index + 1}</span>
					<img
						src={entry.user?.image}
						alt={entry.user?.displayUsername}
						referrerPolicy="no-referrer"
					/>
					<span class="username">{entry.user?.displayUsername}</span>
					<span class="score">{entry.score}</span>
				</li>
			{/each}
		</ul>

		{#if recentGames?.length > 0}
			<hr />

			<h2 class="hero">Your latest games</h2>

			<ul class="recent-games">
				{#each recentGames as game}
					<li>
						<span class="difficulty">{game.difficulty}</span>
						<span class="ended_at">{formatDateRelative(game.ended_at ?? 0)}</span>
						<span class="score">{game.score}</span>
					</li>
				{/each}
			</ul>
		{/if}
	</div>
</main>

<style>
	main {
		width: 100%;
		justify-self: center;
		background-color: var(--yellow);
		color: #000;

		& > .wrapper {
			width: min(var(--narrow-page), 100%);
			justify-self: center;
		}

		menu {
			display: flex;
			flex-flow: row nowrap;
			justify-content: center;
			gap: 1rem;

			li {
				display: contents;

				button {
					&.selected {
						background-color: var(--grey-0) !important;
						color: var(--grey-900) !important;
					}
				}
			}
		}

		* {
			color: inherit;
		}

		ul.leaderboard,
		ul.recent-games {
			display: grid;
			grid-template-columns: auto 2rem 1fr auto;
			font-size: 2rem;

			&.leaderboard {
				grid-template-columns: auto 2rem 1fr auto;
			}
			&.recent-games {
				grid-template-columns: auto 1fr auto;
				li {
					gap: 1rem;
				}
			}

			li {
				display: grid;
				grid-template-columns: subgrid;
				grid-column: 1 / -1;
				align-items: center;
				font-variant-numeric: tabular-nums;

				.rank {
					justify-self: end;
				}

				.difficulty {
					text-transform: capitalize;
				}

				.ended_at {
					opacity: 0.3;
				}

				img {
					height: 2rem;
					aspect-ratio: 1;
					justify-self: center;
					border-radius: 1rem;
				}

				.username {
					white-space: nowrap;
					overflow: hidden;
					text-overflow: ellipsis;
				}
			}
		}

		.score {
			text-align: end;
		}
	}
</style>
