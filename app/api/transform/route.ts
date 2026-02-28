import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const imageUrl: string | undefined = body.imageUrl;
    const prompt: string | undefined = body.prompt;

    if (!imageUrl || !prompt) {
      return Response.json(
        { error: "imageUrl and prompt are required" },
        { status: 400 }
      );
    }

    const rawOutput = await replicate.run(
      "lucataco/sdxl-controlnet",
      {
        input: {
          image: imageUrl,
          prompt: `professional interior photography, ultra realistic, ${prompt}`,
          negative_prompt:
            "low quality, blurry, distorted, unrealistic proportions",
          controlnet_type: "canny",
          controlnet_conditioning_scale: 0.8,
          strength: 0.75,
          num_inference_steps: 30,
          guidance_scale: 7.5,
        },
      }
    );

    console.log("RAW OUTPUT:", rawOutput);

    // ✅ 타입 안정 처리
    let imageResult: string | null = null;

    if (Array.isArray(rawOutput)) {
      const first = rawOutput[0] as any;

      if (typeof first === "string") {
        imageResult = first;
      } else if (first?.url) {
        imageResult = first.url;
      }
    }

    if (!imageResult) {
      return Response.json(
        { error: "Image generation failed" },
        { status: 500 }
      );
    }

    return Response.json({ output: imageResult });
  } catch (error) {
    console.error("TRANSFORM ERROR:", error);
    return Response.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}