import type { ProductLike } from "@/types/mvp"

type ResultCompareBarProps = {
  comparedProducts: ProductLike[]
  onOpenProduct: (id: string) => void
  onRemoveCompared: (id: string) => void
}

export default function ResultCompareBar({
  comparedProducts,
  onOpenProduct,
  onRemoveCompared,
}: ResultCompareBarProps) {
  return (
    <div className="mt-8 rounded-2xl border bg-gray-50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-sm font-medium">비교 바</div>
          <div className="text-xs text-gray-500">
            최대 2개까지 비교 후보를 유지할 수 있어요
          </div>
        </div>

        <div className="text-sm text-gray-600">
          {comparedProducts.length === 0 && "비교할 상품을 선택해주세요"}
          {comparedProducts.length === 1 &&
            "1개 선택됨 · 하나를 더 담으면 가격과 점수를 바로 비교해드려요"}
          {comparedProducts.length === 2 &&
            "2개 선택됨 · 비교 요약이 아래에 표시됩니다"}
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {comparedProducts.length === 0 ? (
          <>
            <div className="rounded-2xl border border-dashed bg-white p-4 text-sm text-gray-400">
              비교 후보 1
            </div>
            <div className="rounded-2xl border border-dashed bg-white p-4 text-sm text-gray-400">
              비교 후보 2
            </div>
          </>
        ) : (
          <>
            {comparedProducts.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 rounded-2xl border bg-white p-4"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">{item.name}</div>
                  <div className="mt-1 text-xs text-gray-500">
                    {item.category ?? "카테고리"} ·{" "}
                    {item.price_text ??
                      (item.price ? `${item.price.toLocaleString()}원` : "-")}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    className="rounded-xl border px-3 py-2 text-xs"
                    onClick={() => onOpenProduct(item.id)}
                  >
                    보기
                  </button>
                  <button
                    className="rounded-xl border px-3 py-2 text-xs"
                    onClick={() => onRemoveCompared(item.id)}
                  >
                    제거
                  </button>
                </div>
              </div>
            ))}

            {comparedProducts.length === 1 && (
              <div className="rounded-2xl border border-dashed bg-white p-4 text-sm text-gray-400">
                비교 후보 2
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}