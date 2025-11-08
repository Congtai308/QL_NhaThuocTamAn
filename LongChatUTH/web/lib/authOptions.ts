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
            "http://localhost:9000/LongChatUTH/api/login.php",
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
            // ✅ Thêm role (admin / employee / user)
            return {
              id: data.user.id,
              name: data.user.name,
              email: data.user.email,
              role: data.user.role || "user", // 🟢 Mặc định user
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
    strategy: "jwt", // ✅ Lưu session bằng JWT
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.token;
        token.user = {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role, // ✅ Lưu role vào JWT
        };
      }
      return token;
    },

    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.user = token.user; // ✅ Đưa user (kèm role) vào session
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET || "local-dev-secret",
  pages: {
    signIn: "/login",
  },
};
