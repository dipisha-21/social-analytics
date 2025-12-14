import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "dipisha/lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope:
            "openid email profile https://www.googleapis.com/auth/youtube.readonly",
        },
      },
      // Since you only use Google, this avoids OAuthAccountNotLinked conflicts
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      // First time the user signs in, account will be defined
      if (account) {
        (token as any).accessToken = account.access_token;
        if (account.refresh_token) {
          (token as any).refreshToken = account.refresh_token;
        }
        if (account.expires_at) {
          (token as any).expiresAt = account.expires_at;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && (token as any).accessToken) {
        (session as any).accessToken = (token as any).accessToken;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
