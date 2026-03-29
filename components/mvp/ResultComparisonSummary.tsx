type ComparisonItem = {
  id: string
  name: string
  category?: string | null
  price?: number | null
  price_text?: string
  recommendation_score: number
}

type ComparisonSummary = {
  left: ComparisonItem
  right: ComparisonItem
  cheaperItem: ComparisonItem | null
  higherScoreItem: ComparisonItem | null
  recommendationText: string
}

type ResultComparisonSummaryProps = {
  comparisonSummary: ComparisonSummary | null
}

export default function ResultComparisonSummary({
  comparisonSummary,
}: ResultComparisonSummaryProps) {
  if (!comparisonSummary) return null

  return (
    <div className="mt-4 rounded-2xl border p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-sm font-medium">간단 비교 요약</div>
          <div className="text-xs text-gray-500">
            지금 비교중인 2개 후보를 빠르게 정리했어요
          </div>
        </div>

        <div className="rounded-full border px-3 py-1 text-sm">
          {comparisonSummary.recommendationText}
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {[comparisonSummary.left, comparisonSummary.right].map((item) => {
          const isCheaper = comparisonSummary.cheaperItem?.id === item.id
          const isHigherScore = comparisonSummary.higherScoreItem?.id === item.id

          return (
            <div key={item.id} className="rounded-2xl border p-4">
              <div className="text-sm font-semibold">{item.name}</div>
              <div className="mt-1 text-xs text-gray-500">
                {item.category ?? "카테고리"}
              </div>

              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">가격</span>
                  <span className="font-medium">
                    {item.price_text ??
                      (item.price ? `${item.price.toLocaleString()}원` : "-")}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">추천 점수</span>
                  <span className="font-medium">{item.recommendation_score}</span>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {isCheaper && (
                  <span className="rounded-full border px-3 py-1 text-xs">
                    더 저렴함
                  </span>
                )}
                {isHigherScore && (
                  <span className="rounded-full border px-3 py-1 text-xs">
                    더 잘 맞음
                  </span>
                )}
                {!isCheaper && !isHigherScore && (
                  <span className="rounded-full border px-3 py-1 text-xs text-gray-500">
                    비교 중
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}