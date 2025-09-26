export default defineNuxtRouteMiddleware((to) => {
  const { status } = useAuth()
  
  // Si no está autenticado y no está en la página principal, redirigir a página principal
  if (status.value === 'unauthenticated' && to.path !== '/') {
    return navigateTo('/')
  }
  
  // Si está autenticado y está en la página principal, redirigir al dashboard
  if (status.value === 'authenticated' && to.path === '/') {
    return navigateTo('/dashboard-redirect')
  }
})
