type RecommendationProduct = {
  id: string
  name: string
  brand?: string | null
  category?: string | null
  price?: number | null
  price_text?: string
  image_url?: string | null
  recommendation_score: number
  reason_short: string
}

type RecommendationProductCardProps = {
  product: RecommendationProduct
  savedProductIds: string[]
  comparedProductIds: string[]
  onToggleSaved: (id: string) => void
  onToggleCompared: (id: string) => void
  onOpenDetail: (id: string) => void
}

export default function RecommendationProductCard({
  product,
  savedProductIds,
  comparedProductIds,
  onToggleSaved,
  onToggleCompared,
  onOpenDetail,
}: RecommendationProductCardProps) {
  return (
    <article className="rounded-2xl border p-4">
      {product.image_url ? (
        <img
          src={product.image_url}
          alt={product.name}
          className="h-52 w-full rounded-xl border object-cover"
        />
      ) : (
        <div className="flex h-52 w-full items-center justify-center rounded-xl border bg-gray-100 text-gray-500">
          이미지 없음
        </div>
      )}

      <div className="mt-4">
        <div className="text-xs text-gray-500">
          {product.brand ?? "브랜드 미상"} · {product.category ?? "카테고리"}
        </div>
        <div className="mt-1 text-lg font-semibold">{product.name}</div>
      </div>

      <div className="mt-3 space-y-1 text-sm">
        <div>
          <span className="font-medium">추천 점수</span> {product.recommendation_score}
        </div>
        <div>
          <span className="font-medium">가격</span>{" "}
          {product.price_text ??
            (product.price ? `${product.price.toLocaleString()}원` : "-")}
        </div>
      </div>

      <p className="mt-3 text-sm text-gray-700">{product.reason_short}</p>

      <div className="mt-4 flex gap-2">
        <button
          className={`flex-1 rounded-xl border px-3 py-2 text-sm ${
            savedProductIds.includes(product.id)
              ? "bg-black text-white border-black"
              : ""
          }`}
          onClick={() => onToggleSaved(product.id)}
        >
          {savedProductIds.includes(product.id) ? "저장됨" : "저장"}
        </button>
        <button
          className={`flex-1 rounded-xl border px-3 py-2 text-sm ${
            comparedProductIds.includes(product.id)
              ? "bg-black text-white border-black"
              : ""
          }`}
          onClick={() => onToggleCompared(product.id)}
        >
          {comparedProductIds.includes(product.id) ? "비교중" : "비교"}
        </button>
        <button
          className="flex-1 rounded-xl border px-3 py-2 text-sm"
          onClick={() => onOpenDetail(product.id)}
        >
          자세히 보기
        </button>
      </div>
    </article>
  )
}