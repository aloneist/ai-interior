"use client";

import { useState } from "react";

export default function Home() {
  const [image, setImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ 1️⃣ 이미지 업로드
  const handleUpload = async () => {
    if (!image) {
      alert("이미지를 선택하세요.");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("file", image);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    console.log("UPLOAD RESPONSE:", data);

    setImageUrl(data.secure_url);
    setImage(null);
    setLoading(false);
  };

  // ✅ 2️⃣ 이미지 변환 (img2img)
  const handleTransform = async () => {
    if (!imageUrl) {
      alert("먼저 이미지를 업로드하세요.");
      return;
    }

    if (!prompt) {
      alert("프롬프트를 입력하세요.");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        imageUrl,
        prompt,
      }),
    });

    const data = await res.json();

    if (!data.output) {
      alert("이미지 생성 실패");
      setLoading(false);
      return;
    }

   setResultImage(data.output);
  };

  return (
    <main className="p-10">
      <h1 className="text-2xl mb-4">AI Interior Upload Test</h1>

      {/* 이미지 선택 */}
      <input
        type="file"
        onChange={(e) => setImage(e.target.files?.[0] || null)}
      />

      {/* 업로드 버튼 */}
      <button
        onClick={handleUpload}
        disabled={loading}
        className="mt-4 bg-black text-white px-4 py-2"
      >
        {loading ? "Uploading..." : "Upload"}
      </button>

      {/* 업로드된 이미지 표시 */}
      {imageUrl && (
        <img
          src={imageUrl}
          alt="uploaded"
          className="mt-4 rounded-lg w-80"
        />
      )}

      {/* 프롬프트 */}
      <input
        type="text"
        placeholder="예: modern minimalist interior"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        className="border p-2 mt-4 w-full"
      />

      {/* 변환 버튼 */}
      <button
        onClick={handleTransform}
        disabled={loading}
        className="mt-4 bg-blue-600 text-white px-4 py-2"
      >
        {loading ? "Transforming..." : "Transform"}
      </button>

      {/* 결과 이미지 */}
      {resultImage && (
        <img
          src={resultImage}
          alt="transformed"
          className="mt-6 rounded-lg"
        />
      )}
    </main>
  );
}