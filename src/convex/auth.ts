import { createClient, type AuthFunctions, type GenericCtx } from '@convex-dev/better-auth'
import { convex } from '@convex-dev/better-auth/plugins'
import { components, internal } from './_generated/api.js'
import { query } from './_generated/server.js'
import type { DataModel } from './_generated/dataModel.js'
import { betterAuth } from 'better-auth'
import { username, lastLoginMethod } from 'better-auth/plugins'

const BETTER_AUTH_URL = process.env.BETTER_AUTH_URL as string
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID as string
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET as string
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID as string
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET as string

// Typesafe way to pass Convex functions defined in this file
const authFunctions: AuthFunctions = internal.auth

export const authComponent = createClient<DataModel>(components.betterAuth, {
	authFunctions,
})

export const createAuth = (ctx: GenericCtx<DataModel>) =>
	betterAuth({
		baseURL: BETTER_AUTH_URL,
		trustedOrigins: [BETTER_AUTH_URL.replace('https://', 'https://*.')],
		database: authComponent.adapter(ctx),
		socialProviders: {
			google: {
				clientId: GOOGLE_CLIENT_ID,
				clientSecret: GOOGLE_CLIENT_SECRET,
			},
			github: {
				clientId: GITHUB_CLIENT_ID,
				clientSecret: GITHUB_CLIENT_SECRET,
			},
		},
		plugins: [
			convex(),
			username({
				minUsernameLength: 3,
			}),
			lastLoginMethod(),
		],
	})

export const { onCreate, onUpdate, onDelete } = authComponent.triggersApi()

export const getCurrentUser = query({
	args: {},
	handler: async (ctx) => {
		const userMetadata = await authComponent.safeGetAuthUser(ctx)
		if (!userMetadata) return null
		return userMetadata
	},
})

type AuthInstance = ReturnType<typeof createAuth>
export type BetterAuthUser = AuthInstance['$Infer']['Session']['user']
