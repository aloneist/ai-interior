import type { ProductLike } from "@/types/mvp"

type SavedProductsSectionProps = {
  savedProducts: ProductLike[]
  onOpenProduct: (id: string) => void
  onOpenExternal: (item: ProductLike) => void
  onToggleSaved: (id: string) => void
}

export default function SavedProductsSection({
  savedProducts,
  onOpenProduct,
  onOpenExternal,
  onToggleSaved,
}: SavedProductsSectionProps) {
  return (
    <div className="mt-8 rounded-2xl border p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-sm font-medium">저장한 후보</div>
          <div className="text-xs text-gray-500">
            지금까지 저장한 상품을 모아볼 수 있어요
          </div>
        </div>

        <div className="rounded-full border px-3 py-1 text-sm">
          총 {savedProducts.length}개
        </div>
      </div>

      {savedProducts.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-dashed bg-gray-50 p-6 text-sm text-gray-500">
          아직 저장한 상품이 없어요. 마음에 드는 후보를 저장해보세요.
        </div>
      ) : (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {savedProducts.map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-4 rounded-2xl border p-4"
            >
              {item.image_url ? (
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="h-24 w-24 rounded-xl border object-cover"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-xl border bg-gray-100 text-xs text-gray-400">
                  이미지 없음
                </div>
              )}

              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold">{item.name}</div>
                <div className="mt-1 text-xs text-gray-500">
                  {item.category ?? "카테고리"} ·{" "}
                  {item.price_text ??
                    (item.price ? `${item.price.toLocaleString()}원` : "-")}
                </div>
                <div className="mt-2 line-clamp-2 text-sm text-gray-700">
                  {item.reason_short}
                </div>

                <div className="mt-3 flex gap-2">
                  <button
                    className="rounded-xl border px-3 py-2 text-xs"
                    onClick={() => onOpenProduct(item.id)}
                  >
                    자세히 보기
                  </button>
                  <button
                    className="rounded-xl border px-3 py-2 text-xs"
                    onClick={() => onOpenExternal(item)}
                  >
                    상품 보기
                  </button>
                  <button
                    className="rounded-xl border px-3 py-2 text-xs"
                    onClick={() => onToggleSaved(item.id)}
                  >
                    저장 해제
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}