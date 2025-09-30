import { httpRouter } from 'convex/server'
import { authComponent } from './auth'
import { createAuth } from './auth'
import { stream } from './games'
import { httpAction } from '$convex/server'

const http = httpRouter()

authComponent.registerRoutes(http, createAuth, { cors: true })

http.route({
	path: '/game-stream',
	method: 'POST',
	handler: stream,
})

// Handle CORS preflight request
http.route({
	path: '/game-stream',
	method: 'OPTIONS',
	handler: httpAction(
		async (ctx, request) =>
			new Response(null, {
				status: 200,
				headers: {
					'Access-Control-Allow-Origin': process.env.BETTER_AUTH_URL!,
					'Access-Control-Allow-Methods': 'POST, OPTIONS',
					'Access-Control-Allow-Headers':
						'Content-Type, User-Agent, Accept, Accept-Language, Accept-Encoding',
					'Access-Control-Max-Age': '86400',
				},
			})
	),
})

export default http
