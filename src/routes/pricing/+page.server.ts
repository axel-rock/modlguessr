import type { PageServerLoad } from './$types'
import { api } from '$convex/api'
import { error } from '@sveltejs/kit'
import type { Product } from 'autumn-js'

export const prerender = true

export const load = (async ({ locals: { convex } }) => {
	const { data } = await convex.action(api.autumn.listProducts, {})
	if (!data) error(500, 'Failed to list products')
	const products = data.list
		.sort(sortProducts)
		.filter((product: Product) => product.id !== 'referral_bonus')

	return {
		products,
	}
}) satisfies PageServerLoad

function sortProducts(a: Product, b: Product) {
	const getPriority = (p: Product) =>
		p.properties.is_free
			? 1
			: p.items.some((i) => i.type === 'priced_feature')
				? 4
				: p.properties.is_one_off
					? 3
					: 2
	return getPriority(a) - getPriority(b)
}
