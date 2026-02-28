import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

export async function POST(req: Request) {
  const { imageUrl, prompt } = await req.json();

  try {
    const output = await replicate.run(
      "stability-ai/sdxl:latest",
      {
        input: {
          image: imageUrl,
          prompt: prompt,
          strength: 0.7,
        },
      }
    );

    return Response.json({ output });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to transform image" }, { status: 500 });
  }
}