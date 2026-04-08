import {
  MAX_COMPARE_PRODUCTS,
  type CanonicalProductId,
} from "@/lib/mvp/product-contract"
import type { ProductLike } from "@/types/mvp"

type ResultCompareBarProps = {
  comparedProducts: ProductLike[]
  onOpenProduct: (id: CanonicalProductId) => void
  onRemoveCompared: (id: CanonicalProductId) => void
}

export default function ResultCompareBar({
  comparedProducts,
  onOpenProduct,
  onRemoveCompared,
}: ResultCompareBarProps) {
  const selectionMessage =
    comparedProducts.length === 0
      ? "비교할 상품을 선택해주세요"
      : comparedProducts.length === 1
        ? "1개 선택됨 · 하나를 더 담으면 가격과 점수를 바로 비교해드려요"
        : `${MAX_COMPARE_PRODUCTS}개 선택됨 · 비교 요약이 아래에 표시됩니다`

  return (
    <div className="mt-8 rounded-3xl border border-gray-200 bg-gray-50/90 p-4 sm:p-5">
      <div className="flex flex-col gap-3 border-b border-gray-200 pb-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="text-sm font-semibold text-gray-900">비교 바</div>
            <div className="mt-1 text-xs leading-5 text-gray-500">
              최대 {MAX_COMPARE_PRODUCTS}개까지 비교 후보를 유지할 수 있어요
            </div>
          </div>

          <div className="inline-flex w-fit items-center rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-700">
            선택 {comparedProducts.length}/{MAX_COMPARE_PRODUCTS}
          </div>
        </div>

        <div className="rounded-2xl bg-white px-3 py-2 text-sm leading-6 text-gray-600">
          {selectionMessage}
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {comparedProducts.length === 0 ? (
          <>
            <div className="flex min-h-[124px] flex-col justify-between rounded-2xl border border-dashed border-gray-300 bg-white px-4 py-4 text-sm text-gray-400">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-300">
                Slot 01
              </div>
              <div className="text-base font-medium text-gray-400">비교 후보 1</div>
            </div>
            <div className="flex min-h-[124px] flex-col justify-between rounded-2xl border border-dashed border-gray-300 bg-white px-4 py-4 text-sm text-gray-400">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-300">
                Slot 02
              </div>
              <div className="text-base font-medium text-gray-400">비교 후보 2</div>
            </div>
          </>
        ) : (
          <>
            {comparedProducts.map((item, index) => (
              <div
                key={item.id}
                className="flex min-h-[124px] flex-col justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="inline-flex items-center rounded-full bg-gray-900 px-2.5 py-1 text-[11px] font-semibold text-white">
                      선택됨 {index + 1}
                    </div>
                    <div className="mt-3 break-words text-sm font-semibold leading-6 text-gray-900">
                      {item.name}
                    </div>
                    <div className="mt-2 text-xs leading-5 text-gray-500">
                      {item.category ?? "카테고리"} ·{" "}
                      {item.price_text ??
                        (item.price ? `${item.price.toLocaleString()}원` : "-")}
                    </div>
                  </div>

                  <div className="grid w-full shrink-0 grid-cols-2 gap-2 sm:w-auto sm:min-w-[168px]">
                    <button
                      className="rounded-xl border border-gray-300 px-3 py-2.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50"
                      onClick={() => onOpenProduct(item.id)}
                    >
                      보기
                    </button>
                    <button
                      className="rounded-xl border border-gray-300 px-3 py-2.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50"
                      onClick={() => onRemoveCompared(item.id)}
                    >
                      제거
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {comparedProducts.length === 1 && (
              <div className="flex min-h-[124px] flex-col justify-between rounded-2xl border border-dashed border-gray-300 bg-white px-4 py-4 text-sm text-gray-400">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-300">
                  Slot 02
                </div>
                <div className="text-base font-medium text-gray-400">비교 후보 2</div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
