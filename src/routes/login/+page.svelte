<script lang="ts">
	import { useQuery } from 'convex-svelte'
	import { api } from '$convex/api'
	import { page } from '$app/state'
	import { authClient } from '$lib/auth'
	import type { PageProps } from './$types'
	import { goto } from '$app/navigation'

	let { data }: PageProps = $props()

	let userQuery = useQuery(api.auth.getCurrentUser, {})
	let redirect = page.url.searchParams.get('redirect') ?? '/'

	$effect(() => {
		if (userQuery.data) goto(redirect)
	})
</script>

<main>
	<!--  -->

	<button
		class="link auth"
		onclick={async () => {
			await authClient.signIn.social({ provider: 'google' })
		}}>Sign in with Google</button
	>
</main>

<style>
	main {
		display: grid;
		place-items: center;
	}
</style>
