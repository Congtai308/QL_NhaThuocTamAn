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

export default function DashboardPage() {
  // ✅ Lấy danh sách sản phẩm từ PHP API
  const { data, error } = useSWR(
    "http://localhost:9000/QL_NhaThuocTamAn/LongChatUTH/api/products.php",
    fetcher
  );

  const products = Array.isArray(data?.items) ? data.items : [];

  const totalProducts = products.length;
  const lowStock = products.filter((p: any) => p.stock && p.stock < 5).length;

  // ✅ Dữ liệu biểu đồ mẫu (tạm thời)
  const barData = {
    labels: ["T2", "T3", "T4", "T5", "T6", "T7", "CN"],
    datasets: [
      {
        label: "Doanh thu (triệu đồng)",
        data: [12, 19, 7, 15, 9, 13, 17],
        backgroundColor: "#2563eb",
        borderRadius: 6,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        ticks: { color: "#6b7280", font: { size: 12 } },
        grid: { color: "#f1f5f9" },
      },
      x: {
        ticks: { color: "#6b7280", font: { size: 12 } },
        grid: { display: false },
      },
    },
    plugins: { legend: { display: false } },
  };

  const pieData = {
    labels: ["Thuốc", "TPCN", "Dược mỹ phẩm"],
    datasets: [
      {
        data: [55, 30, 15],
        backgroundColor: ["#2563eb", "#facc15", "#f87171"],
        borderColor: "#fff",
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
        labels: { color: "#374151", font: { size: 13 } },
      },
    },
  };

  return (
    <div className="space-y-8">
      {/* Tiêu đề */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-blue-700">
          📊 Tổng quan hệ thống
        </h1>
      </div>

      {/* Card thống kê */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition p-6 text-center border border-gray-100">
          <div className="text-4xl mb-2">💊</div>
          <p className="text-gray-500 text-sm font-medium">Tổng sản phẩm</p>
          <p className="text-3xl font-bold text-blue-600">{totalProducts}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition p-6 text-center border border-gray-100">
          <div className="text-4xl mb-2">⚠️</div>
          <p className="text-gray-500 text-sm font-medium">Sản phẩm sắp hết</p>
          <p className="text-3xl font-bold text-red-500">{lowStock}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition p-6 text-center border border-gray-100">
          <div className="text-4xl mb-2">📦</div>
          <p className="text-gray-500 text-sm font-medium">Đơn hàng</p>
          <p className="text-3xl font-bold text-green-600">856</p>
        </div>
      </div>

      {/* Biểu đồ */}
      <div className="grid xl:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-[380px]">
          <h2 className="font-semibold mb-4 text-gray-700">
            📈 Doanh thu 7 ngày gần nhất
          </h2>
          <div className="h-[300px]">
            <Bar data={barData} options={barOptions} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-[380px]">
          <h2 className="font-semibold mb-4 text-gray-700">
            📊 Tỷ lệ danh mục sản phẩm
          </h2>
          <div className="h-[300px] flex items-center justify-center">
            <Pie data={pieData} options={pieOptions} />
          </div>
        </div>
      </div>

      {/* Danh sách sản phẩm gần đây */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">
          🧾 Sản phẩm gần đây
        </h2>

        {error && (
          <p className="text-red-600 text-sm">Lỗi tải dữ liệu sản phẩm!</p>
        )}
        {!data && <p className="text-gray-500 text-sm">Đang tải...</p>}

        {products.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border-collapse">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="p-2 text-left">Tên sản phẩm</th>
                  <th className="p-2">Danh mục</th>
                  <th className="p-2">Giá</th>
                  <th className="p-2">Nhà sản xuất</th>
                </tr>
              </thead>
              <tbody>
                {products.slice(0, 6).map((p: any, i) => (
                  <tr key={i} className="border-t hover:bg-gray-50">
                    <td className="p-2">{p.name}</td>
                    <td className="p-2 text-center">{p.category}</td>
                    <td className="p-2 text-center text-blue-700 font-semibold">
                      {p.price ? Number(p.price).toLocaleString() + "₫" : "-"}
                    </td>
                    <td className="p-2 text-center">{p.manufacturer}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
