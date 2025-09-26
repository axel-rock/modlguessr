<script lang="ts">
	import { useConvexClient } from 'convex-svelte'
	import type { PageProps } from './$types'
	import { api } from '$convex/api'
	import { page } from '$app/state'
	import { context } from '$lib/context.svelte'
	import { type Feature } from 'autumn-js'

	let { data }: PageProps = $props()

	const convex = useConvexClient()

	const codeRequest = $derived(
		context.user
			? convex.action(api.autumn.createReferralCode, {
					programId: 'referral',
				})
			: undefined
	)
</script>

<main id="pricing">
	<h1 class="hero">Pricing</h1>

	<div id="plans">
		{#each data.products as product}
			{@const price = product.items.find((item) => item.type === 'price')}
			<article id={product.id}>
				<h2>{product.name}</h2>
				<span class="price">{Object.values(price?.display ?? {}).join(' ')}</span>

				<dl class="features">
					<dt>Features</dt>
					<dd>
						<ul class="no-bullet">
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
											€{item.price} per {(
												item.feature as Feature & { display: { singular: string } }
											).display.singular}
										{/if}
									</li>
								{/if}
							{/each}
						</ul>
					</dd>
				</dl>

				{#if product.properties.is_free}
					<a href="" class="primary">Play for free</a>
				{:else if product.is_add_on}
					<a href="" class="primary">Purchase</a>
				{:else}
					<a href="" class="primary">Subscribe</a>
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
</main>

<style>
	main {
		width: 100%;
		background-color: var(--pink);
	}
	#plans {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
		grid-template-rows: 1fr auto auto;
		gap: 1rem;
	}
	article {
		display: grid;
		grid-template-columns: 1fr auto;
		grid-template-rows: subgrid;
		grid-row: span 3;
		align-items: first baseline;
		background-color: color-mix(in oklab, var(--pink) 80%, #fff);

		padding: 1.5rem 2rem;
		border-radius: 1rem;
		gap: 0.5rem;

		& > * {
			margin: 0;
		}

		h2 {
			font-weight: 700;
			letter-spacing: -0.0125em;
			font-size: 2rem;
		}

		.price {
			font-size: 1.5rem;
			font-weight: 700;
			letter-spacing: -0.0125em;
			justify-self: end;
		}

		.features {
			grid-column: 1 / -1;
			display: grid;
			gap: 0.5rem;

			dt {
				font-weight: 700;
			}
			dd,
			ul {
				margin-left: 0;
				display: contents;
			}
		}

		a {
			justify-self: end;
			grid-column: 2;
		}

		&#pay_as_you_go {
			grid-column: 1 / -1;
		}
	}
	#referral {
		text-align: center;
		display: grid;
		justify-content: center;
	}
</style>
