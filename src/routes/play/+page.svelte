<script lang="ts">
	import { useConvexClient } from 'convex-svelte'
	import type { PageProps } from './$types'
	import { api } from '$convex/api'
	import { goto } from '$app/navigation'

	// let { data }: PageProps = $props()
	const convex = useConvexClient()

	async function onclick(difficulty: 'easy' | 'medium' | 'hard') {
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
	<menu id="difficulties">
		<li><button onclick={() => onclick('easy')}>Easy</button></li>
		<li><button onclick={() => onclick('medium')}>Medium</button></li>
		<li><button onclick={() => onclick('hard')}>Hard</button></li>
	</menu>
</main>

<style>
	main {
		display: grid;
		place-items: center;
	}

	menu#difficulties {
		display: grid;
		gap: 1rem;
		justify-content: center;

		li {
			display: contents;
		}
	}
</style>
