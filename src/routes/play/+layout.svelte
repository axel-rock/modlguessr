<script lang="ts">
	import { useQuery } from 'convex-svelte'
	import type { LayoutProps } from './$types'
	import { api } from '$convex/api'

	let { data, children }: LayoutProps = $props()

	let userQuery = useQuery(api.auth.getCurrentUser, {})
	let user = $derived(userQuery.data)
</script>

{#if userQuery.data}
	{@render children()}
{:else}
	<p>Loading...</p>
{/if}
