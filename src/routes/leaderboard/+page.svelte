<script lang="ts">
	import type { PageProps } from './$types'

	let { data }: PageProps = $props()
</script>

<main>
	<h1>Leaderboard</h1>
</main>

<style>
	main {
		width: min(var(--narrow-page), 100%);
		justify-self: center;
		background-color: #ffd600;
		color: #000;

		& > * {
			color: inherit;
		}
	}
</style>
