"use client";

import AuthCard from "@/components/auth/AuthCard";

export default function RegisterPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#e3f0ff] via-white to-[#f5f7ff]">
      <AuthCard mode="register" />
    </main>
  );
}
