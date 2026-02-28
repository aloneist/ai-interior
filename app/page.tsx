"use client";

import { useState } from "react";

export default function Home() {
  const [image, setImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [resultImage, setResultImage] = useState<string | null>(null);

  const handleUpload = async () => {
    if (!image) return;

    setLoading(true);

    const formData = new FormData();
    formData.append("file", image);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setImageUrl(data.secure_url);
    setImage(null);

    setLoading(false);
  };

  const handleTransform = async () => {
  if (!imageUrl) return;

  const res = await fetch("/api/transform", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt,
    }),
  });

  const data = await res.json();
  setResultImage(data.output[0]);
};


  return (
    <main className="p-10">
      <h1 className="text-2xl mb-4">AI Interior Upload Test</h1>

      <input
        type="file"
        onChange={(e) => setImage(e.target.files?.[0] || null)}
        
      />

      {imageUrl && (
        <img
          src={imageUrl}
          alt="uploaded"
          className="mt-4 rounded-lg w-80"
        />
      )}

      <button
        onClick={handleUpload}
        disabled={loading}
        className="mt-4 bg-black text-white px-4 py-2"
      >
        {loading ? "Uploading..." : "Upload"}
      </button>

      <input
        type="text"
        placeholder="예: modern minimalist interior"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        className="border p-2 mt-4 w-full"
      />

      <button
        onClick={handleTransform}
        className="mt-4 bg-blue-600 text-white px-4 py-2"
      >
        Transform
      </button>

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