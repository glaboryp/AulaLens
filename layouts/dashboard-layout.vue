<template>
  <div class="min-h-screen bg-gradient-bg dark:bg-gray-900">
    <!-- Navegación superior -->
    <nav class="bg-white/95 backdrop-blur-sm dark:bg-gray-800/95 shadow-aulalens-blue border-b border-gray-200/20 dark:border-gray-700 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <!-- Logo y navegación principal -->
          <div class="flex items-center">
            <NuxtLink to="/" class="flex items-center">
              <img class="h-8 w-auto" src="/logo-icono.png" alt="AulaLens" >
              <span class="ml-3 text-xl font-bold text-gray-900 dark:text-white">
                AulaLens
              </span>
            </NuxtLink>

            <!-- Enlaces de navegación -->
            <div class="hidden md:ml-8 md:flex md:items-center md:space-x-4">
              <NuxtLink
                to="/student-dashboard"
                class="nav-link"
                active-class="nav-link-active"
              >
                <Icon name="i-heroicons-academic-cap" class="w-4 h-4 mr-2" />
                Estudiante
              </NuxtLink>
              
              <NuxtLink
                to="/teacher-dashboard"
                class="nav-link"
                active-class="nav-link-active"
              >
                <Icon name="i-heroicons-user-group" class="w-4 h-4 mr-2" />
                Profesor
              </NuxtLink>
              
              <NuxtLink
                to="/coordinator-dashboard"
                class="nav-link"
                active-class="nav-link-active"
              >
                <Icon name="i-heroicons-chart-bar-square" class="w-4 h-4 mr-2" />
                Coordinador
              </NuxtLink>
            </div>
          </div>

          <!-- Menú de usuario -->
          <div class="flex items-center space-x-3">

            <!-- Menú desplegable de usuario -->
            <div ref="userMenuRef" class="relative">
              <button 
                class="flex items-center space-x-2 text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 px-3 py-2 rounded-md transition-colors"
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
                class="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
              >
                <!-- Usuario info -->
                <div class="px-4 py-3 border-b border-gray-200 dark:border-gray-600">
                  <p class="text-sm font-medium text-gray-900 dark:text-white">{{ userInfo?.name || 'Usuario' }}</p>
                  <p class="text-sm text-gray-500 dark:text-gray-400 truncate">{{ userInfo?.email || 'usuario@email.com' }}</p>
                </div>
                
                <!-- Menu items -->
                <div class="py-1">
                  <button
                    class="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600"
                    @click="() => { console.log('Navegar al perfil'); showUserMenu = false }"
                  >
                    <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Mi Perfil
                  </button>
                  
                  <button
                    class="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600"
                    @click="() => { console.log('Navegar a configuración'); showUserMenu = false }"
                  >
                    <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Configuración
                  </button>
                  
                  <hr class="my-1 border-gray-200 dark:border-gray-600">
                  
                  <button
                    class="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
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
        <div class="md:hidden pb-4">
          <div class="flex space-x-1">
            <NuxtLink
              to="/student-dashboard"
              class="mobile-nav-link"
              active-class="mobile-nav-link-active"
            >
              Estudiante
            </NuxtLink>
            
            <NuxtLink
              to="/teacher-dashboard"
              class="mobile-nav-link"
              active-class="mobile-nav-link-active"
            >
              Profesor
            </NuxtLink>
            
            <NuxtLink
              to="/coordinator-dashboard"
              class="mobile-nav-link"
              active-class="mobile-nav-link-active"
            >
              Coordinador
            </NuxtLink>
          </div>
        </div>
      </div>
    </nav>

    <!-- Contenido principal -->
    <main>
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
const { data: session, signOut } = useAuth()

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

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

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
    class: 'text-red-600 dark:text-red-400',
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
  color: #6b7280;
  transition: all 0.2s;
}

.nav-link:hover {
  color: #111827;
  background-color: #f3f4f6;
}

.nav-link-active {
  color: var(--aulalens-blue);
  background-color: rgba(60, 164, 216, 0.1);
}

.mobile-nav-link {
  display: block;
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 1rem;
  font-weight: 500;
  color: #6b7280;
  transition: all 0.2s;
}

.mobile-nav-link:hover {
  color: #111827;
  background-color: #f3f4f6;
}

.mobile-nav-link-active {
  color: var(--aulalens-blue);
  background-color: rgba(60, 164, 216, 0.1);
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .nav-link,
  .mobile-nav-link {
    color: #d1d5db;
  }

  .nav-link:hover,
  .mobile-nav-link:hover {
    color: #ffffff;
    background-color: #374151;
  }

  .nav-link-active,
  .mobile-nav-link-active {
    color: var(--aulalens-blue);
    background-color: rgba(60, 164, 216, 0.2);
  }
}
</style>