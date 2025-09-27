<script lang="ts">
	import type { PageProps } from './$types'

	let { data }: PageProps = $props()

	function handleError(event: Event) {
		;(event.target as HTMLImageElement).src = '/logo/modlguessr.svg'
	}
</script>

<main>
	<h1 class="hero">Models</h1>

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
					<b class="name">{model.id}</b>
					<span class="description">{model.description}</span>
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

		img {
			border-radius: 0.5rem;
		}

		div {
			display: grid;
		}
	}
</style>
