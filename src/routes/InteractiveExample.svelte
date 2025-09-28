<script lang="ts">
	import ModelButton from '$lib/components/ModelButton.svelte'
	import { onMount } from 'svelte'
	import { fade, fly } from 'svelte/transition'

	const models = [
		{
			_creationTime: 1759016491592.1006,
			_id: 'jx78ga3c748gbgvmab5kk4nmsn7rdhee',
			description:
				"Claude Sonnet 4 significantly improves on Sonnet 3.7's industry-leading capabilities, excelling in coding with a state-of-the-art 72.7% on SWE-bench. The model balances performance and efficiency for internal and external use cases, with enhanced steerability for greater control over implementations. While not matching Opus 4 in most domains, it delivers an optimal mix of capability and practicality.",
			id: 'anthropic/claude-sonnet-4',
			modelType: 'language',
			name: 'Claude Sonnet 4',
			pricing: {
				cacheCreationInputTokens: '0.00000375',
				cachedInputTokens: '0.0000003',
				input: '0.000003',
				output: '0.000015',
			},
			specification: {
				modelId: 'anthropic/claude-sonnet-4',
				provider: 'anthropic',
				specificationVersion: 'v2',
			},
		},
		{
			_creationTime: 1759016491592.1094,
			_id: 'jx7bzv6smvz3073nse78mpc8cx7rdknn',
			description:
				'The Llama 4 collection of models are natively multimodal AI models that enable text and multimodal experiences. These models leverage a mixture-of-experts architecture to offer industry-leading performance in text and image understanding. Llama 4 Maverick, a 17 billion parameter model with 128 experts. Served by DeepInfra.',
			id: 'meta/llama-4-maverick',
			modelType: 'language',
			name: 'Llama 4 Maverick 17B',
			pricing: {
				input: '0.00000015',
				output: '0.0000006',
			},
			specification: {
				modelId: 'meta/llama-4-maverick',
				provider: 'deepinfra',
				specificationVersion: 'v2',
			},
		},
		{
			_creationTime: 1759016491592.1125,
			_id: 'jx76t8jygmpks7t6qt5dc75z4s7rd6dk',
			description:
				'Mistral Medium 3 delivers frontier performance while being an order of magnitude less expensive. For instance, the model performs at or above 90% of Claude Sonnet 3.7 on benchmarks across the board at a significantly lower cost.',
			id: 'mistral/mistral-medium',
			modelType: 'language',
			name: 'Mistral Medium 3.1',
			pricing: {
				input: '0.0000004',
				output: '0.000002',
			},
			specification: {
				modelId: 'mistral/mistral-medium',
				provider: 'mistral',
				specificationVersion: 'v2',
			},
		},
		{
			_creationTime: 1759016491592.117,
			_id: 'jx7cn5khbz8kjcxpym8h218tzn7rc47v',
			description:
				"GPT-5 is OpenAI's flagship language model that excels at complex reasoning, broad real-world knowledge, code-intensive, and multi-step agentic tasks.",
			id: 'openai/gpt-5',
			modelType: 'language',
			name: 'GPT-5',
			pricing: {
				cacheCreationInputTokens: '0',
				cachedInputTokens: '0.00000013',
				input: '0.00000125',
				output: '0.00001',
			},
			specification: {
				modelId: 'openai/gpt-5',
				provider: 'azure',
				specificationVersion: 'v2',
			},
		},
	]

	let selected = $state<string | null>(null)

	let ready = $state(false)

	onMount(() => {
		ready = true
	})

	function pick(model: string) {
		if (selected !== null) return
		console.log(model)
		selected = model
	}
</script>

{#if ready}
	<div id="example">
		<ul id="messages">
			<li class="message user" in:fade={{ duration: 500 }}>
				Authentication shouldn't be this complicated in 2025
			</li>
			<li class="message assistant" in:fade={{ duration: 500, delay: 1000 }}>
				You're absolutely right! Modern authentication has become unnecessarily complex. The ideal
				solution would provide comprehensive security while maintaining developer simplicity...
			</li>
		</ul>

		<hr />

		<div class="infos" in:fade={{ duration: 500, delay: 2000 }}>
			{#if !selected}
				<span>Guess which model is talking</span>
			{:else if selected === 'anthropic/claude-sonnet-4'}
				<span>"You're absolutely right!", it's Claude!</span>
			{:else}
				<span>Nope, it was Claude!</span>
			{/if}
		</div>

		<menu class="modelpicker" in:fade={{ duration: 500, delay: 2100 }}>
			{#each models as model}
				{@const classes = {
					selected: selected === model.id,
					correct: selected === model.id && model.id === 'anthropic/claude-sonnet-4',
					incorrect: selected === model.id && model.id !== 'anthropic/claude-sonnet-4',
					disabled: selected !== null,
				}}
				<li>
					<ModelButton modelId={model.id} onclick={() => pick(model.id)} class={classes}
						>{model.name}</ModelButton
					>
				</li>
			{/each}
		</menu>
	</div>
{:else}
	<!-- Dirty to avoid content shift but allow intro animation -->
	<div id="example" class="placeholder">
		<ul id="messages">
			<li class="message user">Authentication shouldn't be this complicated in 2025</li>
			<li class="message assistant" in:fade|global={{ duration: 500, delay: 1000 }}>
				You're absolutely right! Modern authentication has become unnecessarily complex. The ideal
				solution would provide comprehensive security while maintaining developer simplicity...
			</li>
		</ul>

		<hr />

		<div class="infos">
			{#if !selected}
				<span>Guess which model is talking</span>
			{:else if selected === 'anthropic/claude-sonnet-4'}
				<span>"You're absolutely right!", it's Claude!</span>
			{:else}
				<span>Nope, it was Claude!</span>
			{/if}
		</div>

		<menu class="modelpicker">
			{#each models as model}
				{@const classes = {
					selected: selected === model.id,
					correct: selected === model.id && model.id === 'anthropic/claude-sonnet-4',
					incorrect: selected === model.id && model.id !== 'anthropic/claude-sonnet-4',
					disabled: selected !== null,
				}}
				<li>
					<ModelButton modelId={model.id} onclick={() => pick(model.id)} class={classes}
						>{model.name}</ModelButton
					>
				</li>
			{/each}
		</menu>
	</div>
{/if}

<style>
	#example {
		border: 1px solid var(--grey-100);
		background-color: var(--grey-50);
		border-radius: 1rem;
		/* padding: 1rem; */
		margin: 1rem;
		width: 100%;
		margin-inline: auto;
		margin-top: 2rem;

		&.placeholder > * {
			opacity: 0;
		}
	}

	#messages {
		padding: 2rem;
		min-height: 15rem;
	}

	hr {
		margin: 0.5rem 0;
	}

	.infos {
		justify-self: center;
		padding: 0.5rem;
	}

	.modelpicker {
		padding: 1rem;
	}
</style>
