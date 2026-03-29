"use client"

import { useMemo, useState } from "react"

type MVPResponse = {
  success: boolean
  request_id?: string
  analysis: {
    image_url: string
    brightness_score: number
    color_temperature_score: number
    spatial_density_score: number
    minimalism_score: number
    contrast_score: number
    colorfulness_score: number
    dominant_color_hex: string
  }
  trust_score: number
  trust_note: string | null
  recommendations: Array<{
    request_id: string
    id: string
    name: string
    brand: string | null
    category: string | null
    price: number | null
    image_url: string | null
    recommendation_score: number
    reason_short: string
  }>
  grouped_recommendations?: Array<{
    id: "balanced" | "budget" | "mood"
    title: string
    concept_tag: string
    total_price_text: string
    summary_text: string
    products: Array<{
      id: string
      name: string
      brand: string | null
      category: string | null
      price: number | null
      price_text?: string
      image_url: string | null
      recommendation_score: number
      reason_short: string
    }>
  }>
  error?: string
  message?: string
}

type UploadImageResponse = {
  success: boolean
  imageUrl?: string
  publicId?: string
  error?: string
  message?: string
}

type Step = "intro" | "input" | "preference" | "loading" | "result"
type RoomType = "living" | "bedroom" | "workspace" | "dining"
type BudgetLevel = "low" | "medium" | "high"
type FurnitureType = "sofa" | "chair" | "table"
type StyleTag =
  | "modern"
  | "minimal"
  | "warm-wood"
  | "bright"
  | "calm"
  | "hotel"

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
  const [step, setStep] = useState<Step>("intro")

  const [imageUrl, setImageUrl] = useState(
  "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85"
)
const [selectedFile, setSelectedFile] = useState<File | null>(null)
const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null)
const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null)

const [roomType, setRoomType] = useState<RoomType | null>(null)
  const [styles, setStyles] = useState<StyleTag[]>([])
  const [budget, setBudget] = useState<BudgetLevel | null>(null)
  const [furniture, setFurniture] = useState<FurnitureType[]>([])
  const [requestText, setRequestText] = useState("답답해 보이지 않았으면 좋겠어요")

  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<MVPResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedGroupId, setSelectedGroupId] = useState<"balanced" | "budget" | "mood">("balanced")
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)
  const [savedProductIds, setSavedProductIds] = useState<string[]>([])
  const [comparedProductIds, setComparedProductIds] = useState<string[]>([])

  const selectedGroup = useMemo(() => {
    return (
      data?.grouped_recommendations?.find((group) => group.id === selectedGroupId) ?? null
    )
  }, [data, selectedGroupId])

  const selectedProduct = useMemo(() => {
    const groupedMatch =
      selectedGroup?.products.find((item) => item.id === selectedProductId) ?? null

    if (groupedMatch) return groupedMatch

    return data?.recommendations.find((item) => item.id === selectedProductId) ?? null
  }, [data, selectedGroup, selectedProductId])

  const comparedProducts = useMemo(() => {
  const groupedProducts =
    data?.grouped_recommendations?.flatMap((group) => group.products) ?? []

  const fallbackProducts = data?.recommendations ?? []

  const allProducts = [...groupedProducts, ...fallbackProducts]

  return comparedProductIds
    .map((id) => allProducts.find((item) => item.id === id) ?? null)
    .filter(Boolean)
}, [data, comparedProductIds])

  const comparisonSummary = useMemo(() => {
  if (comparedProducts.length !== 2) return null

  const [a, b] = comparedProducts as any[]

  const aPrice = typeof a.price === "number" ? a.price : null
  const bPrice = typeof b.price === "number" ? b.price : null

  const cheaperItem =
    aPrice != null && bPrice != null
      ? aPrice < bPrice
        ? a
        : bPrice < aPrice
        ? b
        : null
      : null

  const higherScoreItem =
    a.recommendation_score > b.recommendation_score
      ? a
      : b.recommendation_score > a.recommendation_score
      ? b
      : null

  let recommendationText = "두 후보가 각각 장점이 있어요."

  if (cheaperItem && higherScoreItem && cheaperItem.id === higherScoreItem.id) {
    recommendationText = `${cheaperItem.name}이(가) 가격과 추천 점수 모두 유리해요.`
  } else if (higherScoreItem && cheaperItem && higherScoreItem.id !== cheaperItem.id) {
    recommendationText = `${higherScoreItem.name}은 더 잘 맞고, ${cheaperItem.name}은 더 저렴해요.`
  } else if (higherScoreItem) {
    recommendationText = `${higherScoreItem.name}이(가) 현재 공간 기준으로 더 잘 맞아요.`
  } else if (cheaperItem) {
    recommendationText = `${cheaperItem.name}이(가) 가격 부담이 더 적어요.`
  }

  return {
    left: a,
    right: b,
    cheaperItem,
    higherScoreItem,
    recommendationText,
  }
}, [comparedProducts])

const savedProducts = useMemo(() => {
  const groupedProducts =
    data?.grouped_recommendations?.flatMap((group) => group.products) ?? []

  const fallbackProducts = data?.recommendations ?? []

  const allProducts = [...groupedProducts, ...fallbackProducts]

  return savedProductIds
    .map((id) => allProducts.find((item) => item.id === id) ?? null)
    .filter(Boolean)
}, [data, savedProductIds])

  const canGoInputNext =
  Boolean(roomType) && (Boolean(selectedFile) || Boolean(imageUrl.trim()))
  const canGoPreferenceNext =
    Boolean(budget) && styles.length > 0 && furniture.length > 0

  const headerTitle = useMemo(() => {
    const roomLabel =
      ROOM_OPTIONS.find((item) => item.value === roomType)?.label ?? "공간"
    return `${roomLabel}을 위한 추천`
  }, [roomType])

  const headerSubtitle = useMemo(() => {
    const styleLabels = STYLE_OPTIONS.filter((item) => styles.includes(item.value)).map(
      (item) => item.label
    )

    const styleText =
      styleLabels.length > 0 ? `${styleLabels.slice(0, 2).join(", ")} 중심으로 ` : ""

    const requestSnippet = requestText.trim()
      ? `요청하신 "${requestText.trim()}"를 반영해 `
      : ""

    return `${styleText}${requestSnippet}실제 구매 가능한 후보를 골랐어요`
  }, [styles, requestText])

  const handleFileChange = (file: File | null) => {
  setSelectedFile(file)
  setUploadedImageUrl(null)

  if (!file) {
    setLocalPreviewUrl(null)
    return
  }

  const nextPreviewUrl = URL.createObjectURL(file)
  setLocalPreviewUrl(nextPreviewUrl)
}

  const toggleStyle = (value: StyleTag) => {
    setStyles((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    )
  }

  const toggleFurniture = (value: FurnitureType) => {
    setFurniture((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    )
  }

  const toggleSavedProduct = (productId: string) => {
  setSavedProductIds((prev) =>
    prev.includes(productId)
      ? prev.filter((id) => id !== productId)
      : [...prev, productId]
  )
}

const toggleComparedProduct = (productId: string) => {
  setComparedProductIds((prev) => {
    if (prev.includes(productId)) {
      return prev.filter((id) => id !== productId)
    }

    if (prev.length >= 2) {
      alert("비교는 최대 2개까지 가능합니다.")
      return prev
    }

    return [...prev, productId]
  })
}

  const runMVP = async () => {
  setLoading(true)
  setError(null)
  setData(null)
  setStep("loading")

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

        {step === "intro" && (
          <section className="py-10 md:py-16">
            <div className="max-w-3xl">
              <div className="text-sm text-gray-500">AI 인테리어 큐레이션 MVP</div>
              <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">
                내 공간에 맞는 실제 가구를
                <br />
                AI가 추천해드립니다
              </h1>
              <p className="mt-5 text-lg leading-8 text-gray-600">
                방 사진과 간단한 취향만 입력하면, 실제 구매 가능한 가구 후보를
                조합 형태로 추천해드려요.
              </p>

              <div className="mt-8 grid gap-4 md:grid-cols-3">
                <InfoCard
                  title="입력"
                  desc="공간 사진과 기본 조건만 간단히 입력"
                />
                <InfoCard
                  title="분석"
                  desc="공간 톤과 밀도를 바탕으로 추천"
                />
                <InfoCard
                  title="결과"
                  desc="실제 구매 가능한 가구 후보를 조합으로 확인"
                />
              </div>

              <button
                className="mt-10 rounded-xl bg-black px-5 py-3 text-white"
                onClick={() => setStep("input")}
              >
                내 공간으로 시작하기
              </button>
            </div>
          </section>
        )}

        {step === "input" && (
          <section className="max-w-3xl">
            <h2 className="text-2xl font-bold">공간 사진과 유형을 입력해주세요</h2>
            <p className="mt-2 text-sm text-gray-600">
              사진 1장만으로도 시작할 수 있어요. 파일 업로드 또는 공개 이미지 URL 모두 가능합니다.
            </p>

            <div className="mt-6 rounded-2xl border p-5">
  <label className="text-sm font-medium">공간 사진 업로드</label>

  <div className="mt-3">
    <input
      type="file"
      accept="image/*"
      onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
      className="block w-full text-sm"
    />
    <p className="mt-2 text-xs text-gray-500">
      방 전체가 보이는 사진이면 더 정확해요
    </p>
  </div>

  <div className="mt-5 border-t pt-5">
    <label className="text-sm font-medium">또는 공개 이미지 URL 사용</label>
    <input
      className="mt-2 w-full rounded-xl border px-3 py-3"
      value={imageUrl}
      onChange={(e) => {
        setImageUrl(e.target.value)
        if (e.target.value.trim()) {
          setSelectedFile(null)
          setLocalPreviewUrl(null)
          setUploadedImageUrl(null)
        }
      }}
      placeholder="공개 이미지 URL을 입력하세요"
    />
  </div>

  {(localPreviewUrl || imageUrl.trim()) && (
    <div className="mt-4">
      <img
        src={localPreviewUrl ?? imageUrl}
        alt="room preview"
        className="max-h-[320px] w-full rounded-xl border object-cover"
      />
    </div>
  )}
</div>

            <div className="mt-6 rounded-2xl border p-5">
              <div className="text-sm font-medium">공간 유형</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {ROOM_OPTIONS.map((item) => {
                  const active = roomType === item.value
                  return (
                    <button
                      key={item.value}
                      onClick={() => setRoomType(item.value)}
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

            <div className="mt-6">
              <button
                className="rounded-xl bg-black px-5 py-3 text-white disabled:opacity-40"
                disabled={!canGoInputNext}
                onClick={() => setStep("preference")}
              >
                다음
              </button>
            </div>
          </section>
        )}

        {step === "preference" && (
          <section className="max-w-3xl">
            <h2 className="text-2xl font-bold">취향과 조건을 알려주세요</h2>
            <p className="mt-2 text-sm text-gray-600">
              질문을 최소화하고, 결과 품질에 필요한 것만 받습니다.
            </p>

            <div className="mt-6 space-y-6 rounded-2xl border p-5">
              <div>
                <div className="text-sm font-medium">원하는 분위기</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {STYLE_OPTIONS.map((item) => {
                    const active = styles.includes(item.value)
                    return (
                      <button
                        key={item.value}
                        onClick={() => toggleStyle(item.value)}
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
                  {BUDGET_OPTIONS.map((item) => {
                    const active = budget === item.value
                    return (
                      <button
                        key={item.value}
                        onClick={() => setBudget(item.value)}
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
                  {FURNITURE_OPTIONS.map((item) => {
                    const active = furniture.includes(item.value)
                    return (
                      <button
                        key={item.value}
                        onClick={() => toggleFurniture(item.value)}
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
                  onChange={(e) => setRequestText(e.target.value)}
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
                disabled={!canGoPreferenceNext || loading}
                onClick={runMVP}
              >
                추천 받기
              </button>
            </div>
          </section>
        )}

        {step === "loading" && (
          <section className="mx-auto flex min-h-[50vh] max-w-2xl flex-col items-center justify-center text-center">
            <div className="h-12 w-12 animate-pulse rounded-full bg-black" />
            <h2 className="mt-6 text-2xl font-bold">분석 중입니다</h2>
            <div className="mt-3 space-y-2 text-sm text-gray-600">
              <p>공간을 분석하고 있어요</p>
              <p>취향과 예산을 반영하고 있어요</p>
              <p>실제 구매 가능한 가구를 찾고 있어요</p>
            </div>
          </section>
        )}

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
      {comparedProducts.length === 1 && "1개 선택됨 · 하나를 더 담으면 가격과 점수를 바로 비교해드려요"}
      {comparedProducts.length === 2 && "2개 선택됨 · 비교 요약이 아래에 표시됩니다"}
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
        {comparedProducts.map((item: any) => (
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
                onClick={() => setSelectedProductId(item.id)}
              >
                보기
              </button>
              <button
                className="rounded-xl border px-3 py-2 text-xs"
                onClick={() => toggleComparedProduct(item.id)}
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

{comparisonSummary && (
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
      {[comparisonSummary.left, comparisonSummary.right].map((item: any) => {
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
)}

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
    <>
      <div className="mt-4 flex flex-wrap gap-2">
        {data.grouped_recommendations.map((group) => {
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
            {selectedGroup.products.map((r) => (
              <article key={r.id} className="rounded-2xl border p-4">
                {r.image_url ? (
                  <img
                    src={r.image_url}
                    alt={r.name}
                    className="h-52 w-full rounded-xl border object-cover"
                  />
                ) : (
                  <div className="flex h-52 w-full items-center justify-center rounded-xl border bg-gray-100 text-gray-500">
                    이미지 없음
                  </div>
                )}

                <div className="mt-4">
                  <div className="text-xs text-gray-500">
                    {r.brand ?? "브랜드 미상"} · {r.category ?? "카테고리"}
                  </div>
                  <div className="mt-1 text-lg font-semibold">{r.name}</div>
                </div>

                <div className="mt-3 space-y-1 text-sm">
                  <div>
                    <span className="font-medium">추천 점수</span> {r.recommendation_score}
                  </div>
                  <div>
                    <span className="font-medium">가격</span>{" "}
                    {r.price_text ??
                      (r.price ? `${r.price.toLocaleString()}원` : "-")}
                  </div>
                </div>

                <p className="mt-3 text-sm text-gray-700">{r.reason_short}</p>

                <div className="mt-4 flex gap-2">
  <button
    className={`flex-1 rounded-xl border px-3 py-2 text-sm ${
      savedProductIds.includes(r.id) ? "bg-black text-white border-black" : ""
    }`}
    onClick={() => toggleSavedProduct(r.id)}
  >
    {savedProductIds.includes(r.id) ? "저장됨" : "저장"}
  </button>
  <button
    className={`flex-1 rounded-xl border px-3 py-2 text-sm ${
      comparedProductIds.includes(r.id) ? "bg-black text-white border-black" : ""
    }`}
    onClick={() => toggleComparedProduct(r.id)}
  >
    {comparedProductIds.includes(r.id) ? "비교중" : "비교"}
  </button>
  <button
    className="flex-1 rounded-xl border px-3 py-2 text-sm"
    onClick={() => setSelectedProductId(r.id)}
  >
    자세히 보기
  </button>
</div>
              </article>
            ))}
          </div>
        </div>
      )}
    </>
  ) : (
    <div className="mt-4 grid gap-4 md:grid-cols-3">
      {data.recommendations.map((r) => (
        <article key={r.id} className="rounded-2xl border p-4">
          {r.image_url ? (
            <img
              src={r.image_url}
              alt={r.name}
              className="h-52 w-full rounded-xl border object-cover"
            />
          ) : (
            <div className="flex h-52 w-full items-center justify-center rounded-xl border bg-gray-100 text-gray-500">
              이미지 없음
            </div>
          )}

          <div className="mt-4">
            <div className="text-xs text-gray-500">
              {r.brand ?? "브랜드 미상"} · {r.category ?? "카테고리"}
            </div>
            <div className="mt-1 text-lg font-semibold">{r.name}</div>
          </div>

          <div className="mt-3 space-y-1 text-sm">
            <div>
              <span className="font-medium">추천 점수</span> {r.recommendation_score}
            </div>
            <div>
              <span className="font-medium">가격</span>{" "}
              {r.price ? `${r.price.toLocaleString()}원` : "-"}
            </div>
          </div>

          <p className="mt-3 text-sm text-gray-700">{r.reason_short}</p>

          <div className="mt-4 flex gap-2">
  <button
    className={`flex-1 rounded-xl border px-3 py-2 text-sm ${
      savedProductIds.includes(r.id) ? "bg-black text-white border-black" : ""
    }`}
    onClick={() => toggleSavedProduct(r.id)}
  >
    {savedProductIds.includes(r.id) ? "저장됨" : "저장"}
  </button>
  <button
    className={`flex-1 rounded-xl border px-3 py-2 text-sm ${
      comparedProductIds.includes(r.id) ? "bg-black text-white border-black" : ""
    }`}
    onClick={() => toggleComparedProduct(r.id)}
  >
    {comparedProductIds.includes(r.id) ? "비교중" : "비교"}
  </button>
  <button
    className="flex-1 rounded-xl border px-3 py-2 text-sm"
    onClick={() => setSelectedProductId(r.id)}
  >
    자세히 보기
  </button>
</div>
        </article>
      ))}
    </div>
  )}
</div>
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
      {savedProducts.map((item: any) => (
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
                onClick={() => setSelectedProductId(item.id)}
              >
                자세히 보기
              </button>
              <button
                className="rounded-xl border px-3 py-2 text-xs"
                onClick={() => toggleSavedProduct(item.id)}
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

            <div className="mt-8">
              <button
                className="rounded-xl border px-5 py-3"
                onClick={() => {
                  setData(null)
                  setSelectedGroupId("balanced")
                  setSelectedProductId(null)
                  setStep("preference")
                }}
              >
                조건 바꿔서 다시 보기
              </button>
            </div>
          </section>
        )}
      </div>

      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="max-h-[90vh] w-full max-w-xl overflow-auto rounded-3xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm text-gray-500">
                  {selectedProduct.brand ?? "브랜드 미상"} · {selectedProduct.category ?? "카테고리"}
                </div>
                <h3 className="mt-1 text-2xl font-bold">{selectedProduct.name}</h3>
              </div>
              <button
                className="rounded-full border px-3 py-1 text-sm"
                onClick={() => setSelectedProductId(null)}
              >
                닫기
              </button>
            </div>

            {selectedProduct.image_url ? (
              <img
                src={selectedProduct.image_url}
                alt={selectedProduct.name}
                className="mt-5 h-72 w-full rounded-2xl border object-cover"
              />
            ) : null}

            <div className="mt-5 space-y-3 text-sm">
  <div>
    <span className="font-medium">가격</span>{" "}
    {selectedProduct.price
      ? `${selectedProduct.price.toLocaleString()}원`
      : "-"}
  </div>
  <div>
    <span className="font-medium">추천 점수</span>{" "}
    {selectedProduct.recommendation_score}
  </div>
  <div className="flex gap-2">
    <span className="rounded-full border px-3 py-1 text-xs">
      {savedProductIds.includes(selectedProduct.id) ? "저장됨" : "미저장"}
    </span>
    <span className="rounded-full border px-3 py-1 text-xs">
      {comparedProductIds.includes(selectedProduct.id) ? "비교중" : "비교 아님"}
    </span>
  </div>
  <div>
    <span className="font-medium">추천 이유</span>
    <p className="mt-1 text-gray-700">{selectedProduct.reason_short}</p>
  </div>
</div>

            <div className="mt-6 flex gap-2">
  <button
    className={`flex-1 rounded-xl border px-4 py-3 ${
      savedProductIds.includes(selectedProduct.id)
        ? "bg-black text-white border-black"
        : ""
    }`}
    onClick={() => toggleSavedProduct(selectedProduct.id)}
  >
    {savedProductIds.includes(selectedProduct.id) ? "저장됨" : "저장"}
  </button>
  <button
    className={`flex-1 rounded-xl border px-4 py-3 ${
      comparedProductIds.includes(selectedProduct.id)
        ? "bg-black text-white border-black"
        : ""
    }`}
    onClick={() => toggleComparedProduct(selectedProduct.id)}
  >
    {comparedProductIds.includes(selectedProduct.id) ? "비교중" : "비교에 추가"}
  </button>
  <button
    className="flex-1 rounded-xl bg-black px-4 py-3 text-white"
    onClick={async () => {
      await fetch("/api/log-click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          request_id: data?.request_id,
          furniture_id: selectedProduct.id,
        }),
      })
      alert("클릭 로그 저장됨 (구매 링크는 추후 연결)")
    }}
  >
    상품 보기
  </button>
</div>
          </div>
        </div>
      )}
    </main>
  )
}

function InfoCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-2xl border p-4">
      <div className="font-semibold">{title}</div>
      <div className="mt-2 text-sm text-gray-600">{desc}</div>
    </div>
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