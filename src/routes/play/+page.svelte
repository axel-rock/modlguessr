<script lang="ts">
	import { useConvexClient } from 'convex-svelte'
	import type { PageProps } from './$types'
	import { api } from '$convex/api'

	let { data }: PageProps = $props()

	const convex = useConvexClient()

	const check = convex.action(api.autumn.check, {
		featureId: 'tickets',
	})
</script>

<h1>Play</h1>

{#await check then check}
	{JSON.stringify(check, null, 2)}
{/await}
