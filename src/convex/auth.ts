import { createClient, type AuthFunctions, type GenericCtx } from '@convex-dev/better-auth'
import { api, components, internal } from './_generated/api.js'
import { internalQuery, query } from './_generated/server.js'
import type { Id, DataModel, Doc } from './_generated/dataModel.js'
import { betterAuth } from 'better-auth'
import { username } from 'better-auth/plugins'
import { convex } from '@convex-dev/better-auth/plugins'
import { v } from 'convex/values'

const PUBLIC_GOOGLE_CLIENT_ID = process.env.PUBLIC_GOOGLE_CLIENT_ID as string
const PRIVATE_GOOGLE_CLIENT_SECRET = process.env.PRIVATE_GOOGLE_CLIENT_SECRET as string
const BETTER_AUTH_URL = process.env.BETTER_AUTH_URL as string

// Typesafe way to pass Convex functions defined in this file
const authFunctions: AuthFunctions = internal.auth

export const authComponent = createClient<DataModel>(components.betterAuth, {
	authFunctions,
	triggers: {
		user: {
			onCreate: async (ctx, authUser) => {
				// Any `onCreateUser` logic should be moved here
				console.log({ authUser })
				const userId = await ctx.db.insert('users', {
					// email: authUser.email,
				})
				// Instead of returning the user id, we set it to the component
				// user table manually. This is no longer required behavior, but
				// is necessary when migrating from previous versions to avoid
				// a required database migration.
				// This helper method exists solely to facilitate this migration.
				await authComponent.setUserId(ctx, authUser._id, userId)
			},
			onUpdate: async (ctx, oldUser, newUser) => {
				// Any `onUpdateUser` logic should be moved here
			},
			onDelete: async (ctx, authUser) => {
				await ctx.db.delete(authUser.userId as Id<'users'>)
			},
		},
	},
})

export const createAuth = (ctx: GenericCtx<DataModel>) =>
	betterAuth({
		baseURL: BETTER_AUTH_URL,
		database: authComponent.adapter(ctx),
		socialProviders: {
			google: {
				clientId: PUBLIC_GOOGLE_CLIENT_ID,
				clientSecret: PRIVATE_GOOGLE_CLIENT_SECRET,
			},
		},
		plugins: [
			convex(),
			username({
				minUsernameLength: 3,
			}),
			// admin(),
			// organization({
			// 	organizationLimit: 1,
			// }),
			// anonymous(),
			// oneTap(),
			// apiKey({
			// 	apiKeyHeaders: ['orage-api-key'],
			// }),
			// haveIBeenPwned(),
		],
	})

export const { onCreate, onUpdate, onDelete } = authComponent.triggersApi()

// Example function for getting the current user
// Feel free to edit, omit, etc.
export const getCurrentUser = query({
	args: {},
	handler: async (ctx) => {
		// Get user data from Better Auth - email, name, image, etc.
		const userMetadata = await authComponent.safeGetAuthUser(ctx)
		if (!userMetadata) {
			return null
		}
		// Get user data from your application's database
		// (skip this if you have no fields in your users table schema)
		const user = await ctx.db.get(userMetadata.userId as Id<'users'>)
		return {
			...user,
			...userMetadata,
		}
	},
})

export const getSession = query({
	args: {},
	handler: async (ctx) => {
		const auth = createAuth(ctx)
		const headers = await authComponent.getHeaders(ctx)
		const session = await auth.api.getSession({
			headers,
		})
		if (!session) return null
		return session
	},
})

type AuthInstance = ReturnType<typeof createAuth>
type BetterAuthUser = AuthInstance['$Infer']['Session']['user']
type ConvexUser = Doc<'users'>

type Merge<T> = {
	[K in keyof T]: T[K]
}

/**
 * Combined user type that merges both Better-Auth and Convex fields into a clean inferred object always up to date
 */
export type ConvexBetterAuthUser = Merge<ConvexUser & BetterAuthUser>
