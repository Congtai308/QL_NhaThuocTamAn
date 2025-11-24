"use client";

import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useCart, money } from "@/lib/cart";
import { useRouter } from "next/navigation";
/* Inline icons (không phụ thuộc lib) */
const paymentOptions = [
  {
    id: "qr",
    title: "Thanh toán bằng ví điện tử / QR code",
    desc: "Hỗ trợ Momo, ZaloPay, ViettelPay...",
    icon: "💳",
    payment_method: "vnpay",
    bank_code: "VNPAYQR",
  },
  {
    id: "momo",
    title: "Thanh toán bằng ví MoMo",
    desc: "Quét mã hoặc đăng nhập ví",
    icon: "👜",
    payment_method: "vnpay",
    bank_code: "VNPAYQR",
  },
  {
    id: "cash",
    title: "Thanh toán tiền mặt khi nhận hàng",
    desc: "Miễn phí, áp dụng nội thành",
    icon: "💵",
    payment_method: "cod", // <- đúng chính tả
    bank_code: "",
  },
  {
    id: "atm",
    title: "Thanh toán bằng thẻ ATM / VISA",
    desc: "Hỗ trợ hầu hết ngân hàng",
    icon: "💳",
    payment_method: "vnpay",
    bank_code: "VNPAYQR",
  },
];

const fieldClass =
  "w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-50 outline-none placeholder:text-slate-400";

function QtyPill({
  value,
  onChange,
}: {
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="inline-flex items-center rounded-full border overflow-hidden">
      <button
        className="px-3 py-1 text-lg hover:bg-slate-50"
        onClick={() => onChange(Math.max(1, value - 1))}
        aria-label="Giảm"
      >
        –
      </button>
      <span className="w-9 text-center">{value}</span>
      <button
        className="px-3 py-1 text-lg hover:bg-slate-50"
        onClick={() => onChange(value + 1)}
        aria-label="Tăng"
      >
        +
      </button>
    </div>
  );
}

export default function CartPage() {
  const { items, setQty, remove, clear } = useCart();
  const router = useRouter();
  const [method, setMethod] = useState<"delivery" | "pickup">("delivery");
  const [payment, setPayment] = useState(paymentOptions[0].id);
  const [invoice, setInvoice] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [addressDetail, setAddressDetail] = useState("");
  const [note, setNote] = useState("");

  type Province = { province_id: string; province_name: string };
  type District = { district_id: string; district_name: string };
  type Ward = { ward_id: string; ward_name: string };

  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

  const [provinceId, setProvinceId] = useState("");
  const [districtId, setDistrictId] = useState("");
  const [wardId, setWardId] = useState("");

  // hook phải ở top-level
  const searchParams = useSearchParams();

  // Lấy danh sách tỉnh
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const res = await fetch(
          "/api/php?path=locations&type=province"
        );
        if (!res.ok) throw new Error("Status " + res.status);
        const data = await res.json();
        setProvinces(data.results || []);
      } catch (err) {
        console.error("Lỗi load tỉnh:", err);
      }
    };
    fetchProvinces();
  }, []);

  // Xử lý redirect từ VNPAY (?pay=success|failed&code=...)
  useEffect(() => {
    const pay = searchParams.get("pay");
    const code = searchParams.get("code");
    if (pay === "success" && code) {
      alert("Thanh toán thành công! Mã đơn: " + code);
      clear();
    } else if (pay === "failed" && code) {
      alert("Thanh toán thất bại hoặc bị huỷ. Mã đơn: " + code);
    }
  }, [searchParams, clear]);

  // Khi chọn Tỉnh -> load Huyện
  const handleProvinceChange = async (e: any) => {
    const id = e.target.value as string;
    setProvinceId(id);
    setDistrictId("");
    setWardId("");
    setDistricts([]);
    setWards([]);

    if (!id) return;

    try {
      const res = await fetch(
        `/api/php?path=locations&type=district&province_id=${id}`
      );
      if (!res.ok) throw new Error("Status " + res.status);
      const data = await res.json();
      setDistricts(data.results || []);
    } catch (err) {
      console.error("Lỗi load quận/huyện:", err);
    }
  };

  // Khi chọn Huyện -> load Xã
  const handleDistrictChange = async (e: any) => {
    const id = e.target.value as string;
    setDistrictId(id);
    setWardId("");
    setWards([]);

    if (!id) return;

    try {
      const res = await fetch(
        `/api/php?path=locations&type=ward&district_id=${id}`
      );
      if (!res.ok) throw new Error("Status " + res.status);
      const data = await res.json();
      setWards(data.results || []);
    } catch (err) {
      console.error("Lỗi load phường/xã:", err);
    }
  };
  const handleCheckout = async () => {
    if (items.length === 0) {
      alert("Giỏ hàng đang trống");
      return;
    }
  
    if (method === "delivery") {
      if (!customerName.trim() || !phone.trim()) {
        alert("Vui lòng nhập Họ tên và Số điện thoại");
        return;
      }
      if (!provinceId || !districtId || !wardId || !addressDetail.trim()) {
        alert("Vui lòng nhập đầy đủ địa chỉ nhận hàng");
        return;
      }
    }
  
    const provinceName =
      provinces.find((p) => p.province_id === provinceId)?.province_name || "";
    const districtName =
      districts.find((d) => d.district_id === districtId)?.district_name || "";
    const wardName =
      wards.find((w) => w.ward_id === wardId)?.ward_name || "";
  
    const fullAddress =
      method === "delivery"
        ? `${addressDetail}, ${wardName}, ${districtName}, ${provinceName}`.replace(
            /(^[,\s]+)|([,\s]+$)/g,
            ""
          )
        : "Nhận tại nhà thuốc";
  
    const selectedPayment = paymentOptions.find(
      (opt) => opt.id === payment
    );
  
    const payload = {
      shipping_name: customerName || "Khách lẻ",
      shipping_phone: phone || "0000000000",
      shipping_address: fullAddress,
      billing_name: customerName || "Khách lẻ",
      billing_phone: phone || "0000000000",
      billing_address: fullAddress,
      items: items.map((i) => ({
        id: i.id,
        qty: i.qty,
      })),
      payment_method: selectedPayment?.payment_method ?? "cod",
      bank_code: selectedPayment?.bank_code || undefined,
    };
  
    try {
      const res = await fetch(
        "/api/php?path=orders",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
  
      if (!data.success) {
        alert(data.error || "Đặt hàng thất bại");
        return;
      }
  
      // Nếu là thanh toán online, server trả về payment_url thì cho user sang cổng thanh toán
      if (data.payment_url) {
        window.location.href = data.payment_url;
        return;
      }
  
      // Đặt hàng COD thành công
      alert("Đặt hàng thành công! Mã đơn: " + data.order_code);
  
      // Xoá giỏ hàng
      clear();
  
      // Lưu tạm số điện thoại để lần sau tự fill (optional)
      try {
        if (phone) {
          localStorage.setItem("order_phone", phone);
        }
      } catch {
        // ignore
      }
  
      // Redirect sang trang tra cứu đơn hàng: /orders?phone=...&code=...
      const qs = new URLSearchParams();
      if (phone) qs.set("phone", phone);
      if (data.order_code) qs.set("code", data.order_code);
  
      router.push(`/orders?${qs.toString()}`);
    } catch (err) {
      console.error(err);
      alert("Có lỗi khi kết nối server");
    }
  };
  
  const totalItems = useMemo(
    () => items.reduce((sum, i) => sum + i.qty, 0),
    [items]
  );

  const totalPrice = useMemo(
    () => items.reduce((sum, i) => sum + i.qty * i.price, 0),
    [items]
  );

  if (items.length === 0) {
    return (
      <main className="min-h-[60vh] bg-[#f2f5fb]">
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <div className="text-2xl font-semibold text-slate-700 mb-2">
            Giỏ hàng của bạn đang trống
          </div>
          <p className="text-slate-500 mb-6">
            Thêm vài sản phẩm để được miễn phí vận chuyển và nhiều ưu đãi hấp
            dẫn.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-[#0a56c5] text-white px-6 py-3"
          >
            Tiếp tục mua sắm
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-[#f2f5fb] py-8 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 space-y-6">
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <Link href="/" className="text-blue-700 hover:underline">
            Quay về trang chủ
          </Link>
          <span>/</span>
          <span className="text-slate-700 font-medium">Giỏ hàng</span>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.7fr_1fr]">
          <section className="space-y-4">
            <div className="rounded-2xl border bg-white overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b bg-slate-50">
                <div>
                  <div className="text-lg font-semibold text-slate-800">
                    Giỏ hàng của bạn
                  </div>
                  <p className="text-sm text-slate-500">
                    Có {totalItems} sản phẩm đang chờ thanh toán
                  </p>
                </div>
                <button
                  className="text-sm text-rose-600 hover:text-rose-700"
                  onClick={clear}
                >
                  Xóa toàn bộ
                </button>
              </div>

              <div className="divide-y">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="p-5 flex flex-col gap-4 md:flex-row md:items-center"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-20 h-20 sm:w-80 sm:h-25 rounded-2xl border bg-white flex items-center justify-center overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.image || "/placeholder.png"}
                          alt={item.name}
                          className="w-full h-full object-contain p-2"
                        />
                      </div>
                      <div>
                        <div className="font-medium text-sm md:text-base leading-snug line-clamp-2">
                          {item.name}
                        </div>
                        <div className="text-xs text-slate-500 mt-1 uppercase">
                          {item.unit || "Hộp"}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 md:w-[320px] md:justify-end">
                      <div className="text-base font-semibold text-blue-800">
                        {money(item.price)}
                      </div>
                      <QtyPill
                        value={item.qty}
                        onChange={(n) => setQty(item.id, n)}
                      />
                      <button
                        className="text-slate-500 text-sm hover:text-rose-600"
                        onClick={() => remove(item.id)}
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border bg-white p-5 space-y-4">
              <div>
                <div className="text-lg font-semibold">Thông tin người đặt</div>
                <p className="text-sm text-slate-500">
                  Cung cấp thông tin để chúng tôi liên hệ khi cần thiết.
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <input
                  className={fieldClass}
                  placeholder="Họ và tên"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
                <input
                  className={fieldClass}
                  placeholder="Số điện thoại"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                <input
                  className={`${fieldClass} md:col-span-2`}
                  placeholder="Email (không bắt buộc)"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="rounded-2xl border bg-white p-5 space-y-4">
              <div className="flex flex-wrap gap-3 items-center justify-between">
                <div>
                  <div className="text-lg font-semibold">
                    Phương thức nhận hàng
                  </div>
                  <p className="text-sm text-slate-500">
                    Chọn cách bạn muốn nhận thuốc và thực phẩm chức năng.
                  </p>
                </div>
                <div className="inline-flex rounded-full bg-slate-100 p-1 text-sm">
                  <button
                    className={`px-3 py-1 rounded-full ${
                      method === "delivery"
                        ? "bg-white shadow text-blue-700"
                        : "text-slate-500"
                    }`}
                    onClick={() => setMethod("delivery")}
                  >
                    Giao tận nơi
                  </button>
                  <button
                    className={`px-3 py-1 rounded-full ${
                      method === "pickup"
                        ? "bg-white shadow text-blue-700"
                        : "text-slate-500"
                    }`}
                    onClick={() => setMethod("pickup")}
                  >
                    Nhận tại nhà thuốc
                  </button>
                </div>
              </div>
              {method === "delivery" ? (
                <div className="space-y-3">
                  <div className="grid gap-3 md:grid-cols-2">
                    {/* Tỉnh / Thành phố */}
                    <select
                      className={fieldClass}
                      value={provinceId}
                      onChange={handleProvinceChange}
                    >
                      <option value="">Chọn Tỉnh/Thành phố</option>
                      {provinces.map((p) => (
                        <option key={p.province_id} value={p.province_id}>
                          {p.province_name}
                        </option>
                      ))}
                    </select>

                    {/* Quận / Huyện */}
                    <select
                      className={fieldClass}
                      value={districtId}
                      onChange={handleDistrictChange}
                      disabled={!provinceId}
                    >
                      <option value="">Chọn Quận/Huyện</option>
                      {districts.map((d) => (
                        <option key={d.district_id} value={d.district_id}>
                          {d.district_name}
                        </option>
                      ))}
                    </select>

                    {/* Phường / Xã */}
                    <select
                      className={`${fieldClass} md:col-span-2`}
                      value={wardId}
                      onChange={(e) => setWardId(e.target.value)}
                      disabled={!districtId}
                    >
                      <option value="">Chọn Phường/Xã</option>
                      {wards.map((w) => (
                        <option key={w.ward_id} value={w.ward_id}>
                          {w.ward_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <input
                    className={fieldClass}
                    placeholder="Nhập địa chỉ cụ thể"
                    value={addressDetail}
                    onChange={(e) => setAddressDetail(e.target.value)}
                  />
                  <textarea
                    className={`${fieldClass} min-h-[80px]`}
                    placeholder="Ghi chú cho nhân viên giao hàng"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                </div>
              ) : (
                <div className="space-y-3 text-sm text-slate-600">
                  <div className="rounded-xl border p-4">
                    <div className="font-medium">
                      Nhà thuốc Long Châu - Quận 1
                    </div>
                    <div>379 Hai Bà Trưng, P. Võ Thị Sáu</div>
                    <div className="text-xs text-slate-500 mt-1">
                      Mở cửa 7:30 - 22:00 hằng ngày
                    </div>
                  </div>
                  <div className="rounded-xl border p-4">
                    <div className="font-medium">
                      Nhà thuốc Long Châu - Phú Nhuận
                    </div>
                    <div>120 Phan Đình Phùng, P. 2</div>
                    <div className="text-xs text-slate-500 mt-1">
                      Còn hàng 2 sản phẩm bạn chọn
                    </div>
                  </div>
                </div>
              )}

              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  className="w-4 h-4 accent-blue-700"
                  checked={invoice}
                  onChange={(e) => setInvoice(e.target.checked)}
                />
                Xuất hóa đơn điện tử cho doanh nghiệp
              </label>
            </div>

            <div className="rounded-2xl border bg-white p-5 space-y-4">
              <div className="text-lg font-semibold">
                Chọn phương thức thanh toán
              </div>
              <div className="space-y-3">
                {paymentOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setPayment(opt.id)}
                    className={`w-full text-left rounded-2xl border px-4 py-3 flex gap-3 transition ${
                      payment === opt.id
                        ? "border-blue-600 bg-blue-50"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <span className="text-2xl">{opt.icon}</span>
                    <span>
                      <div className="font-medium text-slate-800">
                        {opt.title}
                      </div>
                      <div className="text-xs text-slate-500">{opt.desc}</div>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </section>

          <aside className="space-y-4">
            <div className="rounded-2xl border bg-white p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Tạm tính</span>
                <span className="font-semibold">{money(totalPrice)}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-slate-500">
                <span>Giảm giá</span>
                <span>- 0đ</span>
              </div>
              <div className="flex items-center justify-between text-sm text-slate-500">
                <span>Phí vận chuyển</span>
                <span className="text-emerald-600 font-medium">Miễn phí</span>
              </div>
              <div className="pt-4 border-t flex items-center justify-between font-semibold text-lg">
                <span>Thành tiền</span>
                <span className="text-blue-700">{money(totalPrice)}</span>
              </div>
              <button
                onClick={handleCheckout}
                className="w-full rounded-xl bg-[#0a56c5] text-white py-3 font-medium hover:bg-blue-800"
              >
                Hoàn tất đơn hàng
              </button>

              <p className="text-xs text-center text-slate-500">
                Miễn phí vận chuyển với đơn từ 300.000đ
              </p>
            </div>

            <div className="rounded-2xl border bg-white p-5 space-y-3">
              <div className="text-sm font-medium text-slate-700">
                Mã giảm giá
              </div>
              <div className="flex gap-2">
                <input
                  className={`${fieldClass} flex-1`}
                  placeholder="Nhập mã ưu đãi"
                />
                <button className="rounded-xl border border-blue-700 text-blue-700 px-4">
                  Áp dụng
                </button>
              </div>
              <div className="rounded-xl bg-blue-50 p-4 text-xs text-slate-600">
                Đừng quên nhập mã FREESHIP để miễn phí vận chuyển cho đơn hàng
                đầu tiên của bạn tại Nhà thuốc.
              </div>
            </div>

            <div className="rounded-2xl border bg-white p-5 space-y-3">
              <div className="text-sm font-semibold text-slate-700">
                Hỗ trợ 24/7
              </div>
              <p className="text-sm text-slate-500">
                Liên hệ 1800 6928 hoặc chat trực tiếp với dược sĩ để được tư vấn
                sử dụng thuốc.
              </p>
              <div className="rounded-xl border border-dashed p-4 text-center text-sm text-slate-500">
                QR hướng dẫn thanh toán sẽ hiển thị sau khi bạn chọn phương thức
                phù hợp.
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
