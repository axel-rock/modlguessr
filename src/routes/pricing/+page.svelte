<script lang="ts">
	import { useConvexClient } from 'convex-svelte'
	import type { PageProps } from './$types'
	import { api } from '$convex/api'
	import { getContext } from 'svelte'
	import type { Doc } from '$convex/dataModel'
	import { page } from '$app/state'

	let { data }: PageProps = $props()

	const convex = useConvexClient()
	const context: { user: Doc<'users'> | undefined } = getContext('context')

	const codeRequest = $derived(
		context.user
			? convex.action(api.autumn.createReferralCode, {
					programId: 'referral',
				})
			: undefined
	)
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

	{#if codeRequest}
		{#await codeRequest then codeRequest}
			{#if codeRequest.statusCode === 200 && codeRequest.data}
				{@const code = codeRequest.data.code}
				<div id="referral" class="span-all">
					<h2>Invite friends, earn free tickets!</h2>
					<p>You and your friends each get 5 tickets when they sign up using your link.</p>
					<p>Your referral link:</p>

					<input
						type="url"
						name="referral"
						id="referral"
						value="{page.url.origin}/referral/{code}"
						readonly
					/>
				</div>
			{/if}
		{/await}
	{/if}
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
	#referral {
		text-align: center;
		display: grid;
		justify-content: center;
	}
</style>
