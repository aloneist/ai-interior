"use client";

import { useState } from "react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState("");
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!file || !prompt) {
      alert("이미지와 프롬프트를 모두 입력해주세요.");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);
    formData.append("prompt", prompt);

    try {
      setLoading(true);
      setResultImage(null);

      const response = await fetch("/api/generate", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        console.error(data);
        alert("이미지 생성 실패");
        return;
      }

      setResultImage(`data:image/png;base64,${data.image}`);
    } catch (error) {
      console.error(error);
      alert("에러 발생");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ padding: 40 }}>
      <h1>AI 인테리어 이미지 변환 (SDXL 1.0)</h1>

      <div style={{ marginTop: 20 }}>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            if (e.target.files) {
              setFile(e.target.files[0]);
            }
          }}
        />
      </div>

      <div style={{ marginTop: 20 }}>
        <textarea
          placeholder="예: modern minimalist living room, warm lighting"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          style={{ width: 400, height: 100 }}
        />
      </div>

      <div style={{ marginTop: 20 }}>
        <button onClick={handleSubmit} disabled={loading}>
          {loading ? "생성 중..." : "이미지 변환"}
        </button>
      </div>

      {resultImage && (
        <div style={{ marginTop: 40 }}>
          <h2>결과</h2>
          <img
            src={resultImage}
            alt="Generated"
            style={{ maxWidth: "500px", border: "1px solid #ccc" }}
          />
        </div>
      )}
    </main>
  );
}