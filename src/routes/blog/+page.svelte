<script lang="ts">
	import type { PageProps } from './$types'

	let { data }: PageProps = $props()
</script>

<div id="blog">
	<h1>Blog</h1>

	<!-- <pre>{JSON.stringify(data.posts, null, 2)}</pre> -->

	<ul>
		{#each data.posts as post}
			<li>
				<a href={`/blog/${post.slug}`}>{post.title}</a>
			</li>
		{/each}
	</ul>
</div>

<style>
	#blog {
		width: var(--narrow-page);
		margin-inline: auto;
		display: grid;
		gap: 1rem;
		padding-block: 2rem;
	}
</style>
