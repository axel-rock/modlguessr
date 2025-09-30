<script lang="ts">
	import type { Model } from '$lib/zod/schema'
	import { useConvexClient } from 'convex-svelte'
	import { api } from '$convex/api'
	import { PersistedState } from 'runed'
	import { z } from 'zod'
	import { marked } from 'marked'

	type Props = {
		models: (Model & { analysis?: string })[]
	}

	const convex = useConvexClient()

	let { models }: Props = $props()

	let processing = $state(false)

	const modelId1 = new PersistedState<string | undefined>('models.compare.modelId1', undefined)
	const modelId2 = new PersistedState<string | undefined>('models.compare.modelId2', undefined)

	let model1Analysis = $state<string | undefined>(undefined)
	let model2Analysis = $state<string | undefined>(undefined)
	let comparison = $state<string | undefined>(undefined)

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault()
		processing = true
		try {
			const formData = new FormData(event.target as HTMLFormElement)
			const _modelId1 = formData.get('model1') as string
			const _modelId2 = formData.get('model2') as string
			if (!_modelId1 || !_modelId2) return
			modelId1.current = _modelId1
			modelId2.current = _modelId2
			const expectedSchema = z.object({
				id: z.string(),
				name: z.string(),
				description: z.string(),
			})
			const model1 = expectedSchema.parse(models.find((model) => model.id === modelId1.current))
			const model2 = expectedSchema.parse(models.find((model) => model.id === modelId2.current))
			if (!model1 || !model2) return
			const data = await convex.action(api.comparison.compare, { models: [model1, model2] })
			model1Analysis = data?.models[0].patterns
			model2Analysis = data?.models[1].patterns
			comparison = data?.comparison
		} catch (error) {
			console.error(error)
		} finally {
			processing = false
		}
	}
</script>

<h2 class="hero">Compare Models</h2>

<p>Master the art of AI detection. Discover what makes each model unique.</p>

<form onsubmit={handleSubmit}>
	<div class="form-group">
		<label for="model1">Model 1</label>
		<select name="model1" id="model1" value={modelId1.current}>
			{#each models as model}
				<option value={model.id}>{model.name}</option>
			{/each}
		</select>
	</div>

	<div class="form-group">
		<label for="model2">Model 2</label>
		<select name="model2" id="model2" value={modelId2.current}>
			{#each models as model}
				<option value={model.id}>{model.name}</option>
			{/each}
		</select>
	</div>

	<div class="form-group span-all">
		<button type="submit" disabled={processing}>
			{processing ? 'Processing...' : 'Compare'}
		</button>
	</div>

	{#if model1Analysis && model2Analysis && comparison}
		<details>
			<summary>Model 1 Analysis</summary>
			<div>{@html marked(model1Analysis)}</div>
		</details>

		<details>
			<summary>Model 2 Analysis</summary>
			<div>{@html marked(model2Analysis)}</div>
		</details>

		<details class="span-all" open>
			<summary><b>Comparison</b></summary>
			{@html marked(comparison)}
		</details>
	{/if}
</form>

<p>
	Powered by <a href="https://www.firecrawl.dev/" target="_blank"
		><img src="/logo/firecrawl.svg" alt="Firecrawl" /> Firecrawl</a
	>
	and
	<a href="https://openai.com/" target="_blank"
		><img src="/logo/openai.svg" alt="OpenAI" /> OpenAI</a
	>
</p>

<style>
	form {
		display: grid;
		grid-template-columns: 1fr;
		gap: 1rem;
		width: 100%;

		@media (min-width: 35rem) {
			grid-template-columns: 1fr 1fr;
		}

		select {
			max-width: 100%;
			width: 100%;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
		}

		select option {
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
			max-width: 100%;
		}
	}

	p {
		margin-inline: auto;
		text-align: center;

		&:last-child {
			margin-top: 0rem;
		}

		a {
			img {
				width: 1.75em;
				aspect-ratio: 1;
				object-fit: contain;

				&[src='/logo/openai.svg'] {
					translate: 0 0.5em;
				}

				&[src='/logo/firecrawl.svg'] {
					width: 1.25em;
					translate: 0 0.125em;
				}
			}
		}
	}
	@media (prefers-color-scheme: dark) {
		a {
			img[src='/logo/openai.svg'] {
				filter: invert(1);
			}
		}
	}
</style>
