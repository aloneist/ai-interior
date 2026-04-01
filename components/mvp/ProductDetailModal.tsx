import type { ProductLike } from "@/types/mvp"

type ProductDetailModalProps = {
  product: ProductLike | null
  savedProductIds: string[]
  comparedProductIds: string[]
  onClose: () => void
  onToggleSaved: (id: string) => void
  onToggleCompared: (id: string) => void
  onOpenExternal: (product: ProductLike) => void
}

export default function ProductDetailModal({
  product,
  savedProductIds,
  comparedProductIds,
  onClose,
  onToggleSaved,
  onToggleCompared,
  onOpenExternal,
}: ProductDetailModalProps) {
  if (!product) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="max-h-[90vh] w-full max-w-xl overflow-auto rounded-3xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-sm text-gray-500">
              {product.brand ?? "브랜드 미상"} · {product.category ?? "카테고리"}
            </div>
            <h3 className="mt-1 text-2xl font-bold">{product.name}</h3>
          </div>
          <button
            className="rounded-full border px-3 py-1 text-sm"
            onClick={onClose}
          >
            닫기
          </button>
        </div>

        {product.image_url ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.image_url}
              alt={product.name}
              className="mt-5 h-72 w-full rounded-2xl border object-cover"
            />
          </>
        ) : null}

        <div className="mt-5 space-y-3 text-sm">
          <div>
            <span className="font-medium">가격</span>{" "}
            {product.price ? `${product.price.toLocaleString()}원` : "-"}
          </div>
          <div>
            <span className="font-medium">추천 점수</span>{" "}
            {product.recommendation_score}
          </div>
          <div className="flex gap-2">
            <span className="rounded-full border px-3 py-1 text-xs">
              {savedProductIds.includes(product.id) ? "저장됨" : "미저장"}
            </span>
            <span className="rounded-full border px-3 py-1 text-xs">
              {comparedProductIds.includes(product.id) ? "비교중" : "비교 아님"}
            </span>
          </div>
          <div>
            <span className="font-medium">추천 이유</span>
            <p className="mt-1 text-gray-700">{product.reason_short}</p>
          </div>
        </div>

        <div className="mt-6 flex gap-2">
          <button
            className={`flex-1 rounded-xl border px-4 py-3 ${
              savedProductIds.includes(product.id)
                ? "bg-black text-white border-black"
                : ""
            }`}
            onClick={() => onToggleSaved(product.id)}
          >
            {savedProductIds.includes(product.id) ? "저장됨" : "저장"}
          </button>
          <button
            className={`flex-1 rounded-xl border px-4 py-3 ${
              comparedProductIds.includes(product.id)
                ? "bg-black text-white border-black"
                : ""
            }`}
            onClick={() => onToggleCompared(product.id)}
          >
            {comparedProductIds.includes(product.id) ? "비교중" : "비교에 추가"}
          </button>
          <button
            className="flex-1 rounded-xl bg-black px-4 py-3 text-white"
            onClick={() => onOpenExternal(product)}
          >
            상품 보기
          </button>
        </div>
      </div>
    </div>
  )
}
