type BudgetLevel = "low" | "medium" | "high"
type FurnitureType = "sofa" | "chair" | "table"
type StyleTag =
  | "modern"
  | "minimal"
  | "warm-wood"
  | "bright"
  | "calm"
  | "hotel"

type PreferenceStepSectionProps = {
  styles: StyleTag[]
  budget: BudgetLevel | null
  furniture: FurnitureType[]
  requestText: string
  styleOptions: Array<{ value: StyleTag; label: string }>
  budgetOptions: Array<{ value: BudgetLevel; label: string }>
  furnitureOptions: Array<{ value: FurnitureType; label: string }>
  canSubmit: boolean
  loading: boolean
  error: string | null
  onToggleStyle: (value: StyleTag) => void
  onSetBudget: (value: BudgetLevel) => void
  onToggleFurniture: (value: FurnitureType) => void
  onSetRequestText: (value: string) => void
  onSubmit: () => void
}

export default function PreferenceStepSection({
  styles,
  budget,
  furniture,
  requestText,
  styleOptions,
  budgetOptions,
  furnitureOptions,
  canSubmit,
  loading,
  error,
  onToggleStyle,
  onSetBudget,
  onToggleFurniture,
  onSetRequestText,
  onSubmit,
}: PreferenceStepSectionProps) {
  return (
    <section className="max-w-3xl">
      <h2 className="text-2xl font-bold">취향과 조건을 알려주세요</h2>
      <p className="mt-2 text-sm text-gray-600">
        질문을 최소화하고, 결과 품질에 필요한 것만 받습니다.
      </p>

      <div className="mt-6 space-y-6 rounded-2xl border p-5">
        <div>
          <div className="text-sm font-medium">원하는 분위기</div>
          <div className="mt-3 flex flex-wrap gap-2">
            {styleOptions.map((item) => {
              const active = styles.includes(item.value)
              return (
                <button
                  key={item.value}
                  onClick={() => onToggleStyle(item.value)}
                  className={`rounded-full border px-4 py-2 text-sm ${
                    active ? "bg-black text-white border-black" : "bg-white text-black"
                  }`}
                >
                  {item.label}
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <div className="text-sm font-medium">예산</div>
          <div className="mt-3 flex flex-wrap gap-2">
            {budgetOptions.map((item) => {
              const active = budget === item.value
              return (
                <button
                  key={item.value}
                  onClick={() => onSetBudget(item.value)}
                  className={`rounded-full border px-4 py-2 text-sm ${
                    active ? "bg-black text-white border-black" : "bg-white text-black"
                  }`}
                >
                  {item.label}
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <div className="text-sm font-medium">필요한 가구</div>
          <div className="mt-3 flex flex-wrap gap-2">
            {furnitureOptions.map((item) => {
              const active = furniture.includes(item.value)
              return (
                <button
                  key={item.value}
                  onClick={() => onToggleFurniture(item.value)}
                  className={`rounded-full border px-4 py-2 text-sm ${
                    active ? "bg-black text-white border-black" : "bg-white text-black"
                  }`}
                >
                  {item.label}
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">추가 요청</label>
          <textarea
            className="mt-2 min-h-28 w-full rounded-2xl border px-3 py-3"
            value={requestText}
            onChange={(e) => onSetRequestText(e.target.value)}
            placeholder="예: 답답해 보이지 않았으면 좋겠어요"
          />
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-6">
        <button
          className="rounded-xl bg-black px-5 py-3 text-white disabled:opacity-40"
          disabled={!canSubmit || loading}
          onClick={onSubmit}
        >
          {loading ? "추천을 준비하는 중" : "추천 받기"}
        </button>
        {!canSubmit && !loading && (
          <p className="mt-2 text-xs text-gray-500">
            분위기, 예산, 필요한 가구를 선택하면 추천을 시작할 수 있어요.
          </p>
        )}
      </div>
    </section>
  )
}
