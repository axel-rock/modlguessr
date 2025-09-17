<script lang="ts">
	import { enhance } from '$app/forms'
	import { api } from '$convex/api'
	import { useQuery } from 'convex-svelte'

	let { data } = $props()

	const messages = useQuery(api.messages.list, {})
</script>

<h1>ModlGuessr</h1>

<p><a href="https://www.convex.dev/hackathons/modernstack">Modern Stack Hackathon</a></p>

{#await messages then messages}
	{#each messages.data ?? [] as message}
		{#each message.parts ?? [] as part}
			{#if part.type === 'text'}
				<p>{message.role}: {part.text}</p>
			{/if}
		{/each}
	{/each}
{/await}

<form method="post" use:enhance>
	<textarea name="message" id="message"></textarea>
	<button type="submit">Submit</button>
</form>
