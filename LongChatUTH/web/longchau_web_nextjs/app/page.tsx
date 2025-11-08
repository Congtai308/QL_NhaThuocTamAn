import { fetchProducts } from '@/lib/api'
import ProductCard from '@/components/ProductCard'

export default async function Home() {
  const { items } = await fetchProducts(1, 20)
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Sản phẩm nổi bật</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((p) => (<ProductCard key={p.id} p={p} />))}
      </div>
    </div>
  )
}
