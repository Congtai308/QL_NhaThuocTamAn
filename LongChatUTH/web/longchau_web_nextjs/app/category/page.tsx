import { fetchCategories, fetchProducts } from '@/lib/api'
import ProductCard from '@/components/ProductCard'

export default async function CategoryPage() {
  const { items } = await fetchProducts(1, 24)
  const categories = await fetchCategories()

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
      <aside className="bg-white rounded-2xl border p-4 h-fit">
        <h2 className="font-semibold mb-3">Danh mục</h2>
        <ul className="space-y-2 max-h-[60vh] overflow-auto pr-2">
          {categories.map((c) => (
            <li key={c.category} className="flex items-center justify-between text-sm">
              <span className="truncate" title={c.category}>{c.category}</span>
              <span className="text-gray-500">{c.total}</span>
            </li>
          ))}
        </ul>
      </aside>

      <section className="space-y-4">
        <h1 className="text-2xl font-bold">Tất cả sản phẩm</h1>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((p) => (<ProductCard key={p.id} p={p} />))}
        </div>
      </section>
    </div>
  )
}
