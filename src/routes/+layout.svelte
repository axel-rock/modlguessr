<script lang="ts">
	import favicon from '$lib/assets/modlguessr.svg'
	import play from '$lib/assets/play.svg?raw'
	import { createSvelteAuthClient } from '@mmailaender/convex-better-auth-svelte/svelte'
	import { authClient } from '$lib/auth'
	import '$lib/css/style.css'
	import { useConvexClient, useQuery } from 'convex-svelte'
	import { api } from '$convex/api'
	import { invalidateAll } from '$app/navigation'
	import { context } from '$lib/context.svelte'
	import { page } from '$app/state'
	import Footer from '../lib/components/Footer.svelte'
	import { useSearchParams } from 'runed/kit'
	import z from 'zod'
	// import Toast from '$lib/components/Toast.svelte'

	let { data, children } = $props()
	createSvelteAuthClient({ authClient })
	const convex = useConvexClient()
	const params = useSearchParams(z.object({ message: z.string().optional() }))

	let userQuery = useQuery(api.auth.getCurrentUser, {})
	let user = $derived(userQuery.data)

	let ticketsQuery = useQuery(api.tickets.get, {})
	let tickets = $derived(ticketsQuery.data)

	$effect(() => {
		if (!user) return (tickets = undefined)
		convex.action(api.tickets.refresh, {})
	})

	$effect(() => {
		context.user = user
		context.tickets = tickets
	})

	async function billingPortal() {
		const { data } = await convex.action(api.autumn.billingPortal, {
			returnUrl: page.url.href,
		})
		if (data?.url) window.location.href = data.url
	}
</script>

<svelte:head>
	<title>ModlGuessr</title>
	<link rel="icon" href={favicon} />
</svelte:head>

{#if page.url.searchParams.has('message')}
	<div id="message">
		<span>{page.url.searchParams.get('message')}</span>
		<button onclick={() => params.reset()}>Close</button>
	</div>
{/if}

{#if page.route.id !== '/(authenticated)/play/[gameId]'}
	<header>
		<nav>
			<a href="/">ModlGuessr</a>
			<a href="/leaderboard">Leaderboard</a>
		</nav>
		<a href="/play" id="play">
			{@html play}
		</a>
		<nav>
			{#if typeof tickets === 'number'}
				<span>{tickets} ticket{tickets === 1 ? '' : 's'}</span>
			{/if}
			<a href="/pricing">Pricing</a>

			{#if user}
				<button id="user-menu-button" class="link auth" popovertarget="user-menu">
					<img src={user.image} alt={user.name} referrerPolicy="no-referrer" />
				</button>
			{:else}
				<a href="/login">Sign in</a>
			{/if}
		</nav>
	</header>
{/if}

{#if user}
	<menu id="user-menu" popover="auto">
		<li>
			<button class="link" onclick={async () => billingPortal()}>Billing Portal</button>
		</li>
		<li>
			<a
				href="/settings"
				onclick={(event) => {
					const link = event.target as HTMLAnchorElement
					const popover = link.closest('[popover="auto"]') as HTMLElement
					popover.hidePopover()
				}}>Settings</a
			>
		</li>
		<li>
			<button
				class="link"
				onclick={async () => {
					await authClient.signOut()
					await invalidateAll()
				}}>Sign out</button
			>
		</li>
	</menu>
{/if}

{@render children?.()}

<!-- Don't show footer on play page, the chat textarea takes up the bottom space -->
{#if page.route.id !== '/(authenticated)/play/[gameId]'}
	<Footer />
{/if}

<!-- <Toast /> -->

<style>
	#message {
		display: grid;
		grid-template-columns: 1fr auto;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: 0.5rem 2rem;
		background-color: var(--grey-900);
		color: var(--grey-0);

		button {
			color: var(--grey-0);
		}
	}

	header {
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		align-items: center;

		a[href='/'] {
			font-weight: 900;
			font-size: 1.25rem;
			&:hover {
				color: var(--blue);
			}
		}

		a[href='/leaderboard']:hover {
			color: var(--yellow);
		}
		a[href='/pricing']:hover {
			color: var(--pink);
		}

		nav {
			display: grid;
			align-items: center;
			gap: 0.5rem 1rem;

			&:last-child {
				justify-self: end;
				grid-template-columns: auto 1fr;
				justify-items: end;
				button:has(img) {
					grid-row: 1 / span 2;
					grid-column: 2;
				}
			}
		}

		@media (min-width: 600px) {
			nav {
				display: flex;
				align-items: center;
				gap: 0.5rem;
			}
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
		display: grid;
		place-items: center;
		transition: all 0.1s ease;
		&:hover {
			scale: 1.05;
		}
	}

	#user-menu-button {
		anchor-name: --user-menu-button;
	}

	menu#user-menu {
		position: absolute;
		position-anchor: --user-menu-button;
		position-area: bottom span-left;
		margin: 0;
		inset: auto;
		padding: 1rem;

		/* Reset popover styles */
		border: none;

		margin-top: 0.5rem;

		background-color: var(--grey-50);

		/* Animate in from the top */
		animation: slide-in 0.1s ease-out;

		&:popover-open {
			display: grid;
			gap: 0.5rem;
		}
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
