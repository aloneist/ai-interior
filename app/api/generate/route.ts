import { generateImage } from "@/lib/stability";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const image = formData.get("image") as File;
    const prompt = formData.get("prompt") as string;

    if (!image || !prompt) {
      return new Response(
        JSON.stringify({ error: "Image or prompt missing" }),
        { status: 400 }
      );
    }

    const result = await generateImage(image, prompt);

    return Response.json({ image: result });
  } catch (error: any) {
    console.error("Route Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500 }
    );
  }
}