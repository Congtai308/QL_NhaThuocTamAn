import Link from 'next/link'
import Image from 'next/image'
import type { Product } from '@/lib/api'
import { imageUrl } from '@/lib/api'

export default function ProductCard({ p }: { p: Product }) {
  return (
    <Link href={`/products/${p.id}`} className="group block rounded-2xl overflow-hidden bg-white border border-gray-100 hover:shadow-md transition">
      <div className="aspect-square bg-gray-100 relative">
        {p.image_path ? (
          <Image src={imageUrl(p.image_path)} alt={p.name} fill className="object-contain p-3" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">No Image</div>
        )}
      </div>
      <div className="p-3">
        <div className="text-sm font-medium line-clamp-2 group-hover:text-primary">{p.name}</div>
        <div className="mt-1 text-xs text-gray-500">{p.brand}{p.brand && p.category ? ' • ' : ''}{p.category}</div>
        <div className="mt-2 font-semibold text-primary">{p.price_text || 'Liên hệ'}</div>
      </div>
    </Link>
  )
}
