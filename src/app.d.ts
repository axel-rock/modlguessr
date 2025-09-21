import type { ConvexHttpClient } from 'convex/browser'
import type { Session } from 'better-auth'
import type { ConvexBetterAuthUser } from './convex/auth'

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			convex: ConvexHttpClient
			session: Session | null
			user: User | null
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}

	type User = ConvexBetterAuthUser
}

export {}
