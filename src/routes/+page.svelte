<script lang="ts">
	import { api } from '$convex/api'
	import { useQuery } from 'convex-svelte'
	import { untrack } from 'svelte'
	import { expoInOut } from 'svelte/easing'
	import { Tween } from 'svelte/motion'
	import InteractiveExample from './InteractiveExample.svelte'
	import play from '$lib/assets/play.svg?raw'
	// let { data } = $props()

	const tokensQuery = useQuery(api.stats.tokens, {})

	let tokens = $state(new Tween(0, { duration: 5000, easing: expoInOut }))

	$effect(() => {
		const count = tokensQuery.data?.total ?? 0
		if (untrack(() => tokens.current) === 0 && count !== 0)
			tokens = new Tween(count, { duration: 5000, easing: expoInOut })
		else tokens.set(count)
	})
</script>

<main id="home">
	<section>
		<h1 class="hero">Can you guess which AI is talking?</h1>
		<p>Chat with mystery AI models. Spot their tells. Beat the clock.</p>

		<InteractiveExample />

		<p class="center space">
			<a href="/play" role="button"> {@html play}</a>
		</p>
	</section>

	<section>
		<h2 class="hero">How it works</h2>

		<div class="grid">
			<div>
				<h3>1. Chat</h3>
				<p>Talk to a mystery AI with a secret personality</p>
			</div>
			<div>
				<h3>2. Detect</h3>
				<p>Find clues in how they talk and think</p>
			</div>
			<div>
				<h3>3. Guess</h3>
				<p>Pick the right model before time runs out</p>
			</div>
		</div>

		<p>
			Every AI has patterns. Some are obvious, others are subtle. The real fun is in the discovery.
		</p>
	</section>

	<section>
		<h2 class="hero">Live from the game</h2>
		<div class="grid">
			<div>
				<h3>
					{new Intl.NumberFormat(undefined, {
						notation: 'standard',
					}).format(~~tokens.current) ?? 0}
				</h3>
				<p>total tokens processed by our AI detective community</p>
			</div>
			<!-- <div>
				<h3>12</h3>
				<p>players currently solving mysteries</p>
			</div>
			<div>
				<h3>1,247</h3>
				<p>games completed by curious developers</p>
			</div> -->
		</div>
	</section>

	<section>
		<h2 class="hero">What players say</h2>
		<div>
			<blockquote>
				<p>"This is way more addictive than I expected. Now I analyze every AI response"</p>
				<footer>Jamie Turner, CEO at Convex</footer>
			</blockquote>
			<blockquote>
				<p>"Better than Wordle. Actually teaches you something useful about AI"</p>
				<footer>Bereket Engida, Creator of Better Auth</footer>
			</blockquote>
			<blockquote>
				<p>"My team keeps asking me to guess which model wrote our PRs now"</p>
				<footer>Sarah K., Senior Engineer</footer>
			</blockquote>
		</div>
	</section>

	<section>
		<h2 class="hero">Why I built this</h2>
		<p>
			I wanted to test real-time features and usage billing in a fun way. Turns out, the best way to
			learn a new backend stack is to build something people actually want to play.
		</p>

		<p>
			Plus, I was curious - can people really tell AIs apart? (Spoiler: it's harder than you think,
			but also more fun)
		</p>

		<p>
			This game uses real-time sync for live scoring, smooth authentication for instant play, and
			smart billing for usage tracking. All the boring backend stuff that makes the fun stuff
			possible.
		</p>
	</section>

	<section>
		<h2 class="hero">Ready to play?</h2>
		<p>Test your AI detective skills</p>

		<p>
			<a href="/play">{@html play}</a>
		</p>
	</section>
</main>

<style>
	section {
		&:not(:first-child) {
			padding-block: 4rem;
		}
	}

	p {
		text-align: center;
		max-width: 60ch;
		text-wrap: pretty;
		justify-self: center;
	}

	h2,
	h3 {
		text-align: center;
	}

	.grid > * {
		padding: 1rem;
		p:last-child {
			margin-bottom: 0;
		}

		&:hover {
			background-color: var(--grey-100);
			border-radius: 1rem;
		}
	}

	blockquote {
		footer {
			text-align: right;
			font-style: italic;
			opacity: 0.5;
		}
	}

	p {
		margin: 0 auto;
	}
	.space {
		margin-block: 2rem;
	}
</style>
