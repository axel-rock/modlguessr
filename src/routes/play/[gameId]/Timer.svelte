<script lang="ts">
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
	<span>Waiting for the first message</span>
{:else if round.ended_at}
	{@const duration = (round.ended_at - round.started_at) / 1000}
	<span>{duration.toFixed(1)}s</span>
{:else}
	{@const duration = (now - round.started_at) / 1000}
	<span>{duration.toFixed(1)}s</span>
{/if}
