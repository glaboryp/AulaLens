import { getServerSession } from '#auth'

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)
  
  return {
    hasSession: !!session,
    session: session || null,
    timestamp: new Date().toISOString()
  }
})
