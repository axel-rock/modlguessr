<script lang="ts">
	import type { HTMLButtonAttributes } from 'svelte/elements'
	import type { Snippet } from 'svelte'
	import { useQuery } from 'convex-svelte'
	import { api } from '$convex/api'

	interface Props extends HTMLButtonAttributes {
		modelId: string
		children?: Snippet
	}

	const colors = {
		alibaba: '#6336e7',
		amazon: '#ff6200',
		anthropic: '#d77655',
		cohere: '#39594d',
		deepseek: '#4d6bfe',
		google: '#2ce157',
		meituan: '#2ce157',
		meta: '#0081fb',
		mistral: '#ff7000',
		moonshotai: '#000',
		morph: '#fad22a',
		openai: '#000',
		perplexity: '#1f1f1f',
		stealth: '#000',
		vercel: '#000',
		voyage: '#012e33',
		xai: '#000',
		zai: '#000',
	}

	let { modelId, children, ...rest }: Props = $props()
	const [provider, name] = modelId.split('/')
	const color = colors[provider as keyof typeof colors]

	const modelQuery = useQuery(api.models.getOne, { id: modelId })

	function handleError(event: Event) {
		event.preventDefault()
		;(event.target as HTMLImageElement).src = '/logo/modlguessr.svg'
	}
</script>

<button {...rest} title={modelId} style={`--brand: ${color}`} data-model={modelId}>
	<img src="/providers/{provider}.svg" alt={provider} onerror={handleError} />
	<span class="name">{modelQuery.data?.name ?? name}</span>
	<!-- {#if children}{@render children()}{/if} -->
</button>

<style>
	button {
		--color: color-mix(in oklab, var(--brand) 50%, #000);
		--bg: color-mix(in oklab, var(--brand) 3%, #fff);
		--bg-hover: color-mix(in oklab, var(--brand) 20%, #fff);
		display: grid;
		grid-template-columns: 2rem auto 1fr;
		text-align: start;
		font-size: inherit;
		gap: 0.25em 0.5em;
		padding: 0.5em 0.5em !important;
		border: 1px solid var(--color);
		color: var(--color) !important;
		background-color: var(--bg) !important;

		&.selected {
			outline: 2px solid var(--brand);
		}
		&.incorrect {
			--brand: #ff66c8 !important;
			&:after {
				content: '✗';
			}
		}
		&.correct {
			--brand: #67ff9b !important;
			opacity: 1 !important;
			outline: 2px solid var(--brand);
			&:after {
				content: '✓';
			}
		}

		&:hover:not(:disabled) {
			background-color: var(--bg-hover);
		}

		img {
			height: 2rem;
			aspect-ratio: 1;
			justify-self: center;
			border-radius: 0.5rem;
		}

		.name {
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
		}
	}

	:global(button[disabled][data-model]) {
		opacity: 0.75;
	}
</style>
