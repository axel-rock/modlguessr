<script lang="ts">
	import { formatDateAbsolute } from '$lib/utils/intl.svelte'
	import type { PageProps } from './$types'

	let { data }: PageProps = $props()
</script>

<main id="blog">
	<h1>Blog</h1>

	<!-- <pre>{JSON.stringify(data.posts, null, 2)}</pre> -->

	<ul class="no-bullet">
		{#each data.posts as post}
			{@const formattedDate = formatDateAbsolute(post.date)}
			<li>
				<article>
					<h2>{post.title}</h2>

					<p>{formattedDate}</p>

					<a href={`/blog/${post.slug}`}>Read more →</a>
				</article>
			</li>
		{/each}
	</ul>
</main>

<style>
	#blog {
		width: var(--narrow-page);
		margin-inline: auto;
		display: grid;
		gap: 1rem;
		padding-block: 2rem;
	}

	article {
		display: grid;
		grid-template-columns: 1fr max-content;
		gap: 0.5rem 1rem;
		align-items: center;
		padding: 1rem;
		position: relative;

		&:hover {
			background-color: var(--grey-100);
			border-radius: 1rem;
		}

		h2 {
			grid-column: 1 / -1;
			font-size: 1.5rem;
			text-overflow: ellipsis;
			overflow: hidden;
			white-space: nowrap;
			margin: 0;
		}

		p {
			margin: 0;
		}

		a::after {
			content: '';
			position: absolute;
			inset: 0;
		}
	}
</style>
