import RecommendationProductCard from "@/components/mvp/RecommendationProductCard"

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

type RecommendationGroup = {
  id: "balanced" | "budget" | "mood"
  title: string
  concept_tag: string
  total_price_text: string
  summary_text: string
  products: RecommendationProduct[]
}

type RecommendationGroupSectionProps = {
  groups: RecommendationGroup[]
  selectedGroupId: "balanced" | "budget" | "mood"
  setSelectedGroupId: (id: "balanced" | "budget" | "mood") => void
  savedProductIds: string[]
  comparedProductIds: string[]
  onToggleSaved: (id: string) => void
  onToggleCompared: (id: string) => void
  onOpenDetail: (id: string) => void
}

export default function RecommendationGroupSection({
  groups,
  selectedGroupId,
  setSelectedGroupId,
  savedProductIds,
  comparedProductIds,
  onToggleSaved,
  onToggleCompared,
  onOpenDetail,
}: RecommendationGroupSectionProps) {
  const selectedGroup =
    groups.find((group) => group.id === selectedGroupId) ?? null

  return (
    <>
      <div className="mt-4 flex flex-wrap gap-2">
        {groups.map((group) => {
          const active = group.id === selectedGroupId

          return (
            <button
              key={group.id}
              className={`rounded-full border px-4 py-2 text-sm ${
                active ? "bg-black text-white border-black" : "bg-white text-black"
              }`}
              onClick={() => setSelectedGroupId(group.id)}
            >
              {group.title}
            </button>
          )
        })}
      </div>

      {selectedGroup && (
        <div className="mt-5 rounded-2xl border p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs text-gray-500">{selectedGroup.concept_tag}</div>
              <h4 className="mt-1 text-xl font-bold">{selectedGroup.title}</h4>
            </div>
            <div className="text-sm font-medium">{selectedGroup.total_price_text}</div>
          </div>

          <p className="mt-3 text-sm text-gray-700">{selectedGroup.summary_text}</p>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {selectedGroup.products.map((product) => (
              <RecommendationProductCard
                key={product.id}
                product={product}
                savedProductIds={savedProductIds}
                comparedProductIds={comparedProductIds}
                onToggleSaved={onToggleSaved}
                onToggleCompared={onToggleCompared}
                onOpenDetail={onOpenDetail}
              />
            ))}
          </div>
        </div>
      )}
    </>
  )
}