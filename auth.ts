import NextAuth, { NextAuthConfig } from 'next-auth';
import Google from "@auth/core/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import prisma from "@/prisma"
import type { User } from "@prisma/client"


export const config = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  trustHost: true,
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      if (isOnDashboard) {
        return false; 
      } else {
        return true;
      }

    },
    async jwt({ token, user }) {
      // Persist the userId right after signin
      if (user) {
        token.userId = user.id
      }
      return token
    },
    async session({ session, token, user }) {
      if (session.user && session.user.email) {

        /*const url = process.env.HOST + '/api/user?' + new URLSearchParams({
          email: session.user.email
        })

        const userResponse = await fetch(url)
        const foundUser: User = await userResponse.json()

        if (foundUser) {
          session.user.id = foundUser.id;
        }
        session.user.address = token.accessToken as string*/

        session.user.id = token.userId as string
        return session
      } else {
        return session
      }
    }
  },
  providers: [Google({ clientId: process.env.GOOGLE_CLIENT_ID, clientSecret: process.env.GOOGLE_CLIENT_SECRET })],
  //debug: true
} satisfies NextAuthConfig;
 
export const { handlers, auth, signIn, signOut } = NextAuth(config)