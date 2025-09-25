// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/eslint', '@nuxt/ui', '@sidebase/nuxt-auth'],
  
  // Configuración de CSS
  css: ['~/assets/css/main.css'],
  
  // Configurar el puerto de desarrollo
  devServer: {
    port: 3000,
    host: 'localhost'
  },
  
  auth: {
    baseURL: process.env.AUTH_ORIGIN || 'http://localhost:3000',
    provider: {
      type: 'authjs'
    }
  },

  runtimeConfig: {
    authSecret: process.env.NUXT_AUTH_SECRET,
    googleClientId: process.env.GOOGLE_CLIENT_ID,
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
    public: {
      authUrl: process.env.NUXT_AUTH_BASE_URL || "http://localhost:3000/api/auth"
    }
  },

  // Configurar redirecciones para las rutas principales
  nitro: {
    routeRules: {
      '/dashboard': { redirect: '/dashboardPage' },
      '/login': { redirect: '/loginPage' }
    }
  }
})