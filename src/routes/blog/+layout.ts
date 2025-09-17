import z from 'zod'
import type { LayoutLoad } from './$types'
import { compile } from 'mdsvex'

const posts = import.meta.glob('./posts/*.md', {
	query: '?raw',
	import: 'default',
	eager: true,
})

const postSchema = z.object({
	title: z.string(),
	slug: z.string(),
	content: z.string(),
	date: z.date(),
	description: z.optional(z.string()),
})

export const load = (async () => {
	return {
		posts: await mapPosts(posts),
	}
}) satisfies LayoutLoad

function mapPosts(posts: Record<string, any>) {
	return Promise.all(Object.entries(posts).map(mapPost))
}

async function mapPost([path, post]: [string, any]) {
	const compiled = await compile(post)
	const slug = path.split('/').pop()?.replace('.md', '') ?? ''
	const meta = (compiled?.data?.fm ?? {}) as Partial<z.infer<typeof postSchema>>
	const title = typeof meta.title === 'string' ? meta.title : slug
	const date = typeof meta.date === 'string' ? new Date(meta.date) : new Date(slug.split('_')[0])
	const postObj = {
		...meta,
		title,
		slug,
		date,
		content: compiled?.code ?? '',
	}
	return postSchema.parse(postObj)
}
