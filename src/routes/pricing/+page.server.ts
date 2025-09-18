import type { PageServerLoad } from './$types'
import { api } from '$convex/api'
import { error } from '@sveltejs/kit'
import type { Product } from 'autumn-js'
import { PRIVATE_AUTUMN_SECRET_KEY } from '$env/static/private'

export const prerender = true

export const load = (async ({ locals: { convex }, fetch }) => {
	const req = await fetch('https://api.useautumn.com/v1/products', {
		headers: {
			Authorization: `Bearer ${PRIVATE_AUTUMN_SECRET_KEY}`,
		},
	})

	const data = await req.json()

	const products: Product[] =
		data?.list.sort(sortProducts) ??
		// .filter((product: Product) =>
		// 	product.items.some((item) => item.feature?.name === 'tickets')
		// )
		[]

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
