import { defineApp } from 'convex/server'
import betterAuth from '@convex-dev/better-auth/convex.config'
import aggregate from '@convex-dev/aggregate/convex.config'
import resend from '@convex-dev/resend/convex.config'
import autumn from '@useautumn/convex/convex.config'

const app = defineApp()
app.use(betterAuth)
app.use(aggregate, { name: 'aggregateTokens' })
app.use(aggregate, { name: 'aggregateScores' })
app.use(aggregate, { name: 'aggregateStats' })
app.use(resend)
app.use(autumn)
export default app
