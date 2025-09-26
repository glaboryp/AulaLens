<template>
  <div class="min-h-screen bg-gradient-bg">
    <!-- Estado de Carga para Redirección -->
    <div v-if="isRedirecting" class="flex justify-center items-center min-h-screen">
      <div class="text-center">
        <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-aulalens-blue mx-auto mb-4"/>
        <h2 class="text-xl font-semibold text-gray-900 mb-2">Analizando tu perfil...</h2>
        <p class="text-gray-600">Te redirigiremos al dashboard más apropiado según tus cursos</p>
      </div>
    </div>

    <!-- Fallback en caso de error en la redirección -->
    <div v-else class="container mx-auto px-4 py-8">
      <div class="text-center py-16">
        <Icon name="i-heroicons-arrow-path" class="w-12 h-12 mx-auto text-aulalens-blue mb-4" />
        <h1 class="text-2xl font-bold text-gray-900 mb-2">
          Redirigiendo...
        </h1>
        <p class="text-gray-600 mb-6">
          Si no eres redirigido automáticamente en unos segundos:
        </p>
        <div class="space-y-2">
          <NuxtLink 
            to="/teacher-dashboard" 
            class="block text-aulalens-blue hover:underline font-medium"
          >
            Dashboard de Profesor
          </NuxtLink>
          <NuxtLink 
            to="/student-dashboard" 
            class="block text-aulalens-blue hover:underline font-medium"
          >
            Dashboard de Estudiante
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'custom-auth'
})

// Estado de redirección
const isRedirecting = ref(true)

// Función para determinar y redirigir según el rol
const redirectToAppropriateDashboard = async () => {
  try {
    // Obtener información del rol del usuario
    const roleData = await $fetch('/api/classroom/user-role')
    
    console.log('Datos del rol del usuario:', roleData)
    
    // Redirigir según el rol principal
    if (roleData.primaryRole === 'teacher') {
      console.log('Redirigiendo a teacher-dashboard')
      await navigateTo('/teacher-dashboard')
    } else if (roleData.primaryRole === 'coordinator') {
      console.log('Redirigiendo a coordinator-dashboard')
      await navigateTo('/coordinator-dashboard')  
    } else {
      console.log('Redirigiendo a student-dashboard')
      // Por defecto, ir al dashboard de estudiante
      await navigateTo('/student-dashboard')
    }
  } catch (error) {
    console.error('Error al determinar el rol del usuario:', error)
    // En caso de error, mostrar las opciones manuales
    isRedirecting.value = false
  }
}

// Ejecutar la redirección al montar el componente
onMounted(async () => {
  await redirectToAppropriateDashboard()
})

// Meta tags para SEO
useHead({
  title: 'Redirigiendo - AulaLens',
  meta: [
    {
      name: 'description',
      content: 'Analizando tu perfil para redirigirte al dashboard más apropiado'
    }
  ]
})
</script>