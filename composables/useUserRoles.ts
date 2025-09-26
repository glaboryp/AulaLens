// Composable para verificar los roles disponibles del usuario
export const useUserRoles = () => {
  // Estado para almacenar qué roles tiene el usuario
  const userRoles = useState('userRoles', () => ({
    hasStudentCourses: false,
    hasTeacherCourses: false,
    isLoaded: false
  }))

  // Función para obtener los roles del usuario
  const fetchUserRoles = async () => {
    if (userRoles.value.isLoaded) {
      return userRoles.value
    }

    try {
      // Hacer peticiones paralelas para ambos roles con un timeout
      const fetchWithTimeout = (url: string, timeout = 5000) => {
        return Promise.race([
          $fetch(url),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), timeout))
        ])
      }

      const [studentResponse, teacherResponse] = await Promise.allSettled([
        fetchWithTimeout('/api/classroom/courses?role=student'),
        fetchWithTimeout('/api/classroom/courses?role=teacher')
      ])

      // Procesar respuestas
      const studentCourses = studentResponse.status === 'fulfilled' 
        ? (studentResponse.value?.courses || []) 
        : []
      
      const teacherCourses = teacherResponse.status === 'fulfilled' 
        ? (teacherResponse.value?.courses || []) 
        : []

      // Actualizar el estado
      userRoles.value = {
        hasStudentCourses: studentCourses.length > 0,
        hasTeacherCourses: teacherCourses.length > 0,
        isLoaded: true
      }

      return userRoles.value
    } catch (error) {
      console.error('Error obteniendo roles de usuario:', error)
      // En caso de error total, asumir que tiene ambos roles para no bloquear
      userRoles.value = {
        hasStudentCourses: true,
        hasTeacherCourses: true,
        isLoaded: true
      }
      return userRoles.value
    }
  }

  // Función para resetear los roles (útil al cambiar de usuario)
  const resetRoles = () => {
    userRoles.value = {
      hasStudentCourses: false,
      hasTeacherCourses: false,
      isLoaded: false
    }
  }

  // Función para determinar la ruta por defecto
  const getDefaultRoute = () => {
    if (userRoles.value.hasStudentCourses && userRoles.value.hasTeacherCourses) {
      // Si tiene ambos, preferir estudiante
      return '/student-dashboard'
    } else if (userRoles.value.hasStudentCourses) {
      return '/student-dashboard'
    } else if (userRoles.value.hasTeacherCourses) {
      return '/teacher-dashboard'
    } else {
      // Si no tiene ninguno, ir a estudiante (mostrará mensaje de no cursos)
      return '/student-dashboard'
    }
  }

  return {
    userRoles: readonly(userRoles),
    fetchUserRoles,
    resetRoles,
    getDefaultRoute
  }
}