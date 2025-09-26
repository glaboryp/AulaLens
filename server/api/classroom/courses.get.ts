import { google } from 'googleapis'
import { getServerSession } from '#auth'

export default defineEventHandler(async (event) => {
  try {
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

    // Formatear la respuesta para incluir solo los datos necesarios
    const formattedCourses = courses.map(course => ({
      id: course.id,
      name: course.name,
      section: course.section,
      description: course.description,
      room: course.room,
      ownerId: course.ownerId,
      creationTime: course.creationTime,
      updateTime: course.updateTime,
      enrollmentCode: course.enrollmentCode,
      courseState: course.courseState,
      alternateLink: course.alternateLink,
      teacherGroupEmail: course.teacherGroupEmail,
      courseGroupEmail: course.courseGroupEmail,
      guardiansEnabled: course.guardiansEnabled,
      calendarId: course.calendarId
    }))

    // Retornar directamente en el formato que esperan los componentes
    return {
      courses: formattedCourses,
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
