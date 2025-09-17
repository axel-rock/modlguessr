import { error } from '@sveltejs/kit'
import type { PageLoad } from './$types'

export const load = (async ({ params: { slug }, parent }) => {
	const { posts } = await parent()
	const post = posts.find((post: any) => post.slug === slug)
	if (!post) error(404, 'Post not found')
	return {
		post,
	}
}) satisfies PageLoad
