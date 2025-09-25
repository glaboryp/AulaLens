export default defineNuxtRouteMiddleware((to) => {
  const { status } = useAuth()
  
  // Si no está autenticado y no está en la página de login, redirigir a login
  if (status.value === 'unauthenticated' && to.path !== '/loginPage') {
    return navigateTo('/loginPage')
  }
  
  // Si está autenticado y está en la página de login, redirigir al dashboard
  if (status.value === 'authenticated' && to.path === '/loginPage') {
    return navigateTo('/dashboardPage')
  }
})
