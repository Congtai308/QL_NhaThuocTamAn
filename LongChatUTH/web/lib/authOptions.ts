import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const res = await fetch(
            "/api/php?path=login",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: credentials?.email,
                password: credentials?.password,
              }),
            }
          );

          const data = await res.json();
          console.log("✅ PHP Response:", data);

          if (data?.success && data.user) {
            const u = data.user;

            return {
              id: u.id,
              name: u.name,
              email: u.email,
              role: u.role || "user",
              token: data.token,
            };
          }

          return null;
        } catch (error) {
          console.error("Authorize error:", error);
          throw new Error("Không thể kết nối máy chủ PHP");
        }
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as any;

        (token as any).accessToken = u.token;
        (token as any).user = {
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
        };
      }
      return token;
    },

    async session({ session, token }) {
      const t = token as any;

      (session as any).accessToken = t.accessToken;

      (session as any).user = {
        ...(session.user || {}),
        ...(t.user || {}),
      };

      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET || "local-dev-secret",

  pages: {
    signIn: "/login",
  },
};
