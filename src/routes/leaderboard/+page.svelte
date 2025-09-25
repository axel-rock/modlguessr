<script lang="ts">
	import { useQuery } from 'convex-svelte'
	import type { PageProps } from './$types'
	import { api } from '$convex/api'
	import { flip } from 'svelte/animate'
	import { sineInOut } from 'svelte/easing'

	let { data }: PageProps = $props()

	// Get leaderboard for simple/easy mode
	// const leaderboard = await ctx.runQuery(api.leaderboard.getLeaderboard, {
	//   mode: "simple",
	//   difficulty: "easy",
	//   limit: 20
	// });

	// // Check a player's rank
	// const playerRank = await ctx.runQuery(api.leaderboard.getPlayerRank, {
	//   mode: "simple",
	//   difficulty: "easy",
	//   user_id: "user123"
	// });

	// // Get current configuration
	// const config = await ctx.runQuery(api.leaderboard.getConfig, {});

	let difficulty = $state('easy')
	let limit = $state(100)

	let leaderboardQuery = $derived(
		useQuery(api.games.getLeaderboard, {
			difficulty,
			limit,
		})
	)

	const fullLeaderboard = $derived(leaderboardQuery.data ?? [])

	const leaderboard = $derived(
		fullLeaderboard
		// .filter(
		// 	// @ts-expect-error
		// 	(entry, index, self) => self.findIndex((t) => t.user_id === entry.user_id) === index
		// )
	)
</script>

<main id="leaderboard">
	<div class="wrapper">
		<h1 class="hero">Leaderboard</h1>

		<ul>
			{#each leaderboard as entry (entry)}
				<li animate:flip={{ duration: 250, easing: sineInOut }}>
					{entry.user_id} - {entry.score}
				</li>
			{/each}
		</ul>
	</div>
</main>

<style>
	main {
		width: 100%;
		justify-self: center;
		background-color: #ffd600;
		color: #000;

		& > .wrapper {
			width: min(var(--narrow-page), 100%);
			justify-self: center;
		}

		* {
			color: inherit;
		}
	}
</style>
