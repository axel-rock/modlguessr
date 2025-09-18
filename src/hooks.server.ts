import { PUBLIC_CONVEX_URL } from '$env/static/public'
import type { Cookies, Handle } from '@sveltejs/kit'
import { createConvexHttpClient } from '@mmailaender/convex-better-auth-svelte/sveltekit'
import { sequence } from '@sveltejs/kit/hooks'

const convex: Handle = async ({ event, resolve }) => {
	// @ts-expect-error Probably a version mismatch with current version of convex-better-auth-svelte
	event.locals.convex = createConvexHttpClient({
		convexUrl: PUBLIC_CONVEX_URL,
		cookies: event.cookies,
	})
	return resolve(event)
}

export const handle: Handle = sequence(convex)
