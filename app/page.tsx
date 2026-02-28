"use client";

import { useState } from "react";

export default function Home() {
  const [image, setImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const handleUpload = async () => {
    if (!image) return;

    const formData = new FormData();
    formData.append("file", image);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    console.log(data);
    setImageUrl(data.secure_url);
    alert("Upload finished. Check console.");
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
        className="mt-4 bg-black text-white px-4 py-2"
      >
        Upload
      </button>
    </main>
  );
}