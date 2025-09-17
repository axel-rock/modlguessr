<script lang="ts">
	import type { PageProps } from './$types'

	let { data }: PageProps = $props()
</script>

<h1>Blog</h1>

<!-- <pre>{JSON.stringify(data.posts, null, 2)}</pre> -->

<ul>
	{#each data.posts as post}
		<li>
			<a href={`/blog/${post.slug}`}>{post.title}</a>
		</li>
	{/each}
</ul>
