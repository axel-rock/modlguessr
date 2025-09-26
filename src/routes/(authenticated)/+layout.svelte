<script lang="ts">
	import type { LayoutProps } from './$types'
	import { useQuery } from 'convex-svelte'
	import { api } from '$convex/api'
	import { page } from '$app/state'
	import { goto } from '$app/navigation'

	let { children }: LayoutProps = $props()

	let userQuery = useQuery(api.auth.getCurrentUser, {})

	$effect(() => {
		if (userQuery.data === null) goto('/login?redirect=' + page.url.pathname)
	})
</script>

{#if userQuery.isLoading}
	<main id="loading">
		<p>Loading...</p>
	</main>
{:else if userQuery.data}
	{@render children()}
{/if}

<style>
	main {
		display: grid;
		place-items: center;
	}
</style>
