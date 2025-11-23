"use client";

import useSWR from "swr";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  Tooltip,
  Legend,
  Title,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  Tooltip,
  Legend,
  Title
);

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const PRODUCT_API = "/api/php?path=products";
const ORDER_API = "/api/php?path=orders";
const EMP_API = "/api/php?path=employees";
const SUP_API = "/api/php?path=suppliers";

type Product = {
  id: number;
  name: string;
  category?: string;
  manufacturer?: string;
  price?: number | string;
  stock?: number | string | null;
};

type Order = {
  order_id: number;
  order_code: string;
  order_date?: string;
  total_amount?: number | string;
  status?: string;
  shipping_name?: string | null;
};

export default function DashboardPage() {
  // ====== CALL API ======
  const {
    data: productData,
    error: productError,
    isLoading: loadingProducts,
  } = useSWR(PRODUCT_API, fetcher);

  const {
    data: orderData,
    error: orderError,
    isLoading: loadingOrders,
  } = useSWR(ORDER_API, fetcher);

  const { data: empData } = useSWR(EMP_API, fetcher);
  const { data: supData } = useSWR(SUP_API, fetcher);

  const products: Product[] = Array.isArray(productData?.items)
    ? productData.items
    : [];
  const orders: Order[] = Array.isArray(orderData?.items)
    ? orderData.items
    : [];
  const employees = Array.isArray(empData?.items) ? empData.items : [];
  const suppliers = Array.isArray(supData?.items) ? supData.items : [];

  // ====== KPI TỔNG QUAN ======
  const totalProducts = products.length;
  const lowStock = products.filter((p) => Number(p.stock ?? 0) < 5).length;

  const totalOrders = orders.length;
  const pendingOrders = orders.filter(
    (o) => o.status && !["Completed", "Cancelled"].includes(o.status)
  ).length;
  const completedOrders = orders.filter((o) => o.status === "Completed").length;

  const totalRevenue = orders.reduce(
    (sum, o) => sum + Number(o.total_amount || 0),
    0
  );

  const formatMoney = (n: number) =>
    n.toLocaleString("vi-VN", { maximumFractionDigits: 0 }) + "₫";

  // ====== REVENUE 7 NGÀY GẦN NHẤT (BAR CHART) ======
  const today = new Date();
  const dayKeys: string[] = [];
  const dayLabels: string[] = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10); // YYYY-MM-DD
    dayKeys.push(key);
    dayLabels.push(
      d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })
    );
  }

  const revenueByDay: Record<string, number> = {};
  dayKeys.forEach((k) => (revenueByDay[k] = 0));

  orders.forEach((o) => {
    if (!o.order_date) return;
    const d = new Date(o.order_date);
    if (isNaN(d.getTime())) return;
    const key = d.toISOString().slice(0, 10);
    if (key in revenueByDay) {
      revenueByDay[key] += Number(o.total_amount || 0);
    }
  });

  const barData = {
    labels: dayLabels,
    datasets: [
      {
        label: "Doanh thu (đồng)",
        data: dayKeys.map((k) => revenueByDay[k] || 0),
        backgroundColor: "#2563eb",
        borderRadius: 8,
        maxBarThickness: 42,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, title: { display: false } },
    scales: {
      y: {
        ticks: {
          color: "#6b7280",
          font: { size: 11 },
          callback: (value: any) =>
            Number(value).toLocaleString("vi-VN", {
              maximumFractionDigits: 0,
            }),
        },
        grid: { color: "#e5e7eb" },
      },
      x: {
        ticks: { color: "#6b7280", font: { size: 11 } },
        grid: { display: false },
      },
    },
  };

  // ====== PIE – PHÂN BỐ DANH MỤC SẢN PHẨM ======
  const categoryCounts: Record<string, number> = {};
  products.forEach((p) => {
    const key = (p.category || "Khác").trim() || "Khác";
    categoryCounts[key] = (categoryCounts[key] || 0) + 1;
  });

  const sortedCat = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]);
  const topCats = sortedCat.slice(0, 4);
  const otherCount = sortedCat.slice(4).reduce((sum, [, v]) => sum + v, 0);

  const pieLabels = topCats
    .map(([k]) => k)
    .concat(otherCount > 0 ? ["Khác"] : []);
  const pieValues = topCats
    .map(([, v]) => v)
    .concat(otherCount > 0 ? [otherCount] : []);

  const pieData = {
    labels: pieLabels,
    datasets: [
      {
        data: pieValues,
        backgroundColor: [
          "#2563eb",
          "#22c55e",
          "#f97316",
          "#e11d48",
          "#a855f7",
        ],
        borderColor: "#ffffff",
        borderWidth: 2,
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          color: "#374151",
          font: { size: 12 },
        },
      },
    },
  };

  // ====== BẢNG PHỤ ======
  const recentOrders = [...orders]
    .sort(
      (a, b) =>
        new Date(b.order_date || "").getTime() -
        new Date(a.order_date || "").getTime()
    )
    .slice(0, 5);

  const lowStockProducts = products
    .filter((p) => Number(p.stock ?? 0) < 5)
    .slice(0, 5);

  return (
    <div className="space-y-8 w-full">
      {/* ====== HERO HEADER ====== */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-400 text-white shadow-lg">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent)]" />
        <div className="relative px-6 py-6 md:px-8 md:py-7 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold flex items-center gap-2">
              📊 Dashboard quản lý nhà thuốc
            </h1>
            <p className="mt-1 text-sm md:text-base text-blue-50/90 max-w-xl">
              Theo dõi tồn kho, doanh thu và đơn hàng theo thời gian thực để vận
              hành quầy thuốc mượt mà hơn.
            </p>
          </div>
          <div className="flex flex-col items-end text-right">
            <span className="text-xs uppercase tracking-wide text-blue-50/80">
              Doanh thu lũy kế
            </span>
            <span className="mt-1 text-2xl md:text-3xl font-bold">
              {formatMoney(totalRevenue)}
            </span>
            <span className="mt-1 text-xs text-blue-50/80">
              Từ {totalOrders.toLocaleString("vi-VN")} đơn hàng
            </span>
          </div>
        </div>
      </div>

      {/* ====== KPI CARDS ====== */}
      <div className="grid gap-5 md:grid-cols-4">
        <KpiCard
          label="Tổng sản phẩm"
          value={totalProducts.toLocaleString("vi-VN")}
          subtitle={`${lowStock} sản phẩm sắp hết hàng`}
          icon="💊"
          accent="bg-blue-100 text-blue-700"
        />
        <KpiCard
          label="Đơn hàng hôm nay"
          value={orders
            .filter((o) => {
              if (!o.order_date) return false;
              const d = new Date(o.order_date);
              return d.toDateString() === new Date().toDateString();
            })
            .length.toLocaleString("vi-VN")}
          subtitle={`${pendingOrders} đơn đang xử lý`}
          icon="📦"
          accent="bg-amber-100 text-amber-700"
        />
        <KpiCard
          label="Đơn hoàn tất"
          value={completedOrders.toLocaleString("vi-VN")}
          subtitle="Tổng số đơn đã giao thành công"
          icon="✅"
          accent="bg-emerald-100 text-emerald-700"
        />
        <KpiCard
          label="Nhân viên / NCC"
          value={`${employees.length} / ${suppliers.length}`}
          subtitle="Nhân sự & nhà cung cấp đang hoạt động"
          icon="👨‍⚕️"
          accent="bg-purple-100 text-purple-700"
        />
      </div>

      {/* ====== CHARTS ====== */}
      <div className="grid xl:grid-cols-3 gap-6">
        <div className="admin-card xl:col-span-2 h-[380px] p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800">
              📈 Doanh thu 7 ngày gần nhất
            </h2>
            {(loadingOrders || orderError) && (
              <span className="text-xs text-slate-400">
                {loadingOrders
                  ? "Đang tải dữ liệu đơn hàng…"
                  : "Không lấy được dữ liệu"}
              </span>
            )}
          </div>
          <div className="h-[300px]">
            <Bar data={barData} options={barOptions} />
          </div>
        </div>

        <div className="admin-card h-[380px] flex flex-col p-5">
          <h2 className="font-semibold text-slate-800 mb-4">
            🧩 Cơ cấu danh mục sản phẩm
          </h2>
          <div className="flex-1 flex items-center justify-center">
            {products.length === 0 ? (
              <p className="text-sm text-slate-500">
                Chưa có dữ liệu sản phẩm.
              </p>
            ) : (
              <div className="h-[260px] w-full">
                <Pie data={pieData} options={pieOptions} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ====== TABLES ====== */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Đơn hàng gần đây */}
        <div className="admin-card p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-slate-800">
              📦 Đơn hàng gần đây
            </h2>
            <span className="text-xs text-slate-400">
              Tổng: {totalOrders.toLocaleString("vi-VN")} đơn
            </span>
          </div>
          {loadingOrders ? (
            <div className="py-8 text-center text-slate-400 text-sm">
              Đang tải danh sách đơn hàng…
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-sm">
              Chưa có đơn hàng nào.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="p-2 text-left">Mã đơn</th>
                    <th className="p-2 text-left">Khách hàng</th>
                    <th className="p-2 text-left">Ngày tạo</th>
                    <th className="p-2 text-right">Tổng tiền</th>
                    <th className="p-2 text-center">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((o) => (
                    <tr
                      key={o.order_id}
                      className="border-t hover:bg-slate-50/80"
                    >
                      <td className="p-2 font-medium text-slate-800">
                        {o.order_code}
                      </td>
                      <td className="p-2">{o.shipping_name || "Khách lẻ"}</td>
                      <td className="p-2 text-xs text-slate-500">
                        {o.order_date
                          ? new Date(o.order_date).toLocaleString("vi-VN")
                          : "—"}
                      </td>
                      <td className="p-2 text-right font-semibold text-blue-700">
                        {formatMoney(Number(o.total_amount || 0))}
                      </td>
                      <td className="p-2 text-center">
                        <StatusBadge status={o.status || "—"} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Sản phẩm sắp hết hàng */}
        <div className="admin-card p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-slate-800">
              ⚠️ Sản phẩm sắp hết hàng
            </h2>
            <span className="text-xs text-amber-600">
              {lowStock} sản phẩm dưới 5 đơn vị
            </span>
          </div>
          {loadingProducts ? (
            <div className="py-8 text-center text-slate-400 text-sm">
              Đang tải danh sách sản phẩm…
            </div>
          ) : lowStockProducts.length === 0 ? (
            <div className="py-8 text-center text-emerald-600 text-sm">
              Tất cả sản phẩm đều còn đủ tồn kho.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="p-2 text-left">Tên sản phẩm</th>
                    <th className="p-2 text-center">Danh mục</th>
                    <th className="p-2 text-center">Tồn kho</th>
                    <th className="p-2 text-right">Giá bán</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockProducts.map((p) => (
                    <tr key={p.id} className="border-t hover:bg-slate-50/80">
                      <td className="p-2">{p.name}</td>
                      <td className="p-2 text-center">{p.category || "—"}</td>
                      <td className="p-2 text-center text-red-600 font-semibold">
                        {p.stock ?? "0"}
                      </td>
                      <td className="p-2 text-right text-blue-700 font-medium">
                        {p.price ? formatMoney(Number(p.price)) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ========= COMPONENT PHỤ =========

function KpiCard(props: {
  label: string;
  value: string;
  subtitle?: string;
  icon?: string;
  accent?: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-100 shadow-sm p-4 flex flex-col gap-2">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            {props.label}
          </p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">
            {props.value}
          </p>
        </div>
        {props.icon && (
          <div
            className={`w-10 h-10 rounded-2xl grid place-items-center text-xl ${props.accent}`}
          >
            {props.icon}
          </div>
        )}
      </div>
      {props.subtitle && (
        <p className="mt-1 text-xs text-slate-500">{props.subtitle}</p>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();

  let color = "bg-slate-100 text-slate-700 border-slate-200"; // default
  if (normalized.includes("pending")) {
    color = "bg-amber-50 text-amber-700 border-amber-200";
  } else if (normalized.includes("paid") || normalized.includes("processing")) {
    color = "bg-sky-50 text-sky-700 border-sky-200";
  } else if (normalized.includes("shipped")) {
    color = "bg-indigo-50 text-indigo-700 border-indigo-200";
  } else if (normalized.includes("completed")) {
    color = "bg-emerald-50 text-emerald-700 border-emerald-200";
  } else if (normalized.includes("cancel")) {
    color = "bg-rose-50 text-rose-700 border-rose-200";
  }

  return (
    <span
      className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full border text-[11px] font-medium ${color}`}
    >
      {status || "—"}
    </span>
  );
}
