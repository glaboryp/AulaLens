<template>
  <div class="min-h-screen bg-gradient-bg">
    <!-- Navegación superior -->
    <nav class="bg-white/95 backdrop-blur-sm shadow-aulalens-blue border-b border-gray-200/20 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <!-- Logo y navegación principal -->
          <div class="flex items-center">
            <NuxtLink to="/" class="flex items-center">
              <img class="h-8 w-auto" src="/logo-icono.png" alt="AulaLens" >
              <span class="ml-3 text-xl font-bold text-gray-900">
                AulaLens
              </span>
            </NuxtLink>

            <!-- Enlaces de navegación -->
            <div class="hidden md:ml-8 md:flex md:items-center md:space-x-2">
              <NuxtLink
                v-if="userRoles.hasStudentCourses || !userRoles.isLoaded"
                to="/student-dashboard"
                class="nav-link-interactive"
                active-class="nav-link-active"
                @click="handleNavigation('/student-dashboard', '🎓 Estudiante')"
              >
                <span class="ml-2">🎓 Estudiante</span>
              </NuxtLink>
              
              <NuxtLink
                v-if="userRoles.hasTeacherCourses || !userRoles.isLoaded"
                to="/teacher-dashboard"
                class="nav-link-interactive"
                active-class="nav-link-active"
                @click="handleNavigation('/teacher-dashboard', '👨‍🏫 Profesor')"
              >
                <span class="ml-2">👨‍🏫 Profesor</span>
              </NuxtLink>
            </div>
          </div>

          <!-- Menú de usuario -->
          <div class="flex items-center space-x-3">

            <!-- Menú desplegable de usuario -->
            <div ref="userMenuRef" class="relative">
              <button 
                class="flex items-center space-x-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 px-3 py-2 rounded-md transition-colors"
                @click="showUserMenu = !showUserMenu"
              >
                <div class="w-8 h-8 bg-aulalens-blue text-white rounded-full flex items-center justify-center text-sm font-medium">
                  {{ userInfo?.name?.split(' ').map(n => n[0]).join('') || 'U' }}
                </div>
                <span class="hidden sm:block text-sm font-medium">
                  {{ userInfo?.name?.split(' ')[0] || 'Usuario' }}
                </span>
                <svg class="w-4 h-4 transition-transform" :class="{ 'rotate-180': showUserMenu }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              <!-- Dropdown menu -->
              <div 
                v-show="showUserMenu"
                class="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
              >
                <!-- Usuario info -->
                <div class="px-4 py-3 border-b border-gray-200">
                  <p class="text-sm font-medium text-gray-900">{{ userInfo?.name || 'Usuario' }}</p>
                  <p class="text-sm text-gray-500 truncate">{{ userInfo?.email || 'usuario@email.com' }}</p>
                </div>
                
                <!-- Menu items -->
                <div class="py-1">
                  <button
                    class="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    @click="() => showUserMenu = false"
                  >
                    <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Mi Perfil
                  </button>
                  
                  <button
                    class="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    @click="() => showUserMenu = false"
                  >
                    <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Configuración
                  </button>
                  
                  <hr class="my-1 border-gray-200">
                  
                  <button
                    class="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    @click="handleLogout"
                  >
                    <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Cerrar Sesión
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Navegación móvil -->
        <div v-if="(userRoles.hasStudentCourses || userRoles.hasTeacherCourses) || !userRoles.isLoaded" class="md:hidden pb-4">
          <div class="flex space-x-1">
            <NuxtLink
              v-if="userRoles.hasStudentCourses || !userRoles.isLoaded"
              to="/student-dashboard"
              class="mobile-nav-link"
              active-class="mobile-nav-link-active"
            >
              🎓 Estudiante
            </NuxtLink>
            
            <NuxtLink
              v-if="userRoles.hasTeacherCourses || !userRoles.isLoaded"
              to="/teacher-dashboard"
              class="mobile-nav-link"
              active-class="mobile-nav-link-active"
            >
              👨‍🏫 Profesor
            </NuxtLink>
          </div>
        </div>
      </div>
    </nav>

    <!-- Overlay de carga global -->
    <Transition
      name="loading-overlay"
      enter-active-class="loading-overlay-enter-active"
      leave-active-class="loading-overlay-leave-active"
      enter-from-class="loading-overlay-enter-from"
      leave-to-class="loading-overlay-leave-to"
    >
      <div 
        v-if="isLoading" 
        class="loading-overlay"
      >
        <div class="loading-content">
          <div class="loading-spinner-large" />
          <p class="loading-text">
            {{ globalLoadingState.isNavigating ? 'Cambiando dashboard...' : 'Cargando datos...' }}
          </p>
        </div>
      </div>
    </Transition>

    <!-- Contenido principal -->
    <main class="main-content">
      <div class="content-wrapper">
        <slot />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
const { data: session, signOut } = useAuth()

// Proteger el composable para SSR
let globalLoadingComposable
if (import.meta.client) {
  globalLoadingComposable = useGlobalLoading()
} else {
  // Fallbacks para SSR
  globalLoadingComposable = {
    isLoading: ref(false),
    startNavigation: () => {},
    finishNavigation: () => {},
    finishDataLoading: () => {},
    globalLoadingState: ref({
      isNavigating: false,
      isLoadingData: false,
      currentRoute: null
    })
  }
}

// Composable para roles de usuario (protegido para SSR)
const { userRoles, fetchUserRoles, getDefaultRoute } = import.meta.client 
  ? useUserRoles() 
  : { 
      userRoles: ref({ hasStudentCourses: true, hasTeacherCourses: true, isLoaded: false }), 
      fetchUserRoles: async () => ({}), 
      getDefaultRoute: () => '/student-dashboard' 
    }

const { 
  isLoading, 
  startNavigation, 
  finishNavigation,
  finishDataLoading,
  globalLoadingState 
} = globalLoadingComposable

// Información del usuario
const userInfo = computed(() => session.value?.user)

// Estado del menú desplegable
const showUserMenu = ref(false)
const userMenuRef = ref<HTMLElement>()

// Cerrar menú al hacer click fuera
const handleClickOutside = (event: Event) => {
  if (userMenuRef.value && !userMenuRef.value.contains(event.target as Node)) {
    showUserMenu.value = false
  }
}

// Watcher para detectar cambios de usuario y refrescar roles
watch(() => session.value?.user?.email, async (newEmail, oldEmail) => {
  if (newEmail !== oldEmail && import.meta.client) {
    // Reset roles when user changes
    userRoles.value.isLoaded = false
    await fetchUserRoles()
    await checkAndRedirectUser()
  }
})

onMounted(async () => {
  if (import.meta.client) {
    document.addEventListener('click', handleClickOutside)
    // Limpiar cualquier estado de carga residual al montar
    finishDataLoading()
    
    // Obtener los roles del usuario
    await fetchUserRoles()
    
    // Verificar si el usuario debe ser redirigido
    await checkAndRedirectUser()
  }
})

onUnmounted(() => {
  if (import.meta.client) {
    document.removeEventListener('click', handleClickOutside)
  }
})

// Función para verificar y redirigir usuario según sus roles
const checkAndRedirectUser = async () => {
  if (!import.meta.client) return
  
  const route = useRoute()
  const router = useRouter()
  
  // Solo verificar en páginas de dashboard
  if (!route.path.includes('dashboard')) return
  
  const roles = userRoles.value
  
  // Si está en student-dashboard pero no tiene cursos de estudiante
  if (route.path === '/student-dashboard' && !roles.hasStudentCourses && roles.hasTeacherCourses) {
    await router.push('/teacher-dashboard')
    return
  }
  
  // Si está en teacher-dashboard pero no tiene cursos de profesor
  if (route.path === '/teacher-dashboard' && !roles.hasTeacherCourses && roles.hasStudentCourses) {
    await router.push('/student-dashboard')
    return
  }
  
  // Si no tiene ningún curso, ir a la ruta por defecto
  if (!roles.hasStudentCourses && !roles.hasTeacherCourses) {
    await router.push(getDefaultRoute())
  }
}

// Función para manejar navegación con feedback visual
const handleNavigation = async (path: string, _title: string) => {
  // Solo ejecutar en el cliente
  if (!import.meta.client) return
  
  const route = useRoute()
  const router = useRouter()
  
  if (route.path === path) return // Ya estamos en esa página
  
  // Iniciar navegación con spinner en el botón
  startNavigation(path)
  
  try {
    await router.push(path)
    // Terminar navegación - el spinner se mantendrá si hay carga de datos
    finishNavigation()
  } catch (error) {
    console.error('Error de navegación:', error)
    finishNavigation()
    // En caso de error, limpiar completamente
    setTimeout(() => {
      globalLoadingState.value.currentRoute = null
    }, 100)
  }
}

// Función para manejar el logout
const handleLogout = async () => {
  try {
    showUserMenu.value = false
    await signOut({ callbackUrl: '/' })
  } catch (error) {
    console.error('Error al cerrar sesión:', error)
  }
}

// Elementos del menú de usuario (mantenido para compatibilidad)
const _userMenuItems = [
  [{
    label: userInfo.value?.email || 'usuario@email.com',
    icon: 'i-heroicons-envelope',
    disabled: true,
    class: 'text-gray-500 text-xs'
  }],
  [{
    label: 'Mi Perfil',
    icon: 'i-heroicons-user',
    click: () => {
      // Navegar al perfil (placeholder)
      console.log('Navegar al perfil')
    }
  }, {
    label: 'Configuración',
    icon: 'i-heroicons-cog-6-tooth',
    click: () => {
      // Navegar a configuración (placeholder)
      console.log('Navegar a configuración')
    }
  }],
  [{
    label: 'Cerrar Sesión',
    icon: 'i-heroicons-arrow-right-on-rectangle',
    class: 'text-red-600',
    click: async () => {
      try {
        await signOut({ callbackUrl: '/' })
      } catch (error) {
        console.error('Error al cerrar sesión:', error)
      }
    }
  }]
]
</script>

<style scoped>
.nav-link {
  display: flex;
  align-items: center;
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151 !important;
  text-decoration: none;
  transition: all 0.2s;
}

.nav-link:hover {
  color: #111827 !important;
  background-color: #f3f4f6;
  text-decoration: none;
}

.nav-link-active {
  color: var(--aulalens-blue) !important;
  background-color: rgba(60, 164, 216, 0.15);
  font-weight: 600;
}

.mobile-nav-link {
  display: block;
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 1rem;
  font-weight: 500;
  color: #374151 !important;
  text-decoration: none;
  transition: all 0.2s;
}

.mobile-nav-link:hover {
  color: #111827 !important;
  background-color: #f3f4f6;
  text-decoration: none;
}

.mobile-nav-link-active {
  color: var(--aulalens-blue) !important;
  background-color: rgba(60, 164, 216, 0.15);
  font-weight: 600;
}

/* Estilos para transiciones suaves del contenido */
.main-content {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.content-wrapper {
  animation: contentFadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

@keyframes contentFadeIn {
  from {
    opacity: 0;
    transform: translateY(15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Transiciones mejoradas para los enlaces de navegación */
.nav-link,
.mobile-nav-link {
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.nav-link::before,
.mobile-nav-link::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.nav-link:hover::before,
.mobile-nav-link:hover::before {
  left: 100%;
}

/* Transiciones para el menú de usuario */
.user-menu-enter-active,
.user-menu-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.user-menu-enter-from,
.user-menu-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

/* Estilos para navegación interactiva */
.nav-link-interactive {
  display: inline-flex;
  align-items: center;
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  background-color: transparent;
  border: 1px solid transparent;
  border-radius: 0.5rem;
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  cursor: pointer;
}

.nav-link-interactive:hover {
  color: var(--aulalens-blue);
  background-color: rgba(59, 130, 246, 0.05);
  border-color: rgba(59, 130, 246, 0.2);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(59, 130, 246, 0.1);
}

.nav-link-active {
  color: var(--aulalens-blue) !important;
  background-color: rgba(59, 130, 246, 0.1) !important;
  border-color: var(--aulalens-blue) !important;
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.15);
}

/* Spinner de carga */
.loading-spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid #e5e7eb;
  border-radius: 50%;
  border-top-color: var(--aulalens-blue);
  animation: spin 0.8s ease-in-out infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Indicador de carga en navegación */
.nav-link-interactive[data-loading="true"] {
  pointer-events: none;
  opacity: 0.7;
  background-color: rgba(59, 130, 246, 0.05);
}

.nav-link-interactive[data-loading="true"]::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.1), transparent);
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

/* Overlay de carga global */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(2px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeInOverlay 0.3s ease-out;
}

.loading-content {
  text-align: center;
  padding: 2rem;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.1);
}

.loading-spinner-large {
  width: 40px;
  height: 40px;
  border: 3px solid #e5e7eb;
  border-radius: 50%;
  border-top-color: var(--aulalens-blue);
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

.loading-text {
  color: #6b7280;
  font-size: 0.875rem;
  font-weight: 500;
  margin: 0;
}

/* Transiciones del overlay */
.loading-overlay-enter-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.loading-overlay-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.loading-overlay-enter-from {
  opacity: 0;
  backdrop-filter: blur(0px);
  transform: scale(0.98);
}

.loading-overlay-leave-to {
  opacity: 0;
  backdrop-filter: blur(0px);
  transform: scale(1.02);
}

@keyframes fadeInOverlay {
  from {
    opacity: 0;
    backdrop-filter: blur(0px);
    transform: scale(0.98);
  }
  to {
    opacity: 1;
    backdrop-filter: blur(2px);
    transform: scale(1);
  }
}
</style>