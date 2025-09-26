export default defineEventHandler((_event) => {
  const config = useRuntimeConfig()
  
  return {
    hasAuthSecret: !!config.authSecret,
    hasGoogleClientId: !!config.googleClientId,
    hasGoogleClientSecret: !!config.googleClientSecret,
    authSecretLength: config.authSecret?.length || 0,
    googleClientIdPrefix: config.googleClientId?.substring(0, 10) + '...' || 'not set',
    publicGoogleClientId: config.public.googleClientId?.substring(0, 10) + '...' || 'not set',
    nodeEnv: process.env.NODE_ENV,
    authUrl: config.public.authUrl
  }
})
