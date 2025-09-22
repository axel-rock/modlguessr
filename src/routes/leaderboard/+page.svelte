<script lang="ts">
	import type { PageProps } from './$types'

	let { data }: PageProps = $props()
</script>

<main id="leaderboard">
	<div class="wrapper">
		<h1 class="hero">Leaderboard</h1>
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
