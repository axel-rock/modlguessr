<script lang="ts">
	import { useConvexClient } from 'convex-svelte'
	import type { PageProps } from './$types'
	import { api } from '$convex/api'
	import { page } from '$app/state'
	import { context } from '$lib/context.svelte'
	import { type CustomerProduct, type Feature } from 'autumn-js'
	import { goto } from '$app/navigation'

	let { data }: PageProps = $props()

	const convex = useConvexClient()
	const user = $derived(context.user)

	let copied = $state(false)
	let code = $state<string | undefined>(undefined)
	let activeProducts = $state<CustomerProduct[] | undefined>(undefined)

	$effect(() => {
		context.user
			? convex
					.action(api.autumn.createReferralCode, {
						programId: 'referral',
					})
					.then((data) => {
						code = data?.data?.code
					})
			: undefined
	})

	$effect(() => {
		context.user
			? convex.action(api.autumn.getActiveProducts, {}).then((data) => {
					activeProducts = data ?? undefined
				})
			: undefined
	})

	async function attach(productId: string) {
		if (!user) return goto('/login?redirect=/pricing')
		const { data, error } = await convex.action(api.autumn.attach, {
			productId,
			successUrl: `${page.url.origin}/play`,
		})
		if (error) {
			console.error(error)
			return
		}
		console.log(data)
		if (data?.checkout_url) window.location.href = data.checkout_url
	}
</script>

<main id="pricing">
	<h1 class="hero">Pricing</h1>

	<div id="plans">
		{#each data.products as product}
			{@const price = product.items.find((item) => item.type === 'price')}
			{@const active =
				activeProducts?.some((p) => p.id === product.id && p.status === 'active') &&
				!product.is_add_on}
			<article id={product.id} class:active>
				<h2>{product.name}</h2>

				<div class="price">
					<span>{price?.display?.primary_text}</span>{#if price?.display?.secondary_text}
						<span class="secondary">{price?.display?.secondary_text}</span>{/if}
				</div>

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
					<!-- <a href="" class="primary">Play for free</a> -->
				{:else if product.is_add_on}
					<button onclick={() => attach(product.id)} class="link">Purchase</button>
				{:else if active}
					<button class="link">Your current plan</button>
				{:else}
					<button onclick={() => attach(product.id)} class="link">Subscribe</button>
				{/if}
			</article>
		{/each}
	</div>

	<div id="referral" class="span-all">
		<h2>Invite friends, earn free tickets!</h2>
		<p>You and your friends each get 5 tickets when they sign up using your link.</p>

		{#if code}
			<p>Your referral link:</p>
			<input
				type="url"
				name="referral"
				value={copied ? 'Copied!' : page.url.origin + '/referral/' + code}
				readonly
				class="big"
				onclick={() => {
					navigator.clipboard.writeText(page.url.origin + '/referral/' + code)
					copied = true
					setTimeout(() => {
						copied = false
					}, 2000)
				}}
			/>
		{:else}
			<p>Sign in to get your referral link</p>
			<a href="/login?redirect=/pricing" role="button" class="contrast big">Sign in</a>
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
		width: min(100%, 90ch);
		grid-template-rows: 1fr auto auto;
		gap: 1rem;
		justify-self: center;
		margin-bottom: 4rem;
	}

	@media (min-width: 768px) {
		#plans {
			grid-template-columns: repeat(3, 1fr);
		}
	}

	article {
		display: grid;
		grid-template-columns: 1fr auto;
		grid-template-rows: subgrid;
		grid-row: span 3;
		padding: 1rem 1.5rem;
		border-radius: 1rem;
		gap: 0.5rem;
		align-items: first baseline;
		background-color: color-mix(in oklab, var(--pink) 80%, #fff);
		border: 1px solid color-mix(in oklab, var(--pink) 50%, #fff);

		transition: background-color 0.1s ease;

		&:hover {
			background-color: color-mix(in oklab, var(--pink) 90%, #fff);
		}

		&.active {
			background-color: color-mix(in oklab, var(--pink) 90%, #fff);
		}

		& > * {
			margin: 0;
		}

		h2 {
			font-weight: 700;
			letter-spacing: -0.0125em;
			font-size: 2rem;
		}

		.price {
			letter-spacing: -0.0125em;
			justify-self: end;

			display: flex;
			align-items: baseline;
			gap: 0.25rem;

			& > :first-child {
				font-size: 1.66rem;
				font-weight: 700;
			}

			& > :nth-child(2) {
				font-size: 1rem;
			}
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

		button {
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

		p + p {
			margin-top: 0;
			margin-bottom: 2rem;
		}

		input {
			background-color: var(--grey-900);
			color: var(--grey-0) !important;
			text-align: center;
			font-size: 1.25rem;
			font-weight: 500;
			border: none;
			cursor: pointer;
		}
	}
</style>
