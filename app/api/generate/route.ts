import { generateImage } from "@/lib/stability";
import { uploadTempImage } from "@/lib/cloudinary";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    const base64 = await generateImage(prompt);

    const uploaded = await uploadTempImage(base64);

    return NextResponse.json({ imageUrl: uploaded.secure_url });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Image generation failed" },
      { status: 500 }
    );
    console.log(process.env.STABILITY_API_KEY);
  }
}