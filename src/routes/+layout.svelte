<script lang="ts">
	import favicon from '$lib/assets/favicon.svg'
	import { createSvelteAuthClient } from '@mmailaender/convex-better-auth-svelte/svelte'
	import { authClient } from '$lib/auth'
	import '$lib/css/style.css'
	import { useConvexClient, useQuery } from 'convex-svelte'
	import { api } from '$convex/api'
	import type { User } from 'better-auth'
	import { goto, invalidateAll } from '$app/navigation'
	import { setContext } from 'svelte'
	import type { Doc } from '$convex/dataModel.js'
	import { context } from '$lib/context.svelte'
	import { page } from '$app/state'
	import Footer from '../lib/components/Footer.svelte'

	let { data, children } = $props()
	createSvelteAuthClient({ authClient })
	const convex = useConvexClient()

	let userQuery = useQuery(api.auth.getCurrentUser, {})
	let user = $derived(userQuery.data)

	let ticketsQuery = useQuery(api.tickets.get, {})
	let tickets = $derived(ticketsQuery.data)

	$effect(() => {
		if (!user) return (tickets = undefined)
		convex.action(api.tickets.refresh, {})
	})

	$effect(() => {
		// @ts-expect-error
		context.user = user
	})
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<header>
	<h1>
		<a href="/"> ModlGuessr </a>
	</h1>
	<button
		id="play"
		class="primary"
		onclick={async () => {
			const gameId = await convex.action(api.games.create, {
				game: {
					mode: 'simple',
					difficulty: 'easy',
				},
			})
			goto(`/play/${gameId}`)
		}}
	>
		<img src="/images/play.svg" alt="Play" />
	</button>
	<nav>
		{#if !!tickets}
			<span>{tickets} tickets</span>
		{/if}
		<a href="/leaderboard">Leaderboard</a>
		<a href="/pricing">Pricing</a>

		{#if user}
			<button id="user-menu-button" class="link auth" popovertarget="user-menu">
				<img src={user.image} alt={user.name} referrerPolicy="no-referrer" />
			</button>
		{:else}
			<button
				class="link auth"
				onclick={async () => {
					await authClient.signIn.social({ provider: 'google' })
				}}>Sign in with Google</button
			>
		{/if}
	</nav>
</header>

{#if user}
	<menu id="user-menu" popover="auto">
		<a
			href="/settings"
			role="button"
			onclick={(event) => {
				const link = event.target as HTMLAnchorElement
				const popover = link.closest('[popover="auto"]') as HTMLElement
				popover.hidePopover()
			}}>Settings</a
		>
		<button
			onclick={async () => {
				await authClient.signOut()
				// sessionUser = undefined
				await invalidateAll()
				// goto('/', { invalidateAll: true })
			}}>Sign out</button
		>
	</menu>
{/if}

{@render children?.()}

{#if !page.route.id?.startsWith('/play')}
	<Footer />
{/if}

<style>
	header {
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		align-items: center;
		justify-content: space-between;

		h1 {
			a {
				display: grid;
				align-items: center;
			}
		}

		nav {
			display: flex;
			align-items: center;
			gap: 0.5rem;
		}

		.auth {
			display: flex;
			align-items: center;
			gap: 0.25rem;
			img {
				width: 1.5rem;
				height: 1.5rem;
				object-fit: cover;
				border-radius: 50%;
			}
		}
	}

	#play {
		font-weight: 600;
		/* background: linear-gradient(90deg, #33caff, #8169ff 25%, #ff7fe5 50%, #ffe475 70%, #2fffe7); */
		background-color: unset;
		transition: all 0.1s ease;
		&:hover {
			scale: 1.05;
		}
	}

	#user-menu-button {
		anchor-name: --user-menu-button;
		position: relative;
	}

	menu#user-menu {
		position: absolute;
		position-anchor: --user-menu-button;
		position-area: bottom span-left;
		margin: 0;
		inset: auto;

		/* Reset popover styles */
		border: none;

		margin-top: 0.5rem;

		background-color: var(--grey-50);

		/* Animate in from the top */
		animation: slide-in 0.1s ease-out;
	}

	@keyframes slide-in {
		from {
			transform: translateY(-50%);
			opacity: 0;
		}
		to {
			transform: translateY(0);
			opacity: 1;
		}
	}
</style>
