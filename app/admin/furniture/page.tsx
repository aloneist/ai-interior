"use client"

import { useState } from "react"

type AnalyzeResult = {
  success?: boolean
  analysis?: Record<string, any>
  error?: string
  message?: string
}

export default function AdminFurniture() {
  const [adminToken, setAdminToken] = useState("")
  const [name, setName] = useState("")
  const [brand, setBrand] = useState("")
  const [category, setCategory] = useState<"sofa" | "bed" | "chair" | "table" | "storage" | "decor">("sofa")
  const [price, setPrice] = useState<number>(0)
  const [imageUrl, setImageUrl] = useState("")

  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AnalyzeResult | null>(null)

  const submit = async () => {
    setResult(null)

    if (!name.trim() || !category || !imageUrl.trim()) {
      setResult({ error: "name/category/imageUrl은 필수입니다." })
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/analyze-furniture", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-admin-token": adminToken,
        },
        body: JSON.stringify({
          name: name.trim(),
          brand: brand.trim() || null,
          category,
          price: price || null,
          imageUrl: imageUrl.trim(),
        }),
      })

      const data = (await res.json()) as AnalyzeResult
      if (!res.ok || data.success === false || data.error) {
        setResult({ error: data.message || data.error || "분석 실패" })
        setLoading(false)
        return
      }

      setResult(data)
    } catch (e: any) {
      setResult({ error: e?.message || "요청 실패" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold">관리자 · 가구 등록</h1>
      <p className="text-sm text-gray-600 mt-1">
        입력 → 분석(API) → Supabase 저장(업서트)
      </p>

      <div className="mt-6 space-y-3">
        <div>
          <label className="text-sm text-gray-600">상품명 (필수)</label>
          <input
            className="border rounded px-3 py-2 w-full"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="예: 화이트 미니멀 소파"
          />
        </div>

        <div>
          <label className="text-sm text-gray-600">브랜드</label>
          <input
            className="border rounded px-3 py-2 w-full"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            placeholder="예: SoftLine"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm text-gray-600">카테고리 (필수)</label>
            <select
              className="border rounded px-3 py-2 w-full"
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
            >
              <option value="sofa">sofa</option>
              <option value="bed">bed</option>
              <option value="chair">chair</option>
              <option value="table">table</option>
              <option value="storage">storage</option>
              <option value="decor">decor</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-600">가격(원)</label>
            <input
              className="border rounded px-3 py-2 w-full"
              type="number"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              placeholder="예: 890000"
            />
          </div>
        </div>

        <div>
          <label className="text-sm text-gray-600">관리자 토큰</label>
          <input
            className="border rounded px-3 py-2 w-full"
            value={adminToken}
            onChange={(e) => setAdminToken(e.target.value)}
            placeholder="관리자 토큰 입력"
          />
        </div>

        <div>
          <label className="text-sm text-gray-600">이미지 URL (필수, 공개 접근 가능 URL)</label>
          <input
            className="border rounded px-3 py-2 w-full"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://..."
          />
          <p className="text-xs text-gray-500 mt-1">
            OpenAI가 접근 가능한 공개 URL만 됩니다(로그인 필요/내부링크 불가).
          </p>
        </div>

        <button
          onClick={submit}
          disabled={loading}
          className="w-full mt-2 bg-black text-white rounded py-2"
        >
          {loading ? "분석 및 저장 중..." : "분석 + DB 저장"}
        </button>
      </div>

      {/* 결과 */}
      {result && (
        <div className="mt-6 border rounded p-4">
          {result.error ? (
            <div className="text-red-700">{result.error}</div>
          ) : (
            <>
              <div className="font-semibold">분석 결과(저장 완료)</div>
              <pre className="mt-2 text-xs bg-gray-50 border rounded p-3 overflow-auto">
{JSON.stringify(result.analysis, null, 2)}
              </pre>
            </>
          )}
        </div>
      )}
    </main>
  )
}