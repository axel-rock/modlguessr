/* This file contains the zod schema for the database. It is declared here so that both Convex, SvelteKit Server and SvelteKit Client can use it. */

import { z } from 'zod'

export const message = z.object({
	role: z.enum(['assistant', 'system', 'user']),
	parts: z.array(z.record(z.string(), z.any())),
	metadata: z.optional(z.any()),
	status: z.optional(z.string()),
	// user_id: v.id('users'),
})
