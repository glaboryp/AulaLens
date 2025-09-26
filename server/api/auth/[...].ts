import { NuxtAuthHandler } from '#auth'

// Extender los tipos de NextAuth para incluir nuestros campos personalizados
interface ExtendedSession {
  user?: {
    id?: string
    name?: string | null
    email?: string | null
    image?: string | null
  }
  expires: string
  accessToken?: string
  refreshToken?: string
}

export default NuxtAuthHandler({
  secret: useRuntimeConfig().authSecret,
  providers: [
    {
      id: 'google',
      name: 'Google',
      type: 'oauth',
      clientId: useRuntimeConfig().googleClientId,
      clientSecret: useRuntimeConfig().googleClientSecret,
      wellKnown: 'https://accounts.google.com/.well-known/openid-configuration',
      authorization: {
        params: {
          scope: 'openid email profile https://www.googleapis.com/auth/classroom.courses.readonly https://www.googleapis.com/auth/classroom.rosters.readonly https://www.googleapis.com/auth/classroom.coursework.students.readonly',
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code'
        }
      },
      idToken: true,
      checks: ['pkce', 'state'],
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture
        }
      }
    }
  ],
  callbacks: {
    jwt: async ({ user, token, account }) => {
      if (account && user) {
        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token
        token.user = user
      }
      return token
    },
    session: async ({ session, token }) => {
      const extendedSession: ExtendedSession = {
        ...session,
        accessToken: token.accessToken as string,
        refreshToken: token.refreshToken as string,
        user: token.user as ExtendedSession['user']
      }
      return extendedSession
    }
  },
  pages: {
    signIn: '/'
  }
})
