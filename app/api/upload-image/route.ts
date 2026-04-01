import { NextResponse } from "next/server"
import { v2 as cloudinary } from "cloudinary"

export const runtime = "nodejs"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
})

function uploadBufferToCloudinary(buffer: Buffer, folder: string) {
  return new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
      },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error("Cloudinary upload failed"))
          return
        }

        resolve({
          secure_url: result.secure_url,
          public_id: result.public_id,
        })
      }
    )

    stream.end(buffer)
  })
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get("file")

    if (!(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: "image file is required" },
        { status: 400 }
      )
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { success: false, error: "only image files are allowed" },
        { status: 400 }
      )
    }

    const maxBytes = 10 * 1024 * 1024
    if (file.size > maxBytes) {
      return NextResponse.json(
        { success: false, error: "image must be 10MB or smaller" },
        { status: 400 }
      )
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const uploaded = await uploadBufferToCloudinary(
      buffer,
      "ai-interior/mvp-uploads"
    )

    return NextResponse.json({
      success: true,
      imageUrl: uploaded.secure_url,
      publicId: uploaded.public_id,
    })
  } catch (err: unknown) {
    console.error("UPLOAD IMAGE ERROR:", err)

    const message = err instanceof Error ? err.message : "unknown upload error"

    return NextResponse.json(
      {
        success: false,
        error: "upload failed",
        message,
      },
      { status: 500 }
    )
  }
}
