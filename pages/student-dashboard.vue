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
        <UCard class="text-center shadow-aulalens-blue hover:shadow-lg transition-shadow duration-300">
          <div class="text-2xl font-bold text-aulalens-blue">
            {{ courses?.length || 0 }}
          </div>
          <div class="text-sm text-gray-600">
            Cursos Activos
          </div>
        </UCard>
        
        <UCard class="text-center shadow-lg hover:shadow-xl transition-shadow duration-300">
          <div class="text-2xl font-bold text-aulalens-purple">
            {{ totalPendingAssignments }}
          </div>
          <div class="text-sm text-gray-600">
            Tareas Pendientes
          </div>
        </UCard>
        
        <UCard class="text-center shadow-aulalens-green hover:shadow-lg transition-shadow duration-300">
          <div class="text-2xl font-bold text-aulalens-green">
            {{ averageProgress }}%
          </div>
          <div class="text-sm text-gray-600">
            Progreso Promedio
          </div>
        </UCard>
        
        <UCard class="text-center shadow-lg hover:shadow-xl transition-shadow duration-300">
          <div class="text-2xl font-bold text-aulalens-orange">
            {{ upcomingDeadlines }}
          </div>
          <div class="text-sm text-gray-600">
            Entregas Esta Semana
          </div>
        </UCard>
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
              placeholder="Buscar cursos..."
              icon="i-heroicons-magnifying-glass"
            />
          </div>
          <div class="flex gap-2">
            <USelectMenu
              v-model="statusFilter"
              :options="statusOptions"
              placeholder="Estado"
            />
            <USelectMenu
              v-model="sortBy"
              :options="sortOptions"
              placeholder="Ordenar por"
            />
          </div>
        </div>

        <!-- Grid de Cursos -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StudentCourseCard
            v-for="course in filteredCourses"
            :key="course.id"
            :course="course"
            class="transform hover:scale-105 transition-transform duration-200"
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

// Opciones para los selectores
const statusOptions = [
  { value: 'todos', label: 'Todos los cursos' },
  { value: 'ACTIVE', label: 'Cursos activos' },
  { value: 'ARCHIVED', label: 'Cursos archivados' }
]

const sortOptions = [
  { value: 'nombre', label: 'Nombre' },
  { value: 'reciente', label: 'Más reciente' },
  { value: 'progreso', label: 'Por progreso' }
]

// Obtener los cursos del usuario como estudiante
const { data: coursesData, pending, error, refresh } = await useFetch<{
  courses: Course[]
  user: UserInfo
}>('/api/classroom/courses?role=student', {
  default: () => ({ courses: [], user: {} }),
  server: false,
})

// Computed properties
const courses = computed(() => coursesData.value?.courses || [])
const userInfo = computed(() => coursesData.value?.user || {})

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