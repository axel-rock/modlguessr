<script lang="ts" module>
	let stack = $state<string[]>([])

	export function toast(message: string, params?: {}) {
		stack.push(message)
	}
</script>

<script lang="ts">
	import { elasticOut } from 'svelte/easing'

	import { fly } from 'svelte/transition'
</script>

{#each stack as message, index (index)}
	<button
		class="toast"
		in:fly={{ y: 100, duration: 200, easing: elasticOut }}
		onclick={() => stack.splice(index, 1)}
	>
		{message}
	</button>
{/each}

<style>
	.toast {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		background-color: var(--grey-0);
		padding: 1rem;
	}
</style>
