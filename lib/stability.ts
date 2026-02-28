export async function generateImage(prompt: string) {
  const response = await fetch(
    "https://api.stability.ai/v2beta/stable-image/generate/sd3",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.STABILITY_SDXL10}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "stable-diffusion-xl-1024-v1-0",
        prompt,
        output_format: "png",
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Stability Error:", errorText);
    throw new Error("Stability API error");
  }

  const data = await response.json();

  return data.image; // base64 문자열
}