const items = [
    { title: "Cần mua thuốc", icon: "💊" },
    { title: "Tư vấn với Dược Sỹ", icon: "👩‍⚕️" },
    { title: "Đơn của tôi", icon: "📦" },
    { title: "Tìm nhà thuốc", icon: "📍" },
    { title: "Tiêm Vắc xin", icon: "💉" },
    { title: "Tra thuốc chính hãng", icon: "🔎" },
  ];
  
  export default function QuickActions() {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {items.map((it) => (
          <button key={it.title}
            className="rounded-2xl bg-white hover:bg-slate-50 border px-4 py-3 text-sm flex items-center gap-2 shadow-sm">
            <span className="text-lg">{it.icon}</span>
            <span>{it.title}</span>
          </button>
        ))}
      </div>
    );
  }
  