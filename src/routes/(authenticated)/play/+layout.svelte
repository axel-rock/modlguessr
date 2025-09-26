<script lang="ts">
	import { useQuery } from 'convex-svelte'
	import type { LayoutProps } from './$types'
	import { api } from '$convex/api'
	import { goto } from '$app/navigation'
	import { page } from '$app/state'

	let { data, children }: LayoutProps = $props()

	let userQuery = useQuery(api.auth.getCurrentUser, {})

	/* User must have a username to play */
	$effect(() => {
		if (userQuery.data && !userQuery.data.username) goto('/settings?redirect=' + page.url.pathname)
	})
</script>

{#if userQuery.data}
	{@render children()}
{:else}
	<main>
		<p>Loading...</p>
	</main>
{/if}

<style>
	main {
		display: grid;
		place-items: center;
	}
</style>
