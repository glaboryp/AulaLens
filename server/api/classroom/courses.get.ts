import { google } from 'googleapis'
import { getServerSession } from '#auth'

export default defineEventHandler(async (event) => {
  try {
    // Obtener parámetros de la query
    const query = getQuery(event)
    const role = query.role as string // 'student', 'teacher', o undefined (todos)

    // Verificar que el usuario esté autenticado
    const session = await getServerSession(event)
    
    if (!session || !session.accessToken) {
      throw createError({
        statusCode: 401,
        statusMessage: 'No autorizado. Debes iniciar sesión primero.'
      })
    }

    // Configurar el cliente OAuth2 de Google
    const oauth2Client = new google.auth.OAuth2(
      useRuntimeConfig().googleClientId,
      useRuntimeConfig().googleClientSecret
    )

    // Establecer las credenciales con el token de acceso del usuario
    oauth2Client.setCredentials({
      access_token: session.accessToken,
      refresh_token: session.refreshToken
    })

    // Crear el cliente de Google Classroom
    const classroom = google.classroom({
      version: 'v1',
      auth: oauth2Client
    })

    // Obtener la lista de cursos del usuario (activos y archivados)
    const response = await classroom.courses.list({
      courseStates: ['ACTIVE', 'ARCHIVED'], // Cursos activos y archivados
      pageSize: 100 // Máximo 100 cursos por página
    })

    const courses = response.data.courses || []
    const userId = session.user?.id

    // Filtrar cursos según el rol solicitado
    let filteredCourses = courses
    if (role === 'student') {
      // Solo cursos donde el usuario no es propietario (es estudiante)
      filteredCourses = courses.filter(course => course.ownerId !== userId)
    } else if (role === 'teacher') {
      // Solo cursos donde el usuario es propietario (es profesor)
      filteredCourses = courses.filter(course => course.ownerId === userId)
      
      // Añadir a cada curso el numero de estudiantes inscritos
      // Usar Promise.all para esperar a que todas las llamadas asíncronas se completen
      await Promise.all(
        filteredCourses.map(async (course) => {
          try {
            const studentsResponse = await classroom.courses.students.list({
              courseId: course.id!,
              pageSize: 100 // Obtener todos los estudiantes para contar correctamente
            })
            const studentCount = studentsResponse.data.students?.length || 0
            course.studentCount = studentCount
          } catch (studentError) {
            console.error(`Error al obtener estudiantes para el curso ${course.id}:`, studentError)
            course.studentCount = 0 // En caso de error, asumir 0 estudiantes
          }

          try {
            const courseworkResponse = await classroom.courses.courseWork.list({
              courseId: course.id!,
              pageSize: 100 // Obtener todas las tareas para contar correctamente
            })
            const assignmentCount = courseworkResponse.data.courseWork?.length || 0
            course.assignmentCount = assignmentCount
          } catch (courseworkError) {
            console.error(`Error al obtener tareas para el curso ${course.id}:`, courseworkError)
            course.assignmentCount = 0 // En caso de error, asumir 0 tareas
          }
        })
      )
    }

    return {
      courses: filteredCourses,
      user: {
        name: session.user?.name,
        email: session.user?.email
      }
    }

  } catch (error: unknown) {
    console.error('Error al obtener cursos de Google Classroom:', error)

    // Manejar diferentes tipos de errores
    const errorCode = (error as { code?: number })?.code
    
    if (errorCode === 401) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Token de acceso expirado. Por favor, inicia sesión nuevamente.'
      })
    }

    if (errorCode === 403) {
      throw createError({
        statusCode: 403,
        statusMessage: 'No tienes permisos para acceder a Google Classroom. Verifica que tengas los permisos necesarios.'
      })
    }

    if (errorCode === 404) {
      throw createError({
        statusCode: 404,
        statusMessage: 'No se encontraron cursos o el servicio de Google Classroom no está disponible.'
      })
    }

    // Error genérico
    throw createError({
      statusCode: 500,
      statusMessage: 'Error interno del servidor al obtener los cursos.'
    })
  }
})
