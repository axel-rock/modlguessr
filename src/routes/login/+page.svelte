<script lang="ts">
	import { useQuery } from 'convex-svelte'
	import { api } from '$convex/api'
	import { page } from '$app/state'
	import { authClient } from '$lib/auth'
	import type { PageProps } from './$types'
	import { goto } from '$app/navigation'
	import { context } from '$lib/context.svelte'

	let { data }: PageProps = $props()

	let userQuery = useQuery(api.auth.getCurrentUser, {})
	let redirect = page.url.searchParams.get('redirect') ?? '/'

	const lastMethod = authClient.getLastUsedLoginMethod()

	console.log(lastMethod)

	$effect(() => {
		console.log('userQuery.data', userQuery.data, redirect)
		if (userQuery.data) goto(redirect)
	})

	$effect(() => {
		if (context.user) goto(redirect)
	})
</script>

<main>
	<!--  -->

	<menu>
		<li>
			<button
				class="link auth"
				onclick={async () => {
					await authClient.signIn.social({ provider: 'google' })
				}}
				><img src="/logo/google.svg" alt="Google" /><span>Sign in with Google</span>
				{#if lastMethod === 'google'}
					<span class="pill">Last used</span>
				{/if}
			</button>
		</li>
		<li>
			<button
				class="link auth"
				onclick={async () => {
					await authClient.signIn.social({ provider: 'github' })
				}}
				><img src="/logo/github.svg" alt="GitHub" /><span>Sign in with GitHub</span>
				{#if lastMethod === 'github'}
					<span class="pill">Last used</span>
				{/if}
			</button>
		</li>
	</menu>
</main>

<style>
	main {
		display: grid;
		place-items: center;
	}

	menu {
		display: grid;
		grid-template-columns: 3rem 1fr auto;
		gap: 0.5rem;

		li {
			display: contents;
		}
	}

	button.auth {
		display: grid;
		align-items: center;
		grid-template-columns: subgrid;
		grid-column: 1 / -1;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		border-radius: 0.5rem;
		border: 1px solid var(--grey-100);
		transition: all 0.1s ease;
		position: relative;

		&:hover {
			background-color: var(--grey-100);
			color: var(--grey-900);
		}

		img {
			width: 100%;
			aspect-ratio: 1;
			object-fit: cover;
			border-radius: 50%;

			@media (prefers-color-scheme: dark) {
				&[src*='github'] {
					filter: invert(1);
				}
			}
		}

		.pill {
			position: absolute;
			width: max-content;
			height: max-content;
			left: calc(100% + 0.5rem);
			top: 50%;
			transform: translateY(-50%);
		}
	}
</style>
