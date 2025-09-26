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
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <!-- Cursos que Enseña -->
          <div class="stats-card stats-animation animation-delay-0">
            <div class="stats-content">
              <div class="stats-number text-aulalens-blue">{{ ownedCoursesCount }}</div>
              <div class="stats-label">Cursos que Enseño</div>
            </div>
          </div>

          <!-- Total de Estudiantes -->
          <div class="stats-card stats-animation animation-delay-1">
            <div class="stats-content">
              <div class="stats-number text-aulalens-green">{{ totalStudents }}</div>
              <div class="stats-label">Total Estudiantes</div>
            </div>
          </div>

          <!-- Tareas Pendientes de Revisar -->
          <div class="stats-card stats-animation animation-delay-2">
            <div class="stats-content">
              <div class="stats-number text-aulalens-orange">{{ pendingAssignments }}</div>
              <div class="stats-label">Tareas por Revisar</div>
            </div>
          </div>

          <!-- Actividad Esta Semana -->
          <div class="stats-card stats-animation animation-delay-3">
            <div class="stats-content">
              <div class="stats-number text-aulalens-purple">{{ healthScore }} %</div>
              <div class="stats-label">Health Score de media</div>
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
          <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            <TeacherCourseCard
              v-for="(course, index) in ownedCourses"
              :key="course.id"
              :course="course"
              :class="[
                'course-card-animation transform hover:scale-105 transition-all duration-300',
                `animation-delay-${Math.min(index, 9)}`
              ]"
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

        <!-- Sección de Estudiantes -->
        <div v-if="ownedCourses.length > 0" class="mt-12">
          <div class="mb-6">
            <div class="flex items-center justify-between mb-4">
              <div>
                <h2 class="text-xl font-semibold text-gray-900 mb-2">
                  Mis Estudiantes ({{ students.length }})
                </h2>
                <p class="text-gray-600 text-sm">
                  Supervisa el progreso y rendimiento académico de todos tus estudiantes
                </p>
              </div>
              
              <!-- Controles de Ordenamiento -->
              <div v-if="students.length > 0" class="flex items-center space-x-2">
                <span class="text-sm text-gray-500 mr-2">Ordenar por:</span>
                
                <UButton
                  :variant="sortBy === 'name' ? 'solid' : 'ghost'"
                  :color="sortBy === 'name' ? 'primary' : 'gray'"
                  size="sm"
                  class="flex items-center space-x-1 cursor-pointer"
                  @click="setSortBy('name')"
                >
                  <span>Nombre</span>
                  <Icon :name="getSortIcon('name')" class="w-3 h-3" />
                </UButton>
                
                <UButton
                  :variant="sortBy === 'healthScore' ? 'solid' : 'ghost'"
                  :color="sortBy === 'healthScore' ? 'primary' : 'gray'"
                  size="sm"
                  class="flex items-center space-x-1 cursor-pointer"
                  @click="setSortBy('healthScore')"
                >
                  <span>Health Score</span>
                  <Icon :name="getSortIcon('healthScore')" class="w-3 h-3" />
                </UButton>
                
                <UButton
                  :variant="sortBy === 'completionRate' ? 'solid' : 'ghost'"
                  :color="sortBy === 'completionRate' ? 'primary' : 'gray'"
                  size="sm"
                  class="flex items-center space-x-1 cursor-pointer"
                  @click="setSortBy('completionRate')"
                >
                  <span>% Completitud</span>
                  <Icon :name="getSortIcon('completionRate')" class="w-3 h-3" />
                </UButton>
              </div>
            </div>
          </div>

          <!-- Estado de Carga de Estudiantes -->
          <div v-if="studentsPending" class="flex justify-center items-center py-8">
            <div class="text-center">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-aulalens-blue mx-auto mb-2"/>
              <p class="text-gray-600 text-sm">Cargando estudiantes...</p>
            </div>
          </div>

          <!-- Estado de Error de Estudiantes -->
          <div v-else-if="studentsError" class="text-center py-8">
            <div class="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md mx-auto">
              <Icon name="i-heroicons-exclamation-triangle" class="w-6 h-6 mx-auto mb-2 text-red-600" />
              <h3 class="text-md font-semibold text-red-800 mb-2">
                Error al cargar estudiantes
              </h3>
              <p class="text-red-600 text-sm mb-3">
                {{ studentsError.message || 'Ha ocurrido un error inesperado' }}
              </p>
              <UButton
                color="red"
                size="sm"
                @click="refreshStudents()"
              >
                Reintentar
              </UButton>
            </div>
          </div>

          <!-- Grid de Estudiantes -->
          <div v-else-if="students.length > 0" class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            <StudentCard
              v-for="(student, index) in students"
              :key="student.id"
              :student="student"
              :class="[
                'student-card-animation transform hover:scale-105 transition-all duration-300',
                `animation-delay-${Math.min(index, 9)}`
              ]"
            />
          </div>

          <!-- Estado Vacío de Estudiantes -->
          <div v-else class="text-center py-12">
            <div class="max-w-md mx-auto">
              <Icon name="i-heroicons-users" class="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 class="text-lg font-medium text-gray-900 mb-2">
                No hay estudiantes inscritos
              </h3>
              <p class="text-gray-500 mb-4">
                Cuando los estudiantes se inscriban a tus cursos, aparecerán aquí.
              </p>
            </div>
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
const { startDataLoading, finishDataLoading } = import.meta.client 
  ? useGlobalLoading() 
  : { startDataLoading: (_route?: string) => {}, finishDataLoading: () => {} }

// Estado local para mantener los datos durante las transiciones
const stableCourses = ref([])
const stableStudents = ref([])
const isFirstLoad = ref(true)
const isTransitioning = ref(false)

// Estado para ordenamiento de estudiantes
const sortBy = ref('healthScore') // 'name', 'healthScore', 'completionRate'
const sortOrder = ref('desc') // 'asc', 'desc'

// Obtener cursos del usuario como profesor
const { data, pending, error, refresh } = await useFetch('/api/classroom/courses?role=teacher', {
  key: 'teacher-courses',
  server: false
})

// Obtener estudiantes del profesor
const { data: studentsData, pending: studentsPending, error: studentsError, refresh: refreshStudents } = await useFetch('/api/classroom/students', {
  key: 'teacher-students',
  server: false
})

// Observar cambios en data para actualizar el estado estable solo cuando hay datos reales
watch(data, (newData) => {
  if (newData && newData.courses !== undefined) {
    // Si tenemos datos (incluso vacíos), actualizar inmediatamente
    if (!isTransitioning.value) {
      stableCourses.value = newData.courses
      isFirstLoad.value = false
    } else {
      stableCourses.value = newData.courses
      isFirstLoad.value = false
      isTransitioning.value = false
    }
  }
}, { immediate: true })

// Observar cambios en studentsData para actualizar el estado estable de estudiantes
watch(studentsData, (newData) => {
  if (newData && newData.students !== undefined) {
    // Si tenemos datos de estudiantes (incluso vacíos), actualizar inmediatamente
    if (!isTransitioning.value) {
      stableStudents.value = newData.students
    } else {
      stableStudents.value = newData.students
    }
  }
}, { immediate: true })

// Función para refrescar datos manualmente
const refreshData = async () => {
  startDataLoading('/teacher-dashboard')
  
  try {
    // Refrescar tanto cursos como estudiantes
    await Promise.all([refresh(), refreshStudents()])
    finishDataLoading()
    isTransitioning.value = false
  } catch (error) {
    console.error('Error refreshing teacher data:', error)
    finishDataLoading()
    isTransitioning.value = false
  }
}

// Observar cambios en el estado de pending para manejar el loading global
watch(pending, (newPending, oldPending) => {
  
  // Solo activar loading si realmente está pendiente y es un cambio nuevo
  if (newPending && !oldPending) {
    isTransitioning.value = true
    startDataLoading('/teacher-dashboard')
  } else if (!newPending && oldPending) {
    finishDataLoading()
    isTransitioning.value = false
  }
}, { immediate: false })

// Watcher para detectar cambios de ruta
watch(() => useRoute().path, (newPath) => {
  if (newPath === '/teacher-dashboard') {
    // Si no hay datos o si es una navegación nueva, refrescar
    if (stableCourses.value.length === 0 || !pending.value) {
      refreshData()
    }
  }
}, { immediate: true })

// Información del usuario
const userInfo = computed(() => session.value?.user)

// Cursos que el usuario enseña (usa el estado estable)
const ownedCourses = computed(() => {
  return stableCourses.value || []
})

// Estudiantes del profesor (usa el estado estable y aplica ordenamiento)
const students = computed(() => {
  const studentsList = [...(stableStudents.value || [])]
  
  if (studentsList.length === 0) return []
  
  // Aplicar ordenamiento
  studentsList.sort((a, b) => {
    let aValue, bValue
    
    switch (sortBy.value) {
      case 'name':
        aValue = a.name.toLowerCase()
        bValue = b.name.toLowerCase()
        break
      case 'healthScore':
        aValue = a.healthScore
        bValue = b.healthScore
        break
      case 'completionRate':
        aValue = a.totalAssignments > 0 ? (a.completedAssignments / a.totalAssignments) : 0
        bValue = b.totalAssignments > 0 ? (b.completedAssignments / b.totalAssignments) : 0
        break
      default:
        return 0
    }
    
    if (sortOrder.value === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
    }
  })
  
  return studentsList
})

// Estadísticas calculadas
const ownedCoursesCount = computed(() => ownedCourses.value.length)

const totalStudents = computed(() => {
  return students.value.length
})

const pendingAssignments = computed(() => {
  return students.value.reduce((sum, student) => sum + (student.totalAssignments - student.completedAssignments), 0)
})

const healthScore = computed(() => {
  return students.value.length === 0 
    ? 0 
    : Math.round(students.value.reduce((sum, s) => sum + s.healthScore, 0) / students.value.length)
})

// Definir tipos
interface Course {
  id: string
  name: string
  ownerId: string
}

// Funciones para ordenamiento de estudiantes
const setSortBy = (field: string) => {
  if (sortBy.value === field) {
    // Si ya está ordenado por este campo, cambiar la dirección
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    // Si es un campo nuevo, usar la dirección por defecto según el campo
    sortBy.value = field
    sortOrder.value = field === 'name' ? 'asc' : 'desc'
  }
}

const getSortIcon = (field: string) => {
  if (sortBy.value !== field) return 'i-heroicons-bars-arrow-up'
  return sortOrder.value === 'asc' ? 'i-heroicons-bars-arrow-up' : 'i-heroicons-bars-arrow-down'
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

/* Animación para las tarjetas de estudiantes */
.student-card-animation {
  opacity: 0;
  transform: translateY(20px);
  animation: slideInStaggered 0.6s ease-out forwards;
}

.student-card-animation:hover {
  box-shadow: 0 15px 20px -5px rgba(0, 0, 0, 0.1), 0 8px 8px -5px rgba(0, 0, 0, 0.04);
  transform: translateY(-3px) scale(1.01);
}
</style>