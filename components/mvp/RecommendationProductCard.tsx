import type { ProductLike } from "@/types/mvp"

type RecommendationProductCardProps = {
  product: ProductLike
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
  const isSaved = savedProductIds.includes(product.id)
  const isCompared = comparedProductIds.includes(product.id)
  const priceText =
    product.price_text ??
    (product.price ? `${product.price.toLocaleString()}원` : "-")

  return (
    <article className="flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-4">
      {product.image_url ? (
        <img
          src={product.image_url}
          alt={product.name}
          className="h-52 w-full rounded-xl border border-gray-200 object-cover"
        />
      ) : (
        <div className="flex h-52 w-full items-center justify-center rounded-xl border border-gray-200 bg-gray-100 text-gray-500">
          이미지 없음
        </div>
      )}

      <div className="mt-4 flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <div className="text-xs text-gray-500">
              {product.brand ?? "브랜드 미상"} · {product.category ?? "카테고리"}
            </div>
            <div className="mt-1 min-h-[3.5rem] text-lg font-semibold leading-7 text-gray-900">
              {product.name}
            </div>
          </div>

          <button
            className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition ${
              isSaved
                ? "border-black bg-black text-white"
                : "border-gray-300 bg-white text-gray-900"
            }`}
            onClick={() => onToggleSaved(product.id)}
          >
            {isSaved ? "저장됨" : "저장"}
          </button>
        </div>

        <div className="rounded-xl bg-gray-50 px-4 py-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs text-gray-500">추천 점수</div>
              <div className="mt-1 text-sm font-semibold text-gray-900">
                {product.recommendation_score}
              </div>
            </div>

            <div className="text-right">
              <div className="text-xs text-gray-500">가격</div>
              <div className="mt-1 text-lg font-semibold text-gray-900">
                {priceText}
              </div>
            </div>
          </div>
        </div>

        <p className="min-h-[3rem] text-sm leading-6 text-gray-700">
          {product.reason_short}
        </p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          className={`flex min-h-[44px] items-center justify-center rounded-xl border px-3 py-2 text-sm font-medium transition ${
            isCompared
              ? "border-black bg-black text-white"
              : "border-gray-300 bg-white text-gray-900"
          }`}
          onClick={() => onToggleCompared(product.id)}
        >
          {isCompared ? "비교중" : "비교"}
        </button>
        <button
          className="flex min-h-[44px] items-center justify-center rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-900 transition"
          onClick={() => onOpenDetail(product.id)}
        >
          자세히 보기
        </button>
      </div>
    </article>
  )
}
