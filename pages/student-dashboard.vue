<template>
  <div class="min-h-screen">
    <div class="container mx-auto px-4 py-8">
      <!-- Header del Dashboard del Estudiante -->
      <div class="mb-8">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 mb-2">
              Mis Cursos
            </h1>
            <p class="text-gray-600">
              Revisa tus tareas, progreso y fechas de entrega
            </p>
          </div>
          <div class="text-right">
            <p class="text-sm text-gray-500">
              Bienvenido/a de nuevo
            </p>
            <p class="font-medium text-gray-900">
              {{ userInfo?.name || 'Estudiante' }}
            </p>
          </div>
        </div>
      </div>

      <!-- Resumen rápido -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <!-- Cursos Activos -->
        <div class="stats-card stats-animation animation-delay-0">
          <div class="stats-content">
            <div class="stats-number text-aulalens-blue">{{ courses?.length || 0 }}</div>
            <div class="stats-label">Cursos Activos</div>
          </div>
        </div>

        <!-- Tareas Pendientes -->
        <div class="stats-card stats-animation animation-delay-1">
          <div class="stats-content">
            <div class="stats-number text-aulalens-purple">{{ totalPendingAssignments }}</div>
            <div class="stats-label">Tareas Pendientes</div>
          </div>
        </div>

        <!-- Progreso Promedio -->
        <div class="stats-card stats-animation animation-delay-2">
          <div class="stats-content">
            <div class="stats-number text-aulalens-green">{{ averageProgress }}%</div>
            <div class="stats-label">Progreso Promedio</div>
          </div>
        </div>

        <!-- Entregas Esta Semana -->
        <div class="stats-card stats-animation animation-delay-3">
          <div class="stats-content">
            <div class="stats-number text-aulalens-orange">{{ upcomingDeadlines }}</div>
            <div class="stats-label">Entregas Esta Semana</div>
          </div>
        </div>
      </div>

      <!-- Estado de Carga -->
      <div v-if="pending" class="flex justify-center items-center py-12">
        <div class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"/>
          <p class="text-gray-600">Cargando tus cursos...</p>
        </div>
      </div>

      <!-- Estado de Error -->
      <div v-else-if="error" class="text-center py-12">
        <UCard class="max-w-md mx-auto">
          <div class="text-center">
            <div class="text-red-600 mb-4">
              <Icon name="i-heroicons-exclamation-triangle" class="w-12 h-12 mx-auto" />
            </div>
            <h3 class="text-lg font-semibold text-red-800 mb-2">
              Error al cargar los cursos
            </h3>
            <p class="text-red-600 text-sm mb-4">
              {{ error.message || 'Ha ocurrido un error inesperado' }}
            </p>
            <UButton 
              color="error"
              @click="refresh()"
            >
              Reintentar
            </UButton>
          </div>
        </UCard>
      </div>

      <!-- Lista de Cursos -->
      <div v-else-if="courses && courses.length > 0">
        <!-- Filtros y búsqueda -->
        <div class="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div class="flex-1">
            <UInput
              v-model="searchQuery"
              placeholder="    Buscar cursos..."
              icon="i-heroicons-magnifying-glass"
            />
          </div>
        </div>

        <!-- Grid de Cursos -->
        <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <StudentCourseCard
            v-for="(course, index) in filteredCourses"
            :key="course.id"
            :course="course"
            :class="[
              'course-card-animation transform hover:scale-105 transition-all duration-300',
              `animation-delay-${Math.min(index, 9)}`
            ]"
          />
        </div>

        <!-- Mensaje si no hay cursos después del filtro -->
        <div v-if="filteredCourses.length === 0" class="text-center py-8">
          <p class="text-gray-500">
            No se encontraron cursos que coincidan con tu búsqueda.
          </p>
        </div>
      </div>

      <!-- Estado Vacío -->
      <div v-else class="text-center py-12">
        <UCard class="max-w-md mx-auto">
          <div class="text-center">
            <Icon name="i-heroicons-academic-cap" class="w-16 h-16 text-blue-500 mx-auto mb-4" />
            <h3 class="text-lg font-semibold text-gray-900 mb-2">
              No hay cursos disponibles
            </h3>
            <p class="text-gray-600 mb-4">
              Aún no estás inscrito en ningún curso de Google Classroom.
            </p>
            <UButton 
              color="primary"
              @click="refresh()"
            >
              Actualizar
            </UButton>
          </div>
        </UCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

// Configuración de la página
definePageMeta({
  layout: 'dashboard-layout',
  middleware: 'custom-auth'
})

// Interfaces
interface Course {
  id: string
  name: string
  section?: string
  description?: string
  room?: string
  ownerId: string
  creationTime: string
  updateTime: string
  enrollmentCode?: string
  courseState: string
  alternateLink: string
}

interface UserInfo {
  name?: string
  email?: string
}

// Estados reactivos para filtros
const searchQuery = ref('')
const statusFilter = ref('todos')
const sortBy = ref('nombre')

// Composable para el estado de carga global (protegido para SSR)
const { startDataLoading, finishDataLoading } = import.meta.client 
  ? useGlobalLoading() 
  : { startDataLoading: (_route?: string) => {}, finishDataLoading: () => {} }

// Estado local para mantener los datos durante las transiciones
const stableCourses = ref<Course[]>([])
const stableUserInfo = ref<UserInfo>({})
const isFirstLoad = ref(true)
const isTransitioning = ref(false)

// Obtener los cursos del usuario como estudiante
const { data: coursesData, pending, error, refresh } = await useFetch<{
  courses: Course[]
  user: UserInfo
}>('/api/classroom/courses?role=student', {
  default: () => ({ courses: [], user: {} }),
  server: false,
  key: 'student-courses', // Clave única para el caché
})

// Observar cambios en coursesData para actualizar el estado estable solo cuando hay datos reales
watch(coursesData, (newData) => {
  if (newData && newData.courses !== undefined) {
    // Si tenemos datos (incluso vacíos), actualizar inmediatamente
    if (!isTransitioning.value) {
      stableCourses.value = newData.courses
      stableUserInfo.value = newData.user || {}
      isFirstLoad.value = false
    } else {
      // Durante transición, esperar un poco antes de actualizar
      setTimeout(() => {
        stableCourses.value = newData.courses
        stableUserInfo.value = newData.user || {}
        isFirstLoad.value = false
        isTransitioning.value = false
      }, 150)
    }
  }
}, { immediate: true })

// Observar cambios en el estado de pending para manejar el loading global
// Función para refrescar datos manualmente
const refreshData = async () => {
  startDataLoading('/student-dashboard')
  
  try {
    await refresh()
    // Esperar un poco para simular carga mínima
    setTimeout(() => {
      finishDataLoading()
      isTransitioning.value = false
    }, 500)
  } catch (error) {
    console.error('Error refreshing student data:', error)
    finishDataLoading()
    isTransitioning.value = false
  }
}

// Watcher para pending (para cargas automáticas)
watch(pending, (newPending, oldPending) => {
  
  // Solo activar loading si realmente está pendiente y es un cambio nuevo
  if (newPending && !oldPending) {
    isTransitioning.value = true
    startDataLoading('/student-dashboard')
  } else if (!newPending && oldPending) {
    // Dar tiempo para que se procesen los datos antes de quitar el spinner
    setTimeout(() => {
      finishDataLoading()
      isTransitioning.value = false
    }, 150)
  }
}, { immediate: false })

// Watcher para detectar cambios de ruta
watch(() => useRoute().path, (newPath) => {
  if (newPath === '/student-dashboard') {
    // Si no hay datos o si es una navegación nueva, refrescar
    if (stableCourses.value.length === 0 || !pending.value) {
      refreshData()
    }
  }
}, { immediate: true })

// Computed properties que usan el estado estable
const courses = computed(() => stableCourses.value)
const userInfo = computed(() => stableUserInfo.value)

// Cursos filtrados (la API ya los filtra por rol, aquí solo aplicamos búsqueda y ordenación)
const filteredCourses = computed(() => {
  let filtered = [...courses.value]

  // Filtrar por texto de búsqueda
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(course => 
      course.name.toLowerCase().includes(query) ||
      course.section?.toLowerCase().includes(query) ||
      course.description?.toLowerCase().includes(query)
    )
  }

  // Filtrar por estado
  if (statusFilter.value !== 'todos') {
    filtered = filtered.filter(course => course.courseState === statusFilter.value)
  }

  // Ordenar
  switch (sortBy.value) {
    case 'reciente':
      filtered.sort((a, b) => new Date(b.updateTime).getTime() - new Date(a.updateTime).getTime())
      break
    case 'nombre':
      filtered.sort((a, b) => a.name.localeCompare(b.name))
      break
    case 'progreso':
      // Por ahora ordenación simulada - en el futuro será por progreso real
      filtered.sort((a, b) => a.id.localeCompare(b.id))
      break
  }

  return filtered
})

// Estadísticas computadas basadas en cursos de estudiante (simuladas por ahora)
const totalPendingAssignments = computed(() => {
  return courses.value.reduce((total, course) => {
    const hash = course.id.split('').reduce((a, b) => a + b.charCodeAt(0), 0)
    return total + (hash % 6)
  }, 0)
})

const averageProgress = computed(() => {
  if (courses.value.length === 0) return 0
  
  const totalProgress = courses.value.reduce((sum, course) => {
    const hash = course.id.split('').reduce((a, b) => a + b.charCodeAt(0), 0)
    return sum + Math.max(20, (hash % 100))
  }, 0)
  
  return Math.round(totalProgress / courses.value.length)
})

const upcomingDeadlines = computed(() => {
  // Simulado: número de entregas esta semana basado en cursos de estudiante
  return Math.min(courses.value.length, Math.floor(courses.value.length * 0.6))
})

// Meta tags
useHead({
  title: 'Mis Cursos - AulaLens',
  meta: [
    {
      name: 'description',
      content: 'Dashboard de estudiante en AulaLens - Revisa tus cursos, tareas y progreso académico'
    }
  ]
})
</script>

<style scoped>
/* Animaciones escalonadas para las tarjetas */
.course-card-animation {
  opacity: 0;
  transform: translateY(30px);
  animation: slideInStaggered 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

@keyframes slideInStaggered {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Delays escalonados */
.animation-delay-0 { animation-delay: 0.1s; }
.animation-delay-1 { animation-delay: 0.2s; }
.animation-delay-2 { animation-delay: 0.3s; }
.animation-delay-3 { animation-delay: 0.4s; }
.animation-delay-4 { animation-delay: 0.5s; }
.animation-delay-5 { animation-delay: 0.6s; }
.animation-delay-6 { animation-delay: 0.7s; }
.animation-delay-7 { animation-delay: 0.8s; }
.animation-delay-8 { animation-delay: 0.9s; }
.animation-delay-9 { animation-delay: 1.0s; }

/* Transición suave para hover */
.course-card-animation:hover {
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  transform: translateY(-5px) scale(1.02);
}

/* Estilos para las tarjetas de estadísticas */
.stats-card {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-align: center;
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stats-card:hover {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
  border-color: rgba(60, 164, 216, 0.3);
}

.stats-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
}

.stats-number {
  font-size: 2rem;
  font-weight: 700;
  line-height: 1;
  margin-bottom: 0.5rem;
}

.stats-label {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

/* Animaciones para las tarjetas de estadísticas */
.stats-animation {
  opacity: 0;
  transform: translateY(20px);
  animation: fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Efectos hover mejorados para stats */
.stats-card:hover .stats-number {
  transform: scale(1.05);
  transition: transform 0.2s ease-in-out;
}
</style>