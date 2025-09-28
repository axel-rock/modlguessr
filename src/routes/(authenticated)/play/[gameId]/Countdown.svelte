<script lang="ts">
	import { DURATION } from '$lib/constants'
	import type { Game } from '$lib/zod/schema'

	type Props = {
		round: Game['rounds'][number] | undefined
	}

	let { round }: Props = $props()

	let now = $state(Date.now())

	$effect(() => {
		const interval = setInterval(() => {
			now = Date.now()
		}, 100)
		return () => clearInterval(interval)
	})
</script>

{#if !round?.started_at}
	<span>Ready</span>
{:else if round.ended_at}
	{@const timeLeft = Math.max(0, (round.started_at + DURATION * 1000 - round.ended_at) / 1000)}
	<span>{timeLeft.toFixed(1)}s</span>
{:else}
	{@const timeLeft = Math.max(0, (round.started_at + DURATION * 1000 - now) / 1000)}
	<span>{timeLeft.toFixed(1)}s</span>
{/if}
