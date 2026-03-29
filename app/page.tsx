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
  selectedProductId,
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


  const canGoInputNext =
  Boolean(roomType) && (Boolean(selectedFile) || Boolean(imageUrl.trim()))
  const canGoPreferenceNext =
    Boolean(budget) && styles.length > 0 && furniture.length > 0




  try {
    let finalImageUrl = imageUrl.trim()

    if (selectedFile) {
      if (!uploadedImageUrl) {
        const formData = new FormData()
        formData.append("file", selectedFile)

        const uploadRes = await fetch("/api/upload-image", {
          method: "POST",
          body: formData,
        })

        const uploadJson = (await uploadRes.json()) as UploadImageResponse

        if (!uploadRes.ok || !uploadJson.success || !uploadJson.imageUrl) {
          setError(uploadJson.message || uploadJson.error || "이미지 업로드 실패")
          setStep("input")
          return
        }

        finalImageUrl = uploadJson.imageUrl
        setUploadedImageUrl(uploadJson.imageUrl)
      } else {
        finalImageUrl = uploadedImageUrl
      }
    }

    if (!finalImageUrl) {
      setError("이미지를 업로드하거나 URL을 입력해주세요")
      setStep("input")
      return
    }

    const res = await fetch("/api/mvp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageUrl: finalImageUrl }),
    })

    const json = (await res.json()) as MVPResponse

    if (!res.ok || !json.success) {
      setError(json.message || json.error || "요청 실패")
      setStep("preference")
      return
    }

    setData(json)
    setStep("result")
  } catch (e: any) {
    setError(e?.message || "에러 발생")
    setStep("preference")
  } finally {
    setLoading(false)
  }
}

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

              <div className="mt-6 grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
                <div className="rounded-2xl border p-4">
                  <div className="text-sm font-medium">입력 이미지</div>
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
  comparedProducts={comparedProducts as any[]}
  onOpenProduct={setSelectedProductId}
  onRemoveCompared={toggleComparedProduct}
/>

<ResultComparisonSummary comparisonSummary={comparisonSummary as any} />

            <div className="mt-8">
  <div className="flex flex-wrap items-end justify-between gap-3">
  <div>
    <div className="text-sm text-gray-500">추천 조합</div>
    <h3 className="text-2xl font-bold">내 공간에 맞춘 추천안</h3>
  </div>

  <div className="flex gap-2 text-sm">
    <div className="rounded-full border px-3 py-1">
      저장 {savedProductIds.length}
    </div>
    <div className="rounded-full border px-3 py-1">
      비교 {comparedProductIds.length}/2
    </div>
  </div>
</div>

  {data.grouped_recommendations && data.grouped_recommendations.length > 0 ? (
  <RecommendationGroupSection
    groups={data.grouped_recommendations as any[]}
    selectedGroupId={selectedGroupId}
    setSelectedGroupId={setSelectedGroupId}
    savedProductIds={savedProductIds}
    comparedProductIds={comparedProductIds}
    onToggleSaved={toggleSavedProduct}
    onToggleCompared={toggleComparedProduct}
    onOpenDetail={setSelectedProductId}
  />
) : (
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
    />
  ))}
</div>
  )}
</div>
<SavedProductsSection
  savedProducts={savedProducts as any[]}
  onOpenProduct={setSelectedProductId}
  onOpenExternal={openExternalProductLink}
  onToggleSaved={toggleSavedProduct}
/>

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
  product={selectedProduct as any}
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