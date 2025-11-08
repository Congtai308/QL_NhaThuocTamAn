import { fetchProductById, imageUrl } from '@/lib/api'
import Image from 'next/image'
import Link from 'next/link'

type Props = { params: { id: string } }

export default async function ProductDetail({ params }: Props) {
  const p = await fetchProductById(params.id)
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <div className="aspect-square relative bg-gray-50">
          {p.image_path ? <Image src={imageUrl(p.image_path)} alt={p.name} fill className="object-contain p-6" /> : null}
        </div>
      </div>

      <div className="space-y-4">
        <h1 className="text-xl md:text-2xl font-bold">{p.name}</h1>
        <div className="text-primary text-xl font-semibold">{p.price_text || 'Liên hệ'}</div>

        {p.units?.length ? (
          <div className="space-y-2">
            <div className="text-sm font-medium">Đơn vị tính</div>
            <ul className="grid grid-cols-2 gap-2">
              {p.units.map((u, idx) => (
                <li key={idx} className="rounded-xl border bg-white p-3 flex items-center justify-between">
                  <span className="text-sm">{u.unit_name}</span>
                  <span className="text-sm font-semibold text-primary">{u.price_value}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="text-sm text-gray-700 space-y-1">
          <p><b>Thương hiệu:</b> {p.brand || '-'}</p>
          <p><b>Danh mục:</b> {p.category || '-'}</p>
          <p><b>Dạng bào chế:</b> {p.form || '-'}</p>
          <p><b>Quy cách:</b> {p.size_spec || '-'}</p>
          <p><b>Nhà sản xuất:</b> {p.manufacturer || '-'}</p>
          <p><b>Xuất xứ:</b> {p.origin || '-'}</p>
        </div>

        {p.ingredient && (
          <div>
            <h2 className="text-lg font-semibold mt-4">Thành phần</h2>
            <p className="text-sm text-gray-700 whitespace-pre-line">{p.ingredient}</p>
          </div>
        )}

        <div className="pt-4">
          <Link href="/" className="text-sm text-primary hover:underline">← Quay lại trang chủ</Link>
        </div>
      </div>
    </div>
  )
}
