import type { ConvexHttpClient } from 'convex/browser'
import type { Session, User } from 'better-auth'

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
}

export {}
