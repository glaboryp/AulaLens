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

    // Obtener el courseId de los parámetros de la URL
    const courseId = getRouterParam(event, 'courseId')
    
    if (!courseId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ID del curso requerido.'
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

    // Obtener la lista de estudiantes del curso
    const studentsResponse = await classroom.courses.students.list({
      courseId: courseId,
      pageSize: 100 // Máximo 100 estudiantes por página
    })

    const students = studentsResponse.data.students || []

    // Formatear la respuesta para incluir solo los datos necesarios
    const formattedStudents = students.map(student => ({
      courseId: student.courseId,
      userId: student.userId,
      profile: {
        id: student.profile?.id,
        name: student.profile?.name?.fullName,
        givenName: student.profile?.name?.givenName,
        familyName: student.profile?.name?.familyName,
        emailAddress: student.profile?.emailAddress,
        photoUrl: student.profile?.photoUrl
      }
    }))

    // También obtener información básica del curso
    const courseResponse = await classroom.courses.get({
      id: courseId
    })

    return {
      success: true,
      data: {
        course: {
          id: courseResponse.data.id,
          name: courseResponse.data.name,
          section: courseResponse.data.section,
          ownerId: courseResponse.data.ownerId
        },
        students: formattedStudents,
        totalCount: formattedStudents.length,
        user: {
          name: session.user?.name,
          email: session.user?.email
        }
      }
    }

  } catch (error: any) {
    console.error('Error al obtener estudiantes del curso:', error)

    // Manejar diferentes tipos de errores
    if (error.code === 401) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Token de acceso expirado. Por favor, inicia sesión nuevamente.'
      })
    }

    if (error.code === 403) {
      throw createError({
        statusCode: 403,
        statusMessage: 'No tienes permisos para acceder a este curso o a la información de los estudiantes.'
      })
    }

    if (error.code === 404) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Curso no encontrado o no tienes acceso a él.'
      })
    }

    // Error genérico
    throw createError({
      statusCode: 500,
      statusMessage: 'Error interno del servidor al obtener los estudiantes del curso.'
    })
  }
})
