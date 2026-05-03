import { Hono } from "hono";
import { z } from "zod";
import OpenAI from "openai";

const analyzeImageRouter = new Hono();

const bodySchema = z.object({ imageDataUrl: z.string() });

analyzeImageRouter.post("/", async (c) => {
  const parsed = bodySchema.safeParse(await c.req.json());
  if (!parsed.success) {
    return c.json({ error: { message: "Invalid request body" } }, 400);
  }

  const { imageDataUrl } = parsed.data;
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that identifies items in photos. Respond with only a short, clear item name (2-5 words max, no punctuation, no explanation). Examples: 'Winter Jacket', 'Board Game', 'Power Drill'",
        },
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: { url: imageDataUrl },
            },
          ],
        },
      ],
      max_tokens: 20,
    });

    const suggestedName = response.choices[0]?.message?.content?.trim() ?? "Unknown Item";
    return c.json({ data: { name: suggestedName } });
  } catch (error) {
    console.error("OpenAI vision error:", error);
    return c.json({ error: { message: "Failed to analyze image" } }, 500);
  }
});

export { analyzeImageRouter };
