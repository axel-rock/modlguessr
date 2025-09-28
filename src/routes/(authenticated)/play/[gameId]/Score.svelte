<script lang="ts">
	import { DURATION } from '$lib/constants'
	import type { Game } from '$lib/zod/schema'
	import { linear } from 'svelte/easing'
	import { Tween } from 'svelte/motion'

	type Props = {
		game: Game
		round: Game['rounds'][number]
	}

	let { game, round }: Props = $props()

	const duration = 1000
	const timeLeft = new Tween(0, { duration, easing: linear })
	const streak = new Tween(0, { duration, easing: linear, delay: duration })
	const revealed = new Tween(0, { duration, easing: linear, delay: duration * 2 })
	const total = new Tween(0, { duration, easing: linear, delay: duration * 3 })

	$effect(() => {
		timeLeft.set(round.score?.timeLeft ?? 0)
		streak.set(round.score?.streak ?? 0)
		revealed.set(round.score?.revealed ?? 0)
		total.set(round.score?.total ?? 0)
	})
</script>

<div id="score" class:hidden={!round.score}>
	<span>Score:</span>
	<div id="calc">
		<output
			aria-labelledby="Time left in seconds"
			class:tweening={timeLeft.current !== timeLeft.target}
			style="width: 4ch;">{timeLeft.current.toFixed(0)}s</output
		>
		x
		<output aria-labelledby="Current streak multiplier. " name="streak" style="width: 2.5ch;"
			>{streak.current.toFixed(1)}</output
		>
		x
		<output
			aria-labelledby="x1.5 bonus for tricking the model into revealing its identity"
			style="width: 2.5ch;">{revealed.current.toFixed(1)}</output
		>
		=
		<output aria-labelledby="Score for this round" style="width: 4ch;"
			>{total.current.toFixed(0)}</output
		>
		<!-- TODO: Add flames if the score is great: https://rive.app/marketplace/4053-8400-green-flames/ -->
	</div>
</div>

<style>
	#score {
		display: flex;
		flex-flow: row wrap;
		justify-content: center;
		align-items: center;
		font-size: min(1.5rem, 4.75dvw);
		gap: 1rem;

		@media (min-width: 600px) {
			width: 100%;
			justify-content: space-between;
		}

		@media (max-width: 600px) {
			& > span {
				display: none;
			}
		}

		&.hidden {
			visibility: hidden;
		}
	}

	output {
		anchor-name: --output-label;
		padding: 0.25rem 0.5rem;
		background-color: var(--grey-900);
		color: var(--grey-0);
		border-radius: 2rem;
		position: relative;
		box-sizing: initial;
		display: inline-block;
		text-align: right;
		font-variant-numeric: tabular-nums;

		&.tweening {
			opacity: 0.5;
		}

		&:is([aria-labelledby]):is(:hover, :focus)::after {
			content: attr(aria-labelledby);
			display: block;
			text-align: initial;
			position: absolute;
			position-anchor: --output-label;
			position-area: top left;
			bottom: 3rem;
			right: 0;
			padding: 0.5rem 1rem;
			border-radius: 1rem;
			background-color: var(--yellow);
			color: #000;
			text-wrap: pretty;
			width: max-content;
			max-width: 20ch;
		}
	}
</style>
