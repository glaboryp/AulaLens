<template>
  <div class="min-h-screen">
    <div class="container mx-auto px-4 py-8">
      <!-- Header del Dashboard del Profesor -->
      <div class="mb-8">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 mb-2">
              Dashboard del Profesor
            </h1>
            <p class="text-gray-600">
              Gestiona tus cursos y supervisa el progreso de tus estudiantes
            </p>
          </div>
          <div class="text-right">
            <p class="text-sm text-gray-500">
              Bienvenido/a de nuevo
            </p>
            <p class="font-medium text-gray-900">
              {{ userInfo?.name || 'Profesor' }}
            </p>
          </div>
        </div>

        <!-- Estadísticas del Profesor -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <!-- Cursos que Enseña -->
          <div class="stats-card">
            <div class="stats-icon bg-aulalens-blue/10">
              <Icon name="i-heroicons-academic-cap" class="w-6 h-6 text-aulalens-blue" />
            </div>
            <div class="stats-content">
              <div class="stats-number">{{ ownedCoursesCount }}</div>
              <div class="stats-label">Cursos que Enseño</div>
            </div>
          </div>

          <!-- Total de Estudiantes -->
          <div class="stats-card">
            <div class="stats-icon bg-green-100">
              <Icon name="i-heroicons-user-group" class="w-6 h-6 text-green-600" />
            </div>
            <div class="stats-content">
              <div class="stats-number">{{ totalStudents }}</div>
              <div class="stats-label">Total Estudiantes</div>
            </div>
          </div>

          <!-- Tareas Pendientes de Revisar -->
          <div class="stats-card">
            <div class="stats-icon bg-yellow-100">
              <Icon name="i-heroicons-clock" class="w-6 h-6 text-yellow-600" />
            </div>
            <div class="stats-content">
              <div class="stats-number">{{ pendingAssignments }}</div>
              <div class="stats-label">Tareas por Revisar</div>
            </div>
          </div>

          <!-- Actividad Esta Semana -->
          <div class="stats-card">
            <div class="stats-icon bg-purple-100">
              <Icon name="i-heroicons-chart-bar" class="w-6 h-6 text-purple-600" />
            </div>
            <div class="stats-content">
              <div class="stats-number">{{ weeklyActivity }}</div>
              <div class="stats-label">Actividad Semanal</div>
            </div>
          </div>
        </div>

        <!-- Estado de Carga -->
        <div v-if="pending" class="flex justify-center items-center py-12">
          <div class="text-center">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-aulalens-blue mx-auto mb-4"/>
            <p class="text-gray-600">Cargando tus cursos...</p>
          </div>
        </div>

        <!-- Estado de Error -->
        <div v-else-if="error" class="text-center py-12">
          <div class="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <Icon name="i-heroicons-exclamation-triangle" class="w-8 h-8 mx-auto mb-2 text-red-600" />
            <h3 class="text-lg font-semibold text-red-800 mb-2">
              Error al cargar los cursos
            </h3>
            <p class="text-red-600 text-sm mb-4">
              {{ error.message || 'Ha ocurrido un error inesperado' }}
            </p>
            <UButton
              color="red"
              size="sm"
              @click="refresh()"
            >
              Reintentar
            </UButton>
          </div>
        </div>

        <!-- Lista de Cursos que Enseña -->
        <div v-else-if="ownedCourses.length > 0">
          <div class="mb-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">
              Mis Cursos ({{ ownedCourses.length }})
            </h2>
          </div>

          <!-- Grid de Cursos -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <TeacherCourseCard
              v-for="course in ownedCourses"
              :key="course.id"
              :course="course"
              @view-students="viewStudents"
              @view-assignments="viewAssignments"
            />
          </div>
        </div>

        <!-- Estado Vacío -->
        <div v-else class="text-center py-16">
          <div class="max-w-md mx-auto">
            <Icon name="i-heroicons-academic-cap" class="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 class="text-lg font-medium text-gray-900 mb-2">
              No tienes cursos como profesor
            </h3>
            <p class="text-gray-500 mb-6">
              Crea tu primer curso en Google Classroom para comenzar a gestionar estudiantes.
            </p>
            <UButton
              color="primary"
              size="lg"
              external
              to="https://classroom.google.com"
              target="_blank"
            >
              Ir a Google Classroom
            </UButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'dashboard-layout',
  middleware: 'custom-auth'
})

// Composables
const { data: session } = useAuth()

// Obtener cursos del usuario como profesor
const { data, pending, error, refresh } = await useFetch('/api/classroom/courses?role=teacher')

// Información del usuario
const userInfo = computed(() => session.value?.user)

// Cursos que el usuario enseña (la API ya los filtra por rol)
const ownedCourses = computed(() => {
  return data.value?.courses || []
})

// Estadísticas calculadas
const ownedCoursesCount = computed(() => ownedCourses.value.length)

const totalStudents = computed(() => {
  // Placeholder - necesitaremos obtener esta información de la API
  return ownedCourses.value.length * 25 // Estimación: 25 estudiantes por curso
})

const pendingAssignments = computed(() => {
  // Placeholder - necesitaremos obtener esta información de la API
  return ownedCourses.value.length * 8 // Estimación: 8 tareas pendientes por curso
})

const weeklyActivity = computed(() => {
  // Placeholder - calcular basado en actividad reciente
  return ownedCourses.value.length * 12 // Estimación
})

// Definir tipos
interface Course {
  id: string
  name: string
  ownerId: string
}

// Métodos para manejar acciones
const viewStudents = (course: Course) => {
  navigateTo(`/teacher/course/${course.id}/students`)
}

const viewAssignments = (course: Course) => {
  navigateTo(`/teacher/course/${course.id}/assignments`)
}

// Meta tags
useHead({
  title: 'Dashboard del Profesor - AulaLens',
  meta: [
    {
      name: 'description',
      content: 'Dashboard para profesores de AulaLens. Gestiona tus cursos y supervisa el progreso de tus estudiantes.'
    }
  ]
})
</script>

<style scoped>
.stats-card {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  transition: box-shadow 0.2s;
}

.stats-card:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.stats-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
}

.stats-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stats-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
}

.stats-label {
  font-size: 0.875rem;
  color: #6b7280;
}
</style>