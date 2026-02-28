import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

export async function POST(req: Request) {
  const { imageUrl, prompt } = await req.json();

  try {
    const output = await replicate.run(
      "stability-ai/sdxl:7762fd07cf82c948538e41f63f77d685e02b063e37e496e96eefd46c929f9bdc",
      {
        input: {
          prompt: prompt,
          image: imageUrl,
          strength: 0.7,
          num_inference_steps: 30,
          guidance_scale: 7.5,
        },
      }
    );

    console.log("REPLICATE OUTPUT:", output);

    return Response.json({ output });
  } catch (error) {
    console.error("TRANSFORM ERROR:", error);
    return Response.json(
      { error: "Failed to transform image" },
      { status: 500 }
    );
  }
}