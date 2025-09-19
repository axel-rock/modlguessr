<script lang="ts">
	import favicon from '$lib/assets/favicon.svg'
	import { createSvelteAuthClient } from '@mmailaender/convex-better-auth-svelte/svelte'
	import { authClient } from '$lib/auth'
	import '$lib/css/style.css'
	import { useConvexClient, useQuery } from 'convex-svelte'
	import { api } from '$convex/api'
	import type { User } from 'better-auth'
	import { goto, invalidateAll } from '$app/navigation'
	import type { AutumnComponent } from '@useautumn/convex'

	let { data, children } = $props()
	createSvelteAuthClient({ authClient })
	const convex = useConvexClient()

	/**
	 * Fetching the session is currently much faster than useQuery in intial page load.
	 * This state is here to show the header faster, then replaced when useQuery is ready.
	 */
	// let sessionUser: User | undefined = $state(undefined)

	// data.session.then((session) => {
	// 	sessionUser = session?.user
	// })

	let userQuery = useQuery(api.auth.getCurrentUser, {})
	let user = $derived(userQuery.data)

	let tickets: number | undefined = $state(undefined)

	$effect(() => {
		if (!user) return (tickets = undefined)
		const check = convex
			.action(api.autumn.check, {
				featureId: 'tickets',
			})
			.then((check) => {
				console.log({ check })
				if (check.data?.balance && typeof check.data.balance === 'number')
					tickets = check.data.balance
				else tickets = undefined
			})
	})
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{#snippet userButton(user: Pick<User, 'image' | 'name'>)}
	<button id="user-menu-button" class="link auth" popovertarget="user-menu">
		<img src={user.image} alt={user.name} referrerPolicy="no-referrer" />
	</button>
{/snippet}

<header>
	<h1>
		<a href="/">ModlGuessr</a>
	</h1>
	<nav>
		<button
			class="primary"
			onclick={async () => {
				const gameId = await convex.mutation(api.games.create, {
					game: {
						mode: 'simple',
						difficulty: 'easy',
					},
				})
				goto(`/play/${gameId}`)
			}}>Play</button
		>
		{#if !!tickets}
			<span>{tickets} tickets</span>
		{/if}
		<a href="/leaderboard">Leaderboard</a>
		<a href="/pricing">Pricing</a>
		<a href="/about">About</a>
		<a href="/blog">Devblog</a>

		{#if user}
			{@render userButton(user)}
			<!-- {:else if sessionUser} -->
			<!-- {@const user = sessionUser} -->
			<!-- {@render userButton(user)} -->
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

<main>
	{@render children?.()}
</main>

<footer>
	<div class="tools">
		<span>Source code:</span>
		<a href="https://github.com/axel-rock/modlguessr" target="_blank">
			<img src="/logo/github.svg" alt="GitHub" />
			<span>GitHub</span>
		</a>
	</div>
	<div class="tools">
		<span>Powered by:</span>
		<a href="https://svelte.dev/" target="_blank">
			<img src="/logo/svelte.svg" alt="Svelte" />
			<span>SvelteKit</span></a
		>
		<a href="https://convex.dev/referral/AXELRO9828" target="_blank">
			<img src="/logo/convex.svg" alt="Convex" />
			<span>Convex</span></a
		>
		<a href="https://www.better-auth.com/" target="_blank">
			<img src="/logo/better-auth.svg" alt="Better Auth" />
			<span>Better Auth</span></a
		>
		<a href="https://useautumn.com/" target="_blank">
			<img src="/logo/autumn.png" alt="Autumn" />
			<span>Autumn</span></a
		>
		<a href="https://vercel.com/" target="_blank">
			<img src="/logo/vercel.svg" alt="Vercel" />
			<span>Vercel AI</span></a
		>
	</div>
</footer>

<style>
	header {
		display: flex;
		align-items: center;
		justify-content: space-between;

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

	footer {
		display: grid;
		grid-template-columns: auto auto;
		align-items: start;
		justify-content: space-evenly;
		gap: 1rem;

		background-color: var(--grey-50);

		.tools {
			--icon-size: 1.75rem;
			display: grid;
			grid-template-columns: var(--icon-size) 1fr;
			gap: 0.25rem;
			align-items: center;
			font-size: 0.85rem;

			& > span {
				grid-column: 1 / -1;
			}

			a {
				display: grid;
				grid-column: 1 / -1;
				grid-template-columns: subgrid;
				align-items: center;
				font-size: 0.85rem;

				/* Invert images in dark mode */

				img {
					width: 100%;
					aspect-ratio: 1;
					object-fit: contain;
					justify-self: center;
				}

				&[href*='vercel'] img {
					scale: 0.66;
				}

				&[href*='github'] img {
					scale: 0.8;
				}

				@media (prefers-color-scheme: dark) {
					&:is([href*='vercel'], [href*='better-auth']) img {
						filter: invert(1);
					}
				}
			}
		}
	}
</style>
