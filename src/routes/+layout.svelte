<script lang="ts">
	import { PUBLIC_CONVEX_URL } from '$env/static/public'
	import { setupConvex } from 'convex-svelte'
	import favicon from '$lib/assets/favicon.svg'
	import '$lib/css/style.css'

	let { children } = $props()

	setupConvex(PUBLIC_CONVEX_URL)
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<header>
	<h1>
		<a href="/">ModlGuessr</a>
	</h1>
	<nav>
		<a href="/leaderboard">Leaderboard</a>
		<a href="/about">About</a>
		<a href="/blog">Devblog</a>
	</nav>
</header>

<main>
	{@render children?.()}
</main>

<footer>
	<div class="tools">
		<span>Powered by:</span>
		<a href="https://svelte.dev/" target="_blank">
			<img src="/logo/svelte.svg" alt="Svelte" />
			<span>SvelteKit</span></a
		>
		<a href="https://www.convex.dev/" target="_blank">
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
	</div>
</footer>

<style>
	.tools {
		display: grid;
		grid-template-columns: auto 1fr;
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

			img {
				width: 2rem;
				height: 2rem;
				object-fit: contain;
			}
		}
	}
</style>
