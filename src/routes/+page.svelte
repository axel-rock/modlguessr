<script lang="ts">
	import { enhance } from '$app/forms'
	import { api } from '$convex/api'
	import { useQuery } from 'convex-svelte'

	// let { data } = $props()

	// const messages = useQuery(api.messages.list, {})
</script>

<h1>Can you guess the model?</h1>

<style>
	h1 {
		text-align: center;
		font-size: 4rem;
		font-weight: 800;
		margin-block: 4rem;
	}
</style>
