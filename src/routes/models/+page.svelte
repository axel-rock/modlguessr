<script lang="ts">
	import ModelButton from '$lib/components/ModelButton.svelte'
	import CompareModels from '$lib/components/CompareModels.svelte'
	import type { PageProps } from './$types'

	let { data }: PageProps = $props()

	function handleError(event: Event) {
		;(event.target as HTMLImageElement).src = '/logo/modlguessr.svg'
	}
</script>

<main>
	<h1 class="hero">Models</h1>

	<CompareModels models={data.models} />

	<hr />

	<p>
		Here is a list of all the models available on the <a
			href="https://vercel.com/ai-gateway"
			target="_blank">AI Gateway</a
		> that can be used in the game.
	</p>

	<hr />

	<ul>
		{#each data.models as model}
			{@const provider = model.id.split('/')[0]}
			<li>
				<img src="/providers/{provider}.svg" alt={provider} onerror={handleError} />
				<div>
					<span class="name"><b>{model.name}</b> <span class="id">{model.id}</span></span>
					<span class="description">{model.description}</span>
					<!-- <span>
						<ModelButton modelId={model.id} />
					</span> -->
				</div>
			</li>
		{/each}
	</ul>
</main>

<style>
	p {
		text-align: center;
		text-wrap: pretty;
	}

	li {
		display: grid;
		grid-template-columns: 2rem 1fr;
		gap: 0.5rem;

		.id {
			font-weight: 200;
		}

		img {
			border-radius: 0.5rem;
		}

		div {
			display: grid;
			gap: 0.5rem;
		}
	}
</style>
