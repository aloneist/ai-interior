"use client"

import { useState } from "react"

type MVPResponse = {
  success: boolean
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
  error?: string
  message?: string
}

export default function Home() {
  const [imageUrl, setImageUrl] = useState(
    "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85"
  )
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<MVPResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const runMVP = async () => {
    setLoading(true)
    setError(null)
    setData(null)

    try {
      const res = await fetch("/api/mvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl }),
      })

      const json = (await res.json()) as MVPResponse

      if (!res.ok || !json.success) {
        setError(json.message || json.error || "요청 실패")
        setLoading(false)
        return
      }

      setData(json)
    } catch (e: any) {
      setError(e?.message || "에러 발생")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold">AI 인테리어 분석 + 추천 MVP</h1>
      <p className="text-sm text-gray-600 mt-1">
        이미지 URL → 공간 분석 점수 + 신뢰도 + 추천 3개
      </p>

      <div className="mt-6 flex gap-2">
        <input
          className="border rounded px-3 py-2 w-full"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="공개 이미지 URL을 입력하세요"
        />
        <button
          onClick={runMVP}
          disabled={loading}
          className="px-4 py-2 rounded bg-black text-white"
        >
          {loading ? "분석 중..." : "분석"}
        </button>
      </div>

      {error && (
        <div className="mt-4 p-3 border rounded bg-red-50 text-red-700">
          {error}
        </div>
      )}

      {data && (
        <>
          {/* 원본 이미지 */}
          <div className="mt-6">
            <h2 className="font-semibold">입력 이미지</h2>
            <img
              src={data.analysis.image_url}
              alt="room"
              className="mt-2 rounded border max-h-[360px] object-contain"
            />
          </div>

          {/* 분석 결과 */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded">
              <h2 className="font-semibold">공간 분석 점수</h2>
              <div className="mt-3 space-y-2 text-sm">
                <Row label="밝기" value={data.analysis.brightness_score} />
                <Row label="색온도(웜↔쿨)" value={data.analysis.color_temperature_score} />
                <Row label="공간 밀도(어수선함)" value={data.analysis.spatial_density_score} />
                <Row label="미니멀 지수" value={data.analysis.minimalism_score} />
                <Row label="대비" value={data.analysis.contrast_score} />
                <Row label="컬러감" value={data.analysis.colorfulness_score} />
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">대표 톤</span>
                  <span className="flex items-center gap-2">
                    <span className="text-gray-800">{data.analysis.dominant_color_hex}</span>
                    <span
                      className="w-5 h-5 rounded border"
                      style={{ background: data.analysis.dominant_color_hex }}
                    />
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 border rounded">
              <h2 className="font-semibold">신뢰도</h2>
              <div className="mt-3">
                <div className="text-3xl font-bold">{data.trust_score}</div>
                <div className="text-sm text-gray-600 mt-1">
                  {data.trust_note ?? "분석 신뢰도 양호"}
                </div>
              </div>
            </div>
          </div>

          {/* 추천 3개 */}
          <div className="mt-6">
            <h2 className="font-semibold">추천 3개</h2>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4">
              {data.recommendations.map((r) => (
                <div key={r.id} className="border rounded p-3">
                  {r.image_url ? (
                    <img
                      src={r.image_url}
                      alt={r.name}
                      className="rounded border h-40 w-full object-cover"
                    />
                  ) : (
                    <div className="h-40 w-full rounded border bg-gray-100 flex items-center justify-center text-gray-500">
                      이미지 없음
                    </div>
                  )}

                  <div className="mt-2 font-semibold">{r.name}</div>
                  <div className="text-xs text-gray-600">
                    {r.brand ?? "브랜드 미상"} · {r.category ?? "카테고리"}
                  </div>

                  <div className="mt-2 text-sm">
                    <span className="font-semibold">점수</span>{" "}
                    <span>{r.recommendation_score}</span>
                  </div>

                  <div className="text-sm">
                    <span className="font-semibold">가격</span>{" "}
                    <span>{r.price ? `${r.price.toLocaleString()}원` : "-"}</span>
                  </div>

                  <div className="mt-2 text-sm text-gray-700">
                    {r.reason_short}
                  </div>

                  <button
                    className="mt-3 w-full border rounded py-2 text-sm"
                    onClick={async () => {
                      // ✅ 클릭 로그 기록 (1줄 핵심 + 요청)
                      await fetch("/api/log-click", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          request_id: (data as any).request_id,
                          furniture_id: r.id,
                        }),
                      })

                      alert("클릭 로그 저장됨 (구매 링크는 추후 연결)")
                    }}
                  >
                    구매 링크 (추후)
                  </button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
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