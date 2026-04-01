"use client"

import { useState } from "react"

type AnalyzeFurnitureResponse = {
  message?: string
  error?: string
}

type RowResult = {
  line: number
  raw: string
  ok: boolean
  message: string
}

export default function AdminFurnitureBulk() {
  const [adminToken, setAdminToken] = useState("")
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<RowResult[]>([])

  const parseLine = (line: string) => {
    const parts = line.split("|").map((x) => x.trim())
    if (parts.length !== 5) return null

    const [name, brand, category, price, imageUrl] = parts

    return {
      name,
      brand: brand || null,
      category,
      price: price ? Number(price) : null,
      imageUrl,
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    setResults([])

    const lines = input
      .split("\n")
      .map((x) => x.trim())
      .filter(Boolean)

    const out: RowResult[] = []

    for (let i = 0; i < lines.length; i++) {
      const raw = lines[i]
      const parsed = parseLine(raw)

      if (!parsed) {
        out.push({
          line: i + 1,
          raw,
          ok: false,
          message: "형식 오류 (name | brand | category | price | imageUrl)",
        })
        continue
      }

      try {
        const res = await fetch("/api/analyze-furniture", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-admin-token": adminToken,
          },
          body: JSON.stringify(parsed),
        })

        const data = (await res.json()) as AnalyzeFurnitureResponse

        if (!res.ok) {
          out.push({
            line: i + 1,
            raw,
            ok: false,
            message: data.message || data.error || "저장 실패",
          })
        } else {
          out.push({
            line: i + 1,
            raw,
            ok: true,
            message: "분석 + 저장 완료",
          })
        }
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "요청 실패"
        out.push({
          line: i + 1,
          raw,
          ok: false,
          message,
        })
      }

      setResults([...out])
    }

    setLoading(false)
  }

  return (
    <main className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold">관리자 · 가구 대량 등록</h1>
      <p className="text-sm text-gray-600 mt-1">
        한 줄 형식: name | brand | category | price | imageUrl
      </p>

      <div className="mt-6 space-y-4">
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
          <label className="text-sm text-gray-600">가구 리스트</label>
          <textarea
            className="border rounded px-3 py-2 w-full h-72 font-mono text-sm"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`화이트 미니멀 소파 | SoftLine | sofa | 890000 | https://example.com/sofa1.jpg
그레이 패브릭 소파 | UrbanNest | sofa | 990000 | https://example.com/sofa2.jpg`}
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-black text-white rounded px-4 py-2"
        >
          {loading ? "처리 중..." : "일괄 분석 + 저장"}
        </button>
      </div>

      {results.length > 0 && (
        <div className="mt-8">
          <h2 className="font-semibold mb-3">처리 결과</h2>
          <div className="space-y-2">
            {results.map((r, idx) => (
              <div
                key={idx}
                className={`border rounded p-3 text-sm ${
                  r.ok ? "bg-green-50" : "bg-red-50"
                }`}
              >
                <div className="font-medium">
                  {r.ok ? "성공" : "실패"} · {r.line}번째 줄
                </div>
                <div className="text-gray-700 break-all">{r.raw}</div>
                <div className="mt-1">{r.message}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  )
}
