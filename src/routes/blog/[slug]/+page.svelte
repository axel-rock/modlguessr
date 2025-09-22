<script lang="ts">
	import { formatDateAbsolute } from '$lib/utils/intl.svelte'
	import type { PageProps } from './$types'

	let { data }: PageProps = $props()
</script>

<main>
	<nav>
		<a href="/blog">← Back to blog</a>
	</nav>

	<article role="document">
		<span>
			{formatDateAbsolute(data.post.date)}
		</span>
		<h1>{data.post.title}</h1>

		{@html data.post.content}
	</article>
</main>

<style>
	nav {
		width: min(var(--narrow-page), 100%);
		justify-self: center;
	}
</style>
