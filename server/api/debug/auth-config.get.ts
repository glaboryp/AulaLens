export default defineEventHandler((event) => {
  assertDevOnly()

  const config = useRuntimeConfig(event)

  // Solo indicadores booleanos: nunca valores, prefijos, sufijos ni longitudes de secretos.
  return {
    hasAuthSecret: !!config.authSecret,
    hasGoogleClientId: !!config.googleClientId,
    hasGoogleClientSecret: !!config.googleClientSecret,
    nodeEnv: process.env.NODE_ENV
  }
})
