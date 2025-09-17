import { PUBLIC_CONVEX_URL } from '$env/static/public'
import type { Cookies, Handle } from '@sveltejs/kit'
import { createConvexHttpClient } from '@mmailaender/convex-better-auth-svelte/sveltekit'
import { sequence } from '@sveltejs/kit/hooks'

const convex: Handle = async ({ event, resolve }) => {
	event.locals.convex = createConvexHttpClient({
		cookies: event.cookies,
		convexUrl: PUBLIC_CONVEX_URL,
	})
	return resolve(event)
}

export const handle: Handle = sequence(convex)
