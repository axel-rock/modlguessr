<script lang="ts">
	import { formatDateAbsolute } from '$lib/utils/intl.svelte'
	import type { PageProps } from './$types'

	let { data }: PageProps = $props()
</script>

<span>
	{formatDateAbsolute(data.post.date)}
</span>

<h1>{data.post.title}</h1>

{@html data.post.content}
