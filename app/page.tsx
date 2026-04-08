"use client"

import IntroSection from "@/components/mvp/IntroSection"
import InputStepSection from "@/components/mvp/InputStepSection"
import PreferenceStepSection from "@/components/mvp/PreferenceStepSection"
import LoadingSection from "@/components/mvp/LoadingSection"
import ResultCompareBar from "@/components/mvp/ResultCompareBar"
import ResultComparisonSummary from "@/components/mvp/ResultComparisonSummary"
import SavedProductsSection from "@/components/mvp/SavedProductsSection"
import ProductDetailModal from "@/components/mvp/ProductDetailModal"
import RecommendationGroupSection from "@/components/mvp/RecommendationGroupSection"
import RecommendationProductCard from "@/components/mvp/RecommendationProductCard"
import useMvpFlow from "@/hooks/useMvpFlow"
import { MAX_COMPARE_PRODUCTS } from "@/lib/mvp/product-contract"
import type {
  BudgetLevel,
  FurnitureType,
  RoomType,
  StyleTag,
} from "@/types/mvp"

const ROOM_OPTIONS: Array<{ value: RoomType; label: string }> = [
  { value: "living", label: "거실" },
  { value: "bedroom", label: "침실" },
  { value: "workspace", label: "작업 공간" },
  { value: "dining", label: "다이닝" },
]

const STYLE_OPTIONS: Array<{ value: StyleTag; label: string }> = [
  { value: "modern", label: "모던" },
  { value: "minimal", label: "미니멀" },
  { value: "warm-wood", label: "따뜻한 우드톤" },
  { value: "bright", label: "밝고 화사한" },
  { value: "calm", label: "차분한" },
  { value: "hotel", label: "호텔 같은 느낌" },
]

const BUDGET_OPTIONS: Array<{ value: BudgetLevel; label: string }> = [
  { value: "low", label: "낮음" },
  { value: "medium", label: "보통" },
  { value: "high", label: "여유 있음" },
]

const FURNITURE_OPTIONS: Array<{ value: FurnitureType; label: string }> = [
  { value: "sofa", label: "소파" },
  { value: "chair", label: "의자" },
  { value: "table", label: "테이블" },
]

export default function Home() {
  const {
    step,
    setStep,

    imageUrl,
    setImageUrl,
    localPreviewUrl,
    roomType,
    setRoomType,

    styles,
    budget,
    setBudget,
    furniture,
    requestText,
    setRequestText,

    loading,
    data,
    error,

    selectedGroupId,
    setSelectedGroupId,
    setSelectedProductId,

    savedProductIds,
    comparedProductIds,

    selectedProduct,
    comparedProducts,
    comparisonSummary,
    savedProducts,

    canGoInputNext,
    canGoPreferenceNext,
    headerTitle,
    headerSubtitle,

    handleFileChange,
    resetFileStateForUrlInput,
    toggleStyle,
    toggleFurniture,
    toggleSavedProduct,
    toggleComparedProduct,
    openExternalProductLink,
    runMVP,
    resetResultAndGoPreference,
  } = useMvpFlow({
    roomOptions: ROOM_OPTIONS,
    styleOptions: STYLE_OPTIONS,
  })

  const roomLabel = findLabel(ROOM_OPTIONS, roomType) ?? "공간 미선택"
  const styleSummary = formatSelectedLabels(STYLE_OPTIONS, styles, "분위기 미선택")
  const furnitureSummary = formatSelectedLabels(
    FURNITURE_OPTIONS,
    furniture,
    "가구 미선택"
  )
  const budgetSummary = findLabel(BUDGET_OPTIONS, budget) ?? "예산 미선택"
  const activeImageLabel = localPreviewUrl ? "업로드 이미지" : "이미지 URL"
  const hasGroupedRecommendations =
    Boolean(data?.grouped_recommendations?.length)
  const hasFlatRecommendations = Boolean(data?.recommendations.length)
  const hasRecommendationResults =
    hasGroupedRecommendations || hasFlatRecommendations

  return (
    <main className="min-h-screen bg-white text-black">
      <div className="mx-auto max-w-5xl px-6 py-8 md:px-8 md:py-10">
        {step !== "intro" && (
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <button
                className="text-sm text-gray-600 disabled:opacity-40"
                onClick={() => {
                  if (step === "input") setStep("intro")
                  if (step === "preference") setStep("input")
                  if (step === "result") setStep("preference")
                }}
                disabled={step === "loading"}
              >
                이전으로
              </button>
              <div className="text-sm text-gray-500">
                {step === "input" && "1 / 4"}
                {step === "preference" && "2 / 4"}
                {step === "loading" && "3 / 4"}
                {step === "result" && "4 / 4"}
              </div>
            </div>
            <div className="mt-3 h-2 w-full rounded-full bg-gray-100">
              <div
                className="h-2 rounded-full bg-black transition-all"
                style={{
                  width:
                    step === "input"
                      ? "25%"
                      : step === "preference"
                      ? "50%"
                      : step === "loading"
                      ? "75%"
                      : "100%",
                }}
              />
            </div>
          </div>
        )}

        {step === "intro" && <IntroSection onStart={() => setStep("input")} />}

        {step === "input" && (
          <InputStepSection
            imageUrl={imageUrl}
            localPreviewUrl={localPreviewUrl}
            roomType={roomType}
            roomOptions={ROOM_OPTIONS}
            canGoNext={canGoInputNext}
            onChangeImageUrl={setImageUrl}
            onChangeFile={handleFileChange}
            onSelectRoomType={setRoomType}
            onNext={() => setStep("preference")}
            onResetFileStateForUrlInput={resetFileStateForUrlInput}
          />
        )}

        {step === "preference" && (
          <PreferenceStepSection
            styles={styles}
            budget={budget}
            furniture={furniture}
            requestText={requestText}
            styleOptions={STYLE_OPTIONS}
            budgetOptions={BUDGET_OPTIONS}
            furnitureOptions={FURNITURE_OPTIONS}
            canSubmit={canGoPreferenceNext}
            loading={loading}
            error={error}
            onToggleStyle={toggleStyle}
            onSetBudget={setBudget}
            onToggleFurniture={toggleFurniture}
            onSetRequestText={setRequestText}
            onSubmit={runMVP}
          />
        )}

        {step === "loading" && <LoadingSection />}

        {step === "result" && data && (
          <section>
            <div className="rounded-3xl border p-6">
              <div className="text-sm text-gray-500">추천 결과</div>
              <h2 className="mt-2 text-3xl font-bold">{headerTitle}</h2>
              <p className="mt-2 text-gray-600">{headerSubtitle}</p>
              <div className="mt-4 flex flex-wrap gap-2 text-sm">
                <ResultContextPill label="이미지" value={activeImageLabel} />
                <ResultContextPill label="공간" value={roomLabel} />
                <ResultContextPill label="분위기" value={styleSummary} />
                <ResultContextPill label="예산" value={budgetSummary} />
                <ResultContextPill label="가구" value={furnitureSummary} />
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
                <div className="rounded-2xl border p-4">
                  <div className="text-sm font-medium">입력 이미지</div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={data.analysis.image_url}
                    alt="room"
                    className="mt-3 max-h-[360px] w-full rounded-xl border object-cover"
                  />
                </div>

                <div className="rounded-2xl border p-4">
                  <div className="text-sm font-medium">분석 요약</div>
                  <div className="mt-4 space-y-3 text-sm">
                    <Row label="밝기" value={data.analysis.brightness_score} />
                    <Row label="색온도" value={data.analysis.color_temperature_score} />
                    <Row label="공간 밀도" value={data.analysis.spatial_density_score} />
                    <Row label="미니멀 지수" value={data.analysis.minimalism_score} />
                    <Row label="대비" value={data.analysis.contrast_score} />
                    <Row label="컬러감" value={data.analysis.colorfulness_score} />
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">신뢰도</span>
                      <span className="font-semibold">{data.trust_score}</span>
                    </div>
                  </div>

                  {data.trust_note && (
                    <div className="mt-4 rounded-xl bg-gray-50 px-3 py-3 text-sm text-gray-600">
                      {data.trust_note}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <ResultCompareBar
              comparedProducts={comparedProducts}
              onOpenProduct={setSelectedProductId}
              onRemoveCompared={toggleComparedProduct}
            />

            <ResultComparisonSummary comparisonSummary={comparisonSummary} />

            <div className="mt-8">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <div className="text-sm text-gray-500">추천 조합</div>
                  <h3 className="text-2xl font-bold">내 공간에 맞춘 추천안</h3>
                  <p className="mt-1 text-sm text-gray-600">
                    저장, 비교, 자세히 보기, 상품 보기를 같은 상품 기준으로 이어갈 수 있어요.
                  </p>
                </div>

                <div className="flex gap-2 text-sm">
                  <div className="rounded-full border px-3 py-1">
                    저장 {savedProductIds.length}
                  </div>
                  <div className="rounded-full border px-3 py-1">
                    비교 {comparedProductIds.length}/{MAX_COMPARE_PRODUCTS}
                  </div>
                </div>
              </div>

              {data.quality_summary?.weak_result && (
                <div className="mt-4 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm leading-6 text-gray-700">
                  조건에 완전히 맞는 후보가 충분하지 않아 일부 추천은 근접 후보로 구성했어요.
                </div>
              )}

              {hasGroupedRecommendations ? (
                <RecommendationGroupSection
                  groups={data.grouped_recommendations ?? []}
                  selectedGroupId={selectedGroupId}
                  setSelectedGroupId={setSelectedGroupId}
                  savedProductIds={savedProductIds}
                  comparedProductIds={comparedProductIds}
                  onToggleSaved={toggleSavedProduct}
                  onToggleCompared={toggleComparedProduct}
                  onOpenDetail={setSelectedProductId}
                  onOpenExternal={openExternalProductLink}
                />
              ) : hasFlatRecommendations ? (
                <div className="mt-4 grid gap-4 md:grid-cols-3">
                  {data.recommendations.map((r) => (
                    <RecommendationProductCard
                      key={r.id}
                      product={r}
                      savedProductIds={savedProductIds}
                      comparedProductIds={comparedProductIds}
                      onToggleSaved={toggleSavedProduct}
                      onToggleCompared={toggleComparedProduct}
                      onOpenDetail={setSelectedProductId}
                      onOpenExternal={openExternalProductLink}
                    />
                  ))}
                </div>
              ) : (
                <EmptyRecommendationNotice onRetry={resetResultAndGoPreference} />
              )}
            </div>

            {hasRecommendationResults && (
              <SavedProductsSection
                savedProducts={savedProducts}
                onOpenProduct={setSelectedProductId}
                onOpenExternal={openExternalProductLink}
                onToggleSaved={toggleSavedProduct}
              />
            )}

            <div className="mt-8">
              <button
                className="rounded-xl border px-5 py-3"
                onClick={resetResultAndGoPreference}
              >
                조건 바꿔서 다시 보기
              </button>
            </div>
          </section>
        )}
      </div>

      <ProductDetailModal
        product={selectedProduct}
        savedProductIds={savedProductIds}
        comparedProductIds={comparedProductIds}
        onClose={() => setSelectedProductId(null)}
        onToggleSaved={toggleSavedProduct}
        onToggleCompared={toggleComparedProduct}
        onOpenExternal={openExternalProductLink}
      />
    </main>
  )
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-600">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  )
}

function ResultContextPill({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="rounded-full border border-gray-200 px-3 py-1 text-gray-700">
      <span className="text-gray-500">{label}</span>{" "}
      <span className="font-medium text-gray-900">{value}</span>
    </div>
  )
}

function EmptyRecommendationNotice({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="mt-4 rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-5 py-8 text-sm leading-6 text-gray-700">
      <div className="font-semibold text-gray-900">
        조건에 맞는 구매 후보를 찾지 못했어요
      </div>
      <p className="mt-2">
        예산이나 필요한 가구 조건을 조금 넓히면 추천 후보를 다시 찾을 수 있어요.
      </p>
      <button
        className="mt-4 rounded-xl border border-gray-300 bg-white px-4 py-2 font-medium text-gray-900"
        onClick={onRetry}
      >
        조건 바꿔서 다시 보기
      </button>
    </div>
  )
}

function findLabel<T extends string>(
  options: Array<{ value: T; label: string }>,
  value: T | null
) {
  return value ? options.find((item) => item.value === value)?.label : null
}

function formatSelectedLabels<T extends string>(
  options: Array<{ value: T; label: string }>,
  values: T[],
  fallback: string
) {
  const labels = options
    .filter((item) => values.includes(item.value))
    .map((item) => item.label)

  return labels.length > 0 ? labels.join(", ") : fallback
}
