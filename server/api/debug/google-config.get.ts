export default defineEventHandler((_event) => {
  const config = useRuntimeConfig()
  
  // Verificar que las credenciales tengan el formato correcto
  const clientId = config.googleClientId
  const clientSecret = config.googleClientSecret
  
  return {
    clientIdValid: clientId && clientId.endsWith('.apps.googleusercontent.com'),
    clientIdLength: clientId?.length || 0,
    clientIdSuffix: clientId?.slice(-30) || 'not set',
    clientSecretValid: clientSecret && clientSecret.length >= 20,
    clientSecretLength: clientSecret?.length || 0,
    authSecretValid: config.authSecret && config.authSecret.length >= 32,
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  }
})
