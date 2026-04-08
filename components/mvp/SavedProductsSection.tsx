import type { CanonicalProductId } from "@/lib/mvp/product-contract"
import type { ProductLike } from "@/types/mvp"

type SavedProductsSectionProps = {
  savedProducts: ProductLike[]
  onOpenProduct: (id: CanonicalProductId) => void
  onOpenExternal: (item: ProductLike) => void
  onToggleSaved: (id: CanonicalProductId) => void
}

export default function SavedProductsSection({
  savedProducts,
  onOpenProduct,
  onOpenExternal,
  onToggleSaved,
}: SavedProductsSectionProps) {
  return (
    <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
      <div className="flex flex-col gap-3 border-b border-gray-100 pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="text-sm font-semibold text-gray-900">저장한 후보</div>
          <p className="text-sm leading-6 text-gray-500">
            비교하거나 다시 살펴볼 상품을 한곳에서 빠르게 확인할 수 있어요.
          </p>
        </div>

        <div className="inline-flex w-fit items-center rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-sm font-medium text-gray-700">
          총 {savedProducts.length}개
        </div>
      </div>

      {savedProducts.length === 0 ? (
        <div className="mt-5 rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-5 py-8 text-center">
          <div className="text-sm font-medium text-gray-900">
            아직 저장한 상품이 없어요
          </div>
          <p className="mt-2 text-sm leading-6 text-gray-500">
            추천 결과에서 마음에 드는 상품을 저장하면 여기에서 다시 비교하고
            확인할 수 있어요.
          </p>
        </div>
      ) : (
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {savedProducts.map((item) => {
            const priceText =
              item.price_text ??
              (item.price ? `${item.price.toLocaleString()}원` : "-")

            return (
              <article
                key={item.id}
                className="flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-4"
              >
                <div className="grid gap-4 sm:grid-cols-[96px_minmax(0,1fr)]">
                  {item.image_url ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="h-40 w-full rounded-xl border border-gray-200 object-cover sm:h-24 sm:w-24"
                      />
                    </>
                  ) : (
                    <div className="flex h-40 w-full items-center justify-center rounded-xl border border-gray-200 bg-gray-100 text-sm text-gray-400 sm:h-24 sm:w-24">
                      이미지 없음
                    </div>
                  )}

                  <div className="min-w-0">
                    <div className="flex flex-col gap-3">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                          <span>{item.category ?? "카테고리"}</span>
                          <span className="text-gray-300">•</span>
                          <span className="font-medium text-gray-700">
                            {priceText}
                          </span>
                        </div>

                        <div className="text-base font-semibold leading-6 text-gray-900">
                          {item.name}
                        </div>
                      </div>

                      <p className="line-clamp-3 text-sm leading-6 text-gray-700">
                        {item.reason_short}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid gap-2 sm:grid-cols-3">
                  <button
                    className="flex min-h-[44px] items-center justify-center rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-900 transition"
                    onClick={() => onOpenProduct(item.id)}
                  >
                    자세히 보기
                  </button>
                  <button
                    className="flex min-h-[44px] items-center justify-center rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-900 transition"
                    onClick={() => onOpenExternal(item)}
                  >
                    상품 보기
                  </button>
                  <button
                    className="flex min-h-[44px] items-center justify-center rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-900 transition"
                    onClick={() => onToggleSaved(item.id)}
                  >
                    저장 해제
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}
