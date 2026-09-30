import type { Session } from 'next-auth'

// El callback `session` de server/api/auth/[...].ts añade `id` al usuario, pero el
// tipo Session de next-auth no lo declara.
export function getSessionUserId(session: Session) {
  return (session.user as { id?: string } | undefined)?.id
}
