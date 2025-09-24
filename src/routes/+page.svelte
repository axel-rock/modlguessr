<script lang="ts">
	import { api } from '$convex/api'
	import { useQuery } from 'convex-svelte'
	import { linear } from 'svelte/easing'
	import { Tween } from 'svelte/motion'

	// let { data } = $props()

	const tokensQuery = useQuery(api.stats.tokens, {})

	let tokens = $state(new Tween(0, { duration: 5000, easing: linear }))

	$effect(() => {
		const count = tokensQuery.data?.total ?? 0
		if (tokens.current === 0 && count !== 0)
			tokens = new Tween(count, { duration: 5000, easing: linear })
		else tokens.set(count)
	})
</script>

<main>
	<h1 class="hero">Can you guess the model?</h1>

	{#if tokensQuery.data}
		<p>Total tokens: {tokens.current.toFixed(0)}</p>
	{/if}
</main>
