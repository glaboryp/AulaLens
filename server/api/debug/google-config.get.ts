export default defineEventHandler((event) => {
  assertDevOnly()

  const config = useRuntimeConfig(event)

  // Verificar que las credenciales tengan el formato correcto (solo booleanos)
  const clientId = config.googleClientId
  const clientSecret = config.googleClientSecret

  return {
    clientIdValid: !!clientId && clientId.endsWith('.apps.googleusercontent.com'),
    clientSecretValid: !!clientSecret && clientSecret.length >= 20,
    authSecretValid: !!config.authSecret && config.authSecret.length >= 32,
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  }
})
