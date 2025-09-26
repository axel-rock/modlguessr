<script lang="ts">
	import { useQuery } from 'convex-svelte'
	import type { PageProps } from './$types'
	import { api } from '$convex/api'
	import { flip } from 'svelte/animate'
	import { sineInOut } from 'svelte/easing'

	let { data }: PageProps = $props()

	let difficulty = $state('easy')
	let limit = $state(100)

	let leaderboardQuery = $derived(
		useQuery(api.games.getLeaderboard, {
			difficulty,
			limit,
		})
	)

	const leaderboard = $derived(leaderboardQuery.data ?? [])
</script>

<main id="leaderboard">
	<div class="wrapper">
		<h1 class="hero">Leaderboard</h1>

		<menu>
			<li>
				<button onclick={() => (difficulty = 'easy')} class:selected={difficulty === 'easy'}
					>Easy</button
				>
			</li>
			<li>
				<button onclick={() => (difficulty = 'medium')} class:selected={difficulty === 'medium'}
					>Medium</button
				>
			</li>
			<li>
				<button onclick={() => (difficulty = 'hard')} class:selected={difficulty === 'hard'}
					>Hard</button
				>
			</li>
		</menu>

		<ul>
			{#if leaderboard.length === 0}
				<li>No entries</li>
			{/if}
			{#each leaderboard as entry, index (entry)}
				<li animate:flip={{ duration: 250, easing: sineInOut }}>
					<span class="rank">#{index + 1}</span>
					<img src={entry.user?.image} alt={entry.user?.displayUsername} />
					<span class="username">{entry.user?.displayUsername}</span>
					<span class="score">{entry.score}</span>
				</li>
			{/each}
		</ul>
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

		ul {
			display: grid;
			grid-template-columns: auto 2rem 1fr auto;
			font-size: 2rem;

			li {
				display: grid;
				grid-template-columns: subgrid;
				grid-column: 1 / -1;
				align-items: center;
				font-variant-numeric: tabular-nums;

				.rank {
					justify-self: end;
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
	}
</style>
