import { NextAuthConfig } from "next-auth"

// Base config that works in Edge runtime (for middleware)
export const authConfig: NextAuthConfig = {
  providers: [], // Providers are added in the full config
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
      }
      return session
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnAuth = nextUrl.pathname.startsWith("/auth")
      const isOnDashboard =
        nextUrl.pathname.startsWith("/dashboard") || nextUrl.pathname.startsWith("/workspace")

      if (isOnDashboard) {
        if (isLoggedIn) return true
        return false // Redirect unauthenticated users to login page
      } else if (isLoggedIn && isOnAuth) {
        return Response.redirect(new URL("/dashboard", nextUrl))
      }
      return true
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
}
