<script lang="ts">
	// import type { PageProps } from './$types'
	import { context } from '$lib/context.svelte'
	import { authClient } from '$lib/auth'
	import { Debounced } from 'runed'
	import { page } from '$app/state'
	import { goto } from '$app/navigation'
	import { useConvexClient } from 'convex-svelte'
	import { api } from '$convex/api'

	// let { data }: PageProps = $props()

	const user = $derived(context.user)

	let username = $state(context.user?.displayUsername || '')
	let isAvailable = $state(false)
	let isCurrent = $derived(user?.displayUsername === username)
	const convex = useConvexClient()

	let suggestions: string[] | undefined = $state(undefined)

	const checkAvailability = new Debounced(async () => {
		if (!username) return undefined
		if (username.length < 3) return undefined
		// if (suggestions?.includes(username)) return { available: true }
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

	const status = $derived.by(() => {
		if (!username || isCurrent) return undefined
		if (checkAvailability.pending) return 'checking…'
		if (isAvailable) return 'available'
		return 'unavailable'
	})

	/* Username is mandatory. User can be pointed to this page during sign up process, but flow will resume where they left off */
	$effect(() => {
		if (page.url.searchParams.has('redirect') && user?.username)
			goto(page.url.searchParams.get('redirect')!)
	})

	$effect(() => {
		if (user && !user.username) {
			getSuggestions()
		}
	})

	const text = $derived(
		isCurrent
			? 'Great name!'
			: !username
				? 'Update'
				: checkAvailability.pending
					? 'Checking...'
					: isAvailable
						? 'Update'
						: 'Unavailable'
	)

	async function getSuggestions() {
		const gen = await convex.action(api.openai.getUsernameSuggestions, {})
		if (!gen) return

		const availabilities = await Promise.all(
			gen.map(async (suggestion) => {
				const { data, error } = await authClient.isUsernameAvailable({ username: suggestion })
				return {
					suggestion,
					available: data?.available,
				}
			})
		)

		suggestions = availabilities
			.filter((availability) => availability.available)
			.map((availability) => availability.suggestion)
			.slice(0, 3)
	}
</script>

<main>
	<h1 class="hero">How should we call you?</h1>

	<form onsubmit={updateUsername}>
		<div class="form-group">
			<label for="username">Username, displayed on the leaderboard</label>
			<input
				type="text"
				class="big"
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
		</div>

		<button
			id="submit"
			type="submit"
			class="contrast big"
			disabled={isCurrent || !isAvailable || user?.displayUsername === username}>{text}</button
		>
	</form>

	{#if suggestions}
		<hr />

		<p id="suggestions-label">OpenAI had some ideas (take 'em or leave 'em):</p>

		<menu id="suggestions">
			{#each suggestions as suggestion}
				<li>
					<button class="suggestion tertiary" onclick={() => (username = suggestion)}>
						{suggestion}
					</button>
				</li>
			{/each}
		</menu>
	{/if}
</main>

<style>
	main {
		width: min(var(--narrow-page), 100%);
		justify-self: center;
		place-items: center;

		form {
			justify-content: center;
			align-items: end;
			width: 100%;
			display: grid;
			grid-template-columns: 1fr;

			button[type='submit'] {
				min-height: 4rem;
			}
		}

		@media (min-width: 600px) {
			form {
				grid-template-columns: 1fr auto;
			}
		}
	}

	#suggestions-label {
		display: block;
		width: 100%;
		text-align: center;
	}

	menu {
		display: grid;
		width: 100%;
		grid-template-columns: repeat(auto-fit, minmax(8ch, 1fr));
		gap: 1rem;
		justify-content: center;

		li {
			display: contents;
		}
	}
</style>
