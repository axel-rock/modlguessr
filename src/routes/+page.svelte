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
		Chat with mystery AI models and use your detective skills to figure out who you're talking to.
		They won't tell you directly, so you'll need to find those subtle clues and quirks that make
		each model unique.
	</p>

	{#if tokensQuery.data}
		{@const total = new Intl.NumberFormat(undefined, {
			notation: 'standard',
		}).format(~~tokens.current)}
		<h2>Total tokens: <output>{total}</output></h2>
	{/if}
</main>

<style>
	p {
		text-align: center;
		max-width: 60ch;
		text-wrap: pretty;
		justify-self: center;
	}

	output {
		font-variant-numeric: tabular-nums;
	}
</style>
