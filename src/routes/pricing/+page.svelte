<script lang="ts">
	import type { PageProps } from './$types'

	let { data }: PageProps = $props()
</script>

<h1>Pricing</h1>

<div id="plans">
	{#each data.products as product}
		{@const price = product.items.find((item) => item.type === 'price')}
		<article id={product.id}>
			<h2>{product.name}</h2>

			<dl>
				{#if price}
					<dt>Price</dt>
					<dd>{Object.values(price?.display ?? {}).join(' ')}</dd>
				{/if}

				<dt>Features</dt>
				<dd>
					<ul>
						{#each product.items as item}
							{#if item.feature}
								<li>
									{#if item.type === 'feature'}
										{item.included_usage}
										{item.included_usage === 1
											? // @ts-expect-error
												item.feature.display.singular
											: // @ts-expect-error
												item.feature.display.plural}
										{#if item.interval}per {item.interval}{/if}
									{:else if item.type === 'priced_feature'}
										€{item.price} per {item.feature.display.singular}
									{/if}
								</li>
							{/if}
						{/each}
					</ul>
				</dd>
			</dl>

			{#if product.properties.is_free}
				<button class="primary">Play for free</button>
			{:else if product.is_add_on}
				<button class="primary">Purchase</button>
			{:else}
				<button class="primary">Subscribe</button>
			{/if}
		</article>
	{/each}
</div>

<style>
	#plans {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 1rem;
	}
	article {
		display: grid;
		gap: 0.25rem;
	}
</style>
