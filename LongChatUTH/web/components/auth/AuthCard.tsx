"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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

type Props = {
  mode?: AuthCardMode;
  onClose?: () => void;
  onSwitchMode?: (mode: AuthCardMode) => void;
};

type Step = "phone" | "otp" | "done";

export default function AuthCard({
  mode = "login",
  onClose,
  onSwitchMode,
}: Props) {
  const router = useRouter();
  const [step, setStep] = React.useState<Step>("phone");
  const [method, setMethod] = React.useState<"phone" | "email">("email");
  const [phone, setPhone] = React.useState("");
  const [otp, setOtp] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const title = mode === "login" ? "Đăng nhập" : "Đăng ký";
  const desc =
    mode === "login"
      ? "Vui lòng đăng nhập để hưởng những đặc quyền dành cho thành viên."
      : "Tạo tài khoản để nhận ưu đãi, theo dõi đơn hàng và tích điểm.";

  // reset step khi đổi mode (login <-> register) từ bên ngoài
  React.useEffect(() => {
    setStep("phone");
    setMethod("email");
    setOtp("");
    setPhone("");
    setLoading(false);
  }, [mode]);

  // ---- PHONE + OTP (demo UI, chưa nối backend) ----
  function handleContinuePhone() {
    if (!/^0\d{9}$/.test(phone)) {
      alert("Vui lòng nhập số điện thoại hợp lệ (10 số, bắt đầu bằng 0).");
      return;
    }
    setStep("otp");
  }

  function handleVerifyOtp() {
    if (!/^\d{4,6}$/.test(otp)) {
      alert("Vui lòng nhập mã OTP 4–6 số.");
      return;
    }
    // Ở đây bạn có thể call API OTP thật, nếu thành công thì:
    setStep("done");
  }

  // ---- EMAIL + PASSWORD (NextAuth + PHP) ----
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
        if (!name.trim()) {
          alert("Vui lòng nhập họ và tên.");
          return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          alert("Email không hợp lệ.");
          return;
        }
        if (password.length < 6) {
          alert("Mật khẩu tối thiểu 6 ký tự.");
          return;
        }
        if (password !== confirm) {
          alert("Mật khẩu xác nhận không khớp.");
          return;
        }

        // Gọi API PHP để đăng ký
        const res = await fetch(
          "http://nhom37.itimit.id.vn/QL_NhaThuocTamAn/LongChatUTH/api/register.php",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fullname: name, email, password }),
          }
        );
        const data = await res.json();

        if (!res.ok || !data?.success) {
          alert(data?.message || "Đăng ký thất bại!");
          return;
        }

        // Thành công: chuyển sang bước DONE
        setStep("done");
        return;
      }

      // Đăng nhập qua NextAuth credentials
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        alert("Sai email hoặc mật khẩu!");
        return;
      }

      // Đăng nhập thành công
      router.push("/"); // về trang chủ (nếu đang ở route khác)
      onClose?.(); // đóng popup nếu có
    } catch (err) {
      console.error(err);
      alert("Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }

  const isRegister = mode === "register";

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="rounded-3xl bg-white/90 backdrop-blur border border-slate-200 shadow-[0_18px_45px_rgba(15,23,42,0.22)] overflow-hidden">
        {/* Header */}
        <div className="px-8 pt-7 pb-3 text-center border-b border-slate-100 bg-gradient-to-r from-[#0a56c5]/5 via-sky-50 to-emerald-50">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-900">
            {title}
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-500">{desc}</p>
        </div>

        {/* Tabs: Phone / Email */}
        <div className="mt-5 px-8">
          <div className="grid grid-cols-2 rounded-xl border border-slate-100 bg-slate-50 p-1 text-sm">
            <button
              className={`rounded-lg py-2 transition ${
                method === "phone"
                  ? "bg-white shadow-sm font-medium text-slate-900"
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
                  ? "bg-white shadow-sm font-medium text-slate-900"
                  : "hover:text-slate-900 text-slate-600"
              }`}
              onClick={() => setMethod("email")}
              type="button"
            >
              Email & mật khẩu
            </button>
          </div>
        </div>

        <div className="px-8 pb-7">
          {/* ==== FLOW SỐ ĐIỆN THOẠI + OTP (DEMO) ==== */}
          {method === "phone" && step !== "done" && (
            <div className="pt-6 space-y-4">
              {step === "phone" && (
                <>
                  <label
                    className="text-sm font-medium text-slate-800"
                    htmlFor="phone"
                  >
                    Số điện thoại
                  </label>
                  <div className="flex items-center gap-2 rounded-xl border px-3 py-2 bg-white focus-within:ring-4 focus-within:ring-blue-100">
                    <Phone className="w-4 h-4 text-slate-500" />
                    <input
                      id="phone"
                      className="w-full border-none outline-none text-sm bg-transparent"
                      placeholder="VD: 0912345678"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                  <button
                    className="mt-2 w-full rounded-xl bg-[#0a56c5] px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition"
                    onClick={handleContinuePhone}
                    type="button"
                  >
                    Tiếp tục
                  </button>
                  <p className="text-[11px] text-slate-500">
                    Chúng tôi sẽ gửi mã OTP về số điện thoại để{" "}
                    {mode === "login" ? "đăng nhập" : "đăng ký"} nhanh, không
                    cần mật khẩu.
                  </p>
                </>
              )}

              {step === "otp" && (
                <>
                  <label
                    className="text-sm font-medium text-slate-800"
                    htmlFor="otp"
                  >
                    Nhập mã OTP
                  </label>
                  <input
                    id="otp"
                    className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-4 ring-blue-100 text-center tracking-[0.4em] text-lg"
                    placeholder="••••••"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                  />
                  <button
                    className="mt-2 w-full rounded-xl bg-[#0a56c5] px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition"
                    onClick={handleVerifyOtp}
                    type="button"
                  >
                    {mode === "login" ? "Đăng nhập" : "Đăng ký"} bằng OTP
                  </button>
                  <p className="text-[11px] text-slate-500 text-center mt-1">
                    Mã OTP đã gửi về số <strong>{phone}</strong>.{" "}
                    <button className="underline underline-offset-2">
                      Gửi lại mã
                    </button>
                  </p>
                </>
              )}
            </div>
          )}

          {/* ==== FLOW EMAIL (LOGIN / REGISTER) ==== */}
          {method === "email" && step !== "done" && (
            <form className="pt-6 space-y-4" onSubmit={submitEmail}>
              {isRegister && (
                <div className="space-y-2">
                  <label
                    htmlFor="name"
                    className="text-sm font-medium text-slate-800"
                  >
                    Họ và tên
                  </label>
                  <div className="flex items-center gap-2 rounded-xl border px-3 py-2 bg-white focus-within:ring-4 focus-within:ring-blue-100">
                    <User className="w-4 h-4 text-slate-500" />
                    <input
                      name="name"
                      id="name"
                      placeholder="Nguyễn Văn A"
                      className="w-full border-none outline-none text-sm bg-transparent"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Email */}
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-slate-800"
                >
                  Email
                </label>
                <div className="flex items-center gap-2 rounded-xl border px-3 py-2 bg-white focus-within:ring-4 focus-within:ring-blue-100">
                  <Mail className="w-4 h-4 text-slate-500" />
                  <input
                    name="email"
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className="w-full border-none outline-none text-sm bg-transparent"
                    required
                  />
                </div>
              </div>

              {/* Mật khẩu */}
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-slate-800"
                >
                  Mật khẩu
                </label>
                <div className="flex items-center gap-2 rounded-xl border px-3 py-2 bg-white focus-within:ring-4 focus-within:ring-blue-100">
                  <Lock className="w-4 h-4 text-slate-500" />
                  <input
                    name="password"
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="w-full border-none outline-none text-sm bg-transparent"
                    required
                  />
                </div>
              </div>

              {/* Xác nhận mật khẩu – chỉ khi register */}
              {isRegister && (
                <div className="space-y-2">
                  <label
                    htmlFor="confirm"
                    className="text-sm font-medium text-slate-800"
                  >
                    Xác nhận mật khẩu
                  </label>
                  <div className="flex items-center gap-2 rounded-xl border px-3 py-2 bg-white focus-within:ring-4 focus-within:ring-blue-100">
                    <Lock className="w-4 h-4 text-slate-500" />
                    <input
                      name="confirm"
                      id="confirm"
                      type="password"
                      placeholder="••••••••"
                      className="w-full border-none outline-none text-sm bg-transparent"
                      required
                    />
                  </div>
                </div>
              )}

              <button
                className="w-full rounded-xl bg-[#0a56c5] px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-60"
                type="submit"
                disabled={loading}
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {mode === "login" ? "Đăng nhập" : "Tạo tài khoản"}
              </button>

              {mode === "login" && (
                <p className="text-[11px] text-slate-500 text-center">
                  Quên mật khẩu?{" "}
                  <span className="underline underline-offset-2 cursor-pointer">
                    Liên hệ dược sĩ Tâm An để được hỗ trợ.
                  </span>
                </p>
              )}
            </form>
          )}

          {/* ==== DONE STEP (cho register & OTP demo) ==== */}
          {step === "done" && (
            <div className="flex flex-col items-center gap-3 py-10">
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
              <p className="font-medium text-lg text-slate-900">
                {mode === "login"
                  ? "Xác thực thành công"
                  : "Đăng ký thành công"}
              </p>
              <p className="text-sm text-slate-500 text-center max-w-xs">
                {mode === "login"
                  ? "Bạn có thể tiếp tục mua sắm và theo dõi đơn hàng."
                  : "Tài khoản đã sẵn sàng. Hãy đăng nhập để bắt đầu mua sắm tại Nhà Thuốc Tâm An."}
              </p>

              {mode === "register" && (
                <button
                  onClick={() => {
                    onSwitchMode?.("login");
                    setStep("phone");
                    setMethod("email");
                  }}
                  className="mt-1 inline-flex items-center justify-center rounded-xl bg-[#0a56c5] px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition"
                >
                  Đăng nhập ngay
                </button>
              )}

              <button
                onClick={() => {
                  onClose?.();
                  router.push("/");
                }}
                className="text-xs text-slate-500 underline underline-offset-2 mt-1"
              >
                Đóng và quay về trang chủ
              </button>
            </div>
          )}

          {/* Divider + Social (trừ khi đang ở step DONE) */}
          {step !== "done" && (
            <>
              <div className="my-5 relative">
                <div className="h-px bg-slate-200" />
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-3 text-[11px] text-slate-500">
                  Hoặc tiếp tục bằng
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <button
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 hover:bg-slate-50 transition text-slate-700 text-xs"
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
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 hover:bg-slate-50 transition"
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
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 hover:bg-slate-50 transition flex items-center justify-center"
                  type="button"
                >
                  <Apple className="w-5 h-5" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Link fallback để SEO / deep-link, giống Long Châu thường có ở chân popup */}
      <div className="mt-3 text-center text-[11px] text-slate-400">
        Bạn cũng có thể truy cập trực tiếp{" "}
        <Link href="/login" className="underline underline-offset-2">
          trang đăng nhập
        </Link>{" "}
        hoặc{" "}
        <Link href="/register" className="underline underline-offset-2">
          trang đăng ký
        </Link>
        .
      </div>
    </div>
  );
}
