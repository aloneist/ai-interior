export async function generateImage(
  image: File,
  prompt: string
) {
  const formData = new FormData();

  formData.append("init_image", image);
  formData.append("text_prompts[0][text]", prompt);
  formData.append("cfg_scale", "7");
  formData.append("image_strength", "0.7");
  formData.append("samples", "1");
  formData.append("steps", "30");

  const response = await fetch(
    "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/image-to-image",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.STABILITY_API_KEY!}`,
        Accept: "application/json",
      },
      body: formData,
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Stability Error:", errorText);
    throw new Error(errorText);
  }

  const data = await response.json();

  return data.artifacts[0].base64;
}