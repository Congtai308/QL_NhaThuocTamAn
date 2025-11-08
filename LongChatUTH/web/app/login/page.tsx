"use client";
import AuthCard from "@/components/auth/AuthCard";

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <AuthCard mode="login" />
    </main>
  );
}
