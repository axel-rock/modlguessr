import { cronJobs } from 'convex/server'
import { internal } from './_generated/api'

const crons = cronJobs()

crons.interval('getModels', { hours: 6 }, internal.vercel.getModels)

export default crons
