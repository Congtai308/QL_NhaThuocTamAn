"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Phone,
  Mail,
  Lock,
  User,
  Apple,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { signIn } from "next-auth/react";

export type AuthCardMode = "login" | "register";

export default function AuthCard({ mode = "login" }: { mode?: AuthCardMode }) {
  const router = useRouter();
  const [step, setStep] = React.useState<"phone" | "otp" | "done">("phone");
  const [method, setMethod] = React.useState<"phone" | "email">("email"); // mặc định tab Email
  const [phone, setPhone] = React.useState("");
  const [otp, setOtp] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const title = mode === "login" ? "Đăng nhập" : "Đăng ký";
  const desc =
    mode === "login"
      ? "Vui lòng đăng nhập để hưởng những đặc quyền dành cho thành viên."
      : "Tạo tài khoản để nhận ưu đãi, theo dõi đơn hàng và tích điểm.";

  function handleContinue() {
    if (/^0\d{9}$/.test(phone)) setStep("otp");
  }
  function handleVerify() {
    if (/^\d{4,6}$/.test(otp)) setStep("done");
  }

  // ✅ Gọi NextAuth thay cho fetch PHP trực tiếp
  async function submitEmail(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);

    const name = (form.get("name") as string) || "";
    const email = (form.get("email") as string) || "";
    const password = (form.get("password") as string) || "";
    const confirm = (form.get("confirm") as string) || "";

    try {
      setLoading(true);

      if (mode === "register") {
        // ✅ Validate nhanh
        if (!name.trim()) return alert("Vui lòng nhập họ và tên.");
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
          return alert("Email không hợp lệ.");
        if (password.length < 6) return alert("Mật khẩu tối thiểu 6 ký tự.");
        if (password !== confirm) return alert("Mật khẩu xác nhận không khớp.");

        // 🔹 Gọi API PHP để đăng ký
        const res = await fetch(
          "http://localhost:9000/LongChatUTH/api/register.php",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password }),
          }
        );
        const data = await res.json();

        if (!res.ok || !data?.success) {
          alert(data?.message || "Đăng ký thất bại!");
          return;
        }

        // ✅ Thành công: hiện màn “Done” rồi chuyển sang /login
        setStep("done");
        setTimeout(() => router.push("/login"), 1500);
        return;
      }

      // 🔹 Login qua NextAuth
      // 🔹 Đăng nhập qua NextAuth
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });
      console.log("🔍 Kết quả đăng nhập:", res);

      if (res?.error) {
        alert("Sai email hoặc mật khẩu!");
        return;
      }

      // ✅ Đăng nhập thành công → NextAuth tự lưu JWT session
      router.push("/");

      // ✅ Đăng nhập xong → về trang chủ
      router.push("/");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="rounded-3xl bg-white/80 backdrop-blur border border-slate-200 shadow-[0_10px_30px_rgba(2,6,23,0.08)]">
        {/* Header */}
        <div className="px-8 pt-8 text-center">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
            {title}
          </h1>
          <p className="mt-2 text-sm text-slate-500">{desc}</p>
        </div>

        {/* Tabs */}
        <div className="mt-6 px-8">
          <div className="grid grid-cols-2 rounded-xl border bg-slate-50 p-1 text-sm">
            <button
              className={`rounded-lg py-2 transition ${
                method === "phone"
                  ? "bg-white shadow font-medium"
                  : "hover:text-slate-900 text-slate-600"
              }`}
              onClick={() => setMethod("phone")}
              type="button"
            >
              Số điện thoại
            </button>
            <button
              className={`rounded-lg py-2 transition ${
                method === "email"
                  ? "bg-white shadow font-medium"
                  : "hover:text-slate-900 text-slate-600"
              }`}
              onClick={() => setMethod("email")}
              type="button"
            >
              Email & mật khẩu
            </button>
          </div>
        </div>

        <div className="px-8 pb-8">
          {/* PHONE FLOW (demo) */}
          {method === "phone" && step !== "done" && (
            <div className="pt-6 space-y-4">
              {step === "phone" && (
                <>
                  <label className="text-sm font-medium" htmlFor="phone">
                    Số điện thoại
                  </label>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-500" />
                    <input
                      id="phone"
                      className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-4 ring-blue-100"
                      placeholder="VD: 0912345678"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                  <button
                    className="mt-2 w-full rounded-xl bg-blue-700 px-4 py-2.5 text-white hover:bg-blue-800 transition"
                    onClick={handleContinue}
                    type="button"
                  >
                    Tiếp tục
                  </button>
                </>
              )}

              {step === "otp" && (
                <>
                  <label className="text-sm font-medium" htmlFor="otp">
                    Nhập mã OTP
                  </label>
                  <input
                    id="otp"
                    className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-4 ring-blue-100"
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                  />
                  <button
                    className="mt-2 w-full rounded-xl bg-blue-700 px-4 py-2.5 text-white hover:bg-blue-800 transition"
                    onClick={handleVerify}
                    type="button"
                  >
                    {mode === "login" ? "Đăng nhập" : "Đăng ký"}
                  </button>
                  <p className="text-xs text-slate-500 text-center">
                    Mã OTP đã gửi về số {phone}.{" "}
                    <button className="underline">Gửi lại</button>
                  </p>
                </>
              )}
            </div>
          )}

          {/* EMAIL FLOW (NextAuth) */}
          {method === "email" && step !== "done" && (
            <form className="pt-6 space-y-4" onSubmit={submitEmail}>
              {mode === "register" && (
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Họ và tên
                  </label>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-500" />
                    <input
                      name="name"
                      id="name"
                      placeholder="Nguyễn Văn A"
                      className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-4 ring-blue-100"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-500" />
                  <input
                    name="email"
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-4 ring-blue-100"
                    required
                  />
                </div>
              </div>

              {/* Mật khẩu */}
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Mật khẩu
                </label>
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-slate-500" />
                  <input
                    name="password"
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-4 ring-blue-100"
                    required
                  />
                </div>
              </div>

              {/* Xác nhận mật khẩu – chỉ với register */}
              {mode === "register" && (
                <div className="space-y-2">
                  <label htmlFor="confirm" className="text-sm font-medium">
                    Xác nhận mật khẩu
                  </label>
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-slate-500" />
                    <input
                      name="confirm"
                      id="confirm"
                      type="password"
                      placeholder="••••••••"
                      className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-4 ring-blue-100"
                      required
                    />
                  </div>
                </div>
              )}

              <button
                className="w-full rounded-xl bg-blue-700 px-4 py-2.5 text-white hover:bg-blue-800 transition flex items-center justify-center gap-2 disabled:opacity-60"
                type="submit"
                disabled={loading}
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {mode === "login" ? "Đăng nhập" : "Tạo tài khoản"}
              </button>
            </form>
          )}

          {/* DONE */}
          {step === "done" && (
            <div className="flex flex-col items-center gap-3 py-10">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
              <p className="font-medium text-lg">
                {mode === "login"
                  ? "Đăng nhập thành công"
                  : "Đăng ký thành công"}
              </p>
              <p className="text-sm text-slate-500 text-center">
                {mode === "login"
                  ? "Bạn có thể tiếp tục mua sắm."
                  : "Tài khoản đã sẵn sàng. Hãy đăng nhập để bắt đầu."}
              </p>
              {mode === "register" && (
                <Link
                  href="/login"
                  className="mt-2 inline-flex items-center justify-center rounded-xl bg-blue-700 px-4 py-2.5 text-white hover:bg-blue-800 transition"
                >
                  Đăng nhập ngay
                </Link>
              )}
            </div>
          )}

          {/* Divider + Social */}
          {step !== "done" && (
            <>
              <div className="my-6 relative">
                <div className="h-px bg-slate-200" />
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-3 text-[11px] text-slate-500">
                  Hoặc tiếp tục bằng
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <button
                  className="w-full rounded-xl border px-3 py-2 hover:bg-slate-50 transition"
                  type="button"
                >
                  {/* Google icon inline */}
                  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
                    <path
                      fill="#FFC107"
                      d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.7 3l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"
                    />
                    <path
                      fill="#FF3D00"
                      d="M6.3 14.7l6.6 4.8C14.8 16 19 14 24 14c3 0 5.7 1.1 7.7 3l5.7-5.7C34.6 6.1 29.6 4 24 4 15.8 4 8.7 8.6 6.3 14.7z"
                    />
                    <path
                      fill="#4CAF50"
                      d="M24 44c5.2 0 10-2 13.6-5.3l-6.3-5.1C29.2 35.2 26.7 36 24 36c-5.2 0-9.6-3.4-11.2-8l-6.5 5C8.7 39.4 15.8 44 24 44z"
                    />
                    <path
                      fill="#1976D2"
                      d="M43.6 20.5H42V20H24v8h11.3c-1 3.2-3.6 5.8-6.7 7.1l.1.1 6.3 5.1C37 41.7 40 36.6 40 30c0-1.3-.1-2.7-.4-3.5z"
                    />
                  </svg>
                </button>
                <button
                  className="w-full rounded-xl border px-3 py-2 hover:bg-slate-50 transition"
                  type="button"
                  aria-label="Facebook"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
                    <path
                      fill="currentColor"
                      d="M22 12a10 10 0 1 0-11.6 9.9v-7H8v-3h2.4V9.5c0-2.4 1.4-3.8 3.6-3.8 1 0 2 .2 2 .2v2.2h-1.1c-1.1 0-1.5.7-1.5 1.4V12H16l-.4 3h-2.2v7A10 10 0 0 0 22 12"
                    />
                  </svg>
                </button>
                <button
                  className="w-full rounded-xl border px-3 py-2 hover:bg-slate-50 transition"
                  type="button"
                >
                  <Apple className="w-5 h-5" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
