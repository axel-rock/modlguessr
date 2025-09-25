<script lang="ts">
	import { api } from '$convex/api'
	import { useQuery } from 'convex-svelte'
	import { expoInOut } from 'svelte/easing'
	import { Tween } from 'svelte/motion'

	// let { data } = $props()

	const tokensQuery = useQuery(api.stats.tokens, {})

	let tokens = $state(new Tween(0, { duration: 5000, easing: expoInOut }))

	$effect(() => {
		const count = tokensQuery.data?.total ?? 0
		if (tokens.current === 0 && count !== 0)
			tokens = new Tween(count, { duration: 5000, easing: expoInOut })
		else tokens.set(count)
	})
</script>

<main>
	<h1 class="hero">Can you guess the model?</h1>

	<p>
		Can you guess which model you're talking to? They are instructed to not reveal this information,
		so you'll have to find some little clues here and there or use your best prompt engineering
		techniques. Bonus points if you manage to force them to tell you who they are.
	</p>

	{#if tokensQuery.data}
		{@const total = new Intl.NumberFormat('fr-FR', {
			notation: 'standard',
		}).format(~~tokens.current)}
		<p>Total tokens: <output>{total}</output></p>
	{/if}
</main>

<style>
	output {
		font-variant-numeric: tabular-nums;
	}
</style>
