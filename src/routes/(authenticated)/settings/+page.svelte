<script lang="ts">
	// import type { PageProps } from './$types'
	import { context } from '$lib/context.svelte'
	import { authClient } from '$lib/auth'
	import { Debounced } from 'runed'
	import { page } from '$app/state'

	// let { data }: PageProps = $props()

	const user = $derived(context.user)

	let username = $state(context.user?.displayUsername || '')
	let isAvailable = $state(false)
	let isCurrent = $derived(user?.displayUsername === username)

	const checkAvailability = new Debounced(async () => {
		if (!username) return undefined
		if (username.length < 3) return undefined
		const { data, error } = await authClient.isUsernameAvailable({
			username,
		})
		console.log(data, error)
		return data
	}, 500)

	async function updateUsername(event: SubmitEvent) {
		event.preventDefault()
		if (!isAvailable) return undefined
		await authClient.updateUser({
			username,
		})
	}

	$effect(() => {
		if (checkAvailability.pending) {
			isAvailable = false
		} else {
			checkAvailability.current.then((check) => {
				isAvailable = check?.available || false
			})
		}
	})
</script>

<main>
	<h1>Settings</h1>

	{#if user}
		<h2>{user?.displayUsername}</h2>
	{/if}

	<form onsubmit={updateUsername}>
		<div class="form-group">
			<label for="username">Username</label>
			<input
				type="text"
				name="username"
				id="username"
				placeholder="Username"
				bind:value={username}
				autocapitalize="off"
				autocomplete="off"
				autocorrect="off"
				spellcheck="false"
				minlength="3"
				pattern="^[a-zA-Z0-9_-]+$"
				required
			/>
			{#if username && !isCurrent}
				{#if checkAvailability.pending}
					<span>Checking...</span>
				{:else}
					{#await checkAvailability.current}
						<span>Checking...</span>
					{:then check}
						{#if check?.available}
							<span>Available</span>
						{:else}
							<span>Unavailable</span>
						{/if}
					{/await}
				{/if}
			{/if}
		</div>
		{#if !isCurrent}
			<button
				type="submit"
				class="primary"
				disabled={!isAvailable || user?.displayUsername === username}>Update</button
			>
		{/if}
	</form>
</main>

<style>
	main {
		width: min(var(--narrow-page), 100%);
		justify-self: center;
	}
</style>
