"use client";
import AuthCard from "@/components/auth/AuthCard";

export default function RegisterPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-sky-50 via-white to-white">
      <AuthCard mode="register" />
    </main>
  );
}
