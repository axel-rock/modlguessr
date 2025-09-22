import { httpRouter } from 'convex/server'
import { authComponent } from './auth'
import { createAuth } from './auth'
import { streamGameChat } from './games'

const http = httpRouter()

authComponent.registerRoutes(http, createAuth)

http.route({
	path: '/game-stream',
	method: 'POST',
	handler: streamGameChat,
})

http.route({
	path: '/game-stream',
	method: 'OPTIONS',
	handler: streamGameChat,
})

export default http
