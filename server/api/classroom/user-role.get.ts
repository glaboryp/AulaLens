import { google } from 'googleapis'
import { getServerSession } from '#auth'

export default defineEventHandler(async (event) => {
  try {
    // Verificar que el usuario esté autenticado
    const session = await getServerSession(event) as any
    
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

    // Obtener la lista de cursos del usuario
    const response = await classroom.courses.list({
      courseStates: ['ACTIVE'], // Solo cursos activos para determinar rol
      pageSize: 100
    })

    const courses = response.data.courses || []
    const userId = session.user?.email

    // Analizar roles
    const ownedCourses = courses.filter(course => course.ownerId === userId)
    const enrolledCourses = courses.filter(course => course.ownerId !== userId)

    // Determinar el rol principal
    let primaryRole = 'student'
    
    if (ownedCourses.length > 0) {
      primaryRole = 'teacher'
    }

    // Si tiene muchos cursos como estudiante y pocos como profesor, 
    // podríamos considerar coordinador si es admin de la organización
    if (ownedCourses.length > 5) {
      primaryRole = 'coordinator'
    }

    return {
      primaryRole,
      roles: {
        teacher: ownedCourses.length > 0,
        student: enrolledCourses.length > 0,
        coordinator: ownedCourses.length > 5 // Simplificación: 5+ cursos = coordinador
      },
      stats: {
        ownedCourses: ownedCourses.length,
        enrolledCourses: enrolledCourses.length,
        totalCourses: courses.length
      }
    }

  } catch (error: unknown) {
    console.error('Error al analizar roles del usuario:', error)

    const errorCode = (error as { code?: number })?.code
    
    if (errorCode === 401) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Token de acceso expirado. Por favor, inicia sesión nuevamente.'
      })
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Error al analizar los roles del usuario.'
    })
  }
})