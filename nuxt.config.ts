// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/eslint', '@nuxt/ui', '@sidebase/nuxt-auth'],
  
  // Configuración de CSS
  css: ['~/assets/css/main.css'],

  // Configuración de transiciones de página
  app: {
    pageTransition: { 
      name: 'page', 
      mode: 'out-in',
      duration: 300
    },
    layoutTransition: { 
      name: 'layout', 
      mode: 'out-in',
      duration: 250 
    }
  },
  
  // Configurar el puerto de desarrollo
  devServer: {
    port: 3000,
    host: 'localhost'
  },
  
  auth: {
    // Solo un valor de plantilla para el build: el origen real es AUTH_ORIGIN en
    // runtime y lo aplica server/plugins/auth-origin.ts (NUXT_PUBLIC_AUTH_*).
    baseURL: 'http://localhost:3000',
    provider: {
      type: 'authjs'
    }
  },

  runtimeConfig: {
    authSecret: process.env.NUXT_AUTH_SECRET,
    googleClientId: process.env.GOOGLE_CLIENT_ID,
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
    public: {
      // Se rellena en runtime a partir de AUTH_ORIGIN (server/plugins/auth-origin.ts)
      authUrl: '',
      googleClientId: process.env.GOOGLE_CLIENT_ID
    }
  },

  // Configurar redirecciones para las rutas principales
  nitro: {
    routeRules: {
      '/dashboard': { redirect: '/dashboardPage' },
      '/login': { redirect: '/' }
    }
  }
})