import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthOptions } from "next-auth";

const PHP_BASE =
  "http://nhom37.itimit.id.vn/QL_NhaThuocTamAn/LongChatUTH/api";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Gọi THẲNG sang PHP login (server-side nên dùng http được, không bị mixed-content)
          const res = await fetch(
            `${PHP_BASE}/index.php?path=login`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: credentials.email,
                password: credentials.password,
              }),
            }
          );

          if (!res.ok) {
            console.error("PHP login not OK:", res.status);
            return null;
          }

          let data: any;
          try {
            data = await res.json();
          } catch (e) {
            console.error("Parse PHP login JSON error:", e);
            return null;
          }

          console.log("✅ PHP login response:", data);

          // login.php nên trả dạng: { success: true, user: { id, name, email, role }, token: "..." }
          if (!data?.success || !data.user) {
            console.log("❌ PHP login failed:", data);
            return null;
          }

          const u = data.user;

          return {
            id: String(u.id),
            name: u.name,
            email: u.email,
            role: u.role || "user",
            token: data.token,
          } as any;
        } catch (error) {
          console.error("Authorize error:", error);
          // Trả null để NextAuth báo sai tài khoản thay vì crash
          return null;
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
