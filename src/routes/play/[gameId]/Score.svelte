<script lang="ts">
	import type { Game } from '$lib/zod/schema'
	import { linear } from 'svelte/easing'
	import { Tween } from 'svelte/motion'

	type Props = {
		game: Game
		round: Game['rounds'][number]
	}

	let { game, round }: Props = $props()

	const duration = 1000
	const base = new Tween(0, { duration, easing: linear })
	const time = new Tween(0, { duration, easing: linear, delay: duration })
	const streak = new Tween(0, { duration, easing: linear, delay: duration * 2 })
	const revealed = new Tween(0, { duration, easing: linear, delay: duration * 3 })
	const total = new Tween(0, { duration, easing: linear, delay: duration * 4 })

	$effect(() => {
		base.set(round.score?.base ?? 0)
		time.set((round.score?.time ?? 0) / 1000)
		streak.set(round.score?.streak ?? 0)
		revealed.set(round.score?.revealed ?? 0)
		total.set(round.score?.total ?? 0)
	})
</script>

<div id="score" class:hidden={!round.score}>
	<h3>Round #{game.rounds.length}</h3>

	<div id="calc">
		(<output
			aria-labelledby="Base points for correct answer"
			class:tweening={base.current !== base.target}
			style="width: 3ch;">{base.current.toFixed(0)}</output
		>
		-
		<output aria-labelledby="Time penalty" style="width: 4ch;"
			>{time.current < 100 ? time.current.toFixed(0) : '99+'}s</output
		>) x
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
		justify-content: space-between;
		font-size: 1.5em;
		gap: 1rem;

		h3 {
			margin: 0;
		}

		&.hidden {
			visibility: hidden;
		}
	}

	output {
		anchor-name: --output-label;
		padding: 0.25rem 0.5rem;
		background-color: var(--grey-200);
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
			position-area: top span-left;
			bottom: 3rem;
			padding: 0.5rem 1rem;
			border-radius: 1rem;
			background-color: var(--grey-200);
			text-wrap: pretty;
			width: max-content;
			max-width: 20ch;
		}
	}
</style>
