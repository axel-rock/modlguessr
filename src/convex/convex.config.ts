import { defineApp } from 'convex/server'
import betterAuth from '@convex-dev/better-auth/convex.config'
import autumn from '@useautumn/convex/convex.config'
import persistentTextStreaming from '@convex-dev/persistent-text-streaming/convex.config'

const app = defineApp()
app.use(betterAuth)
app.use(autumn)
app.use(persistentTextStreaming)
export default app
