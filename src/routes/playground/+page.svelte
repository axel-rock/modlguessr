<script lang="ts">
	import type { PageProps } from './$types'
	import { formatPrice } from '$lib/utils/intl.svelte'
	import { useConvexClient } from 'convex-svelte'
	import { api } from '$convex/api'

	const convex = useConvexClient()

	let { data }: PageProps = $props()
</script>

<main>
	<!-- <ul>
		{#each data.models as model}
			{@const input = Number(model.pricing?.input ?? 0) * 1_000_000}
			{@const output = Number(model.pricing?.output ?? 0) * 1_000_000}
			<li>
				<b class="name">{model.id}</b>
				<span class="pricing">{formatPrice(input)}/m | {formatPrice(output)}/m</span>
				<span class="description">{model.description?.slice(0, 5000)}</span>
			</li>
		{/each}
	</ul> -->
</main>
