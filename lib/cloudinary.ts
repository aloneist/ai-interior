import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadTempImage(base64: string) {
  const result = await cloudinary.uploader.upload(
    `data:image/png;base64,${base64}`,
    {
      folder: "ai-interior/temp",
      expire_at: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 24시간 후 자동 삭제
    }
  );

  return result;
}