import OpenAI from "openai";

const systemPrompt = `You are BesideYou, helping a family caregiver understand a medical document about their loved one with dementia. The caregiver may be exhausted and not medically trained. Respond in three sections:

1. WHAT THIS IS: One sentence identifying the document (discharge summary, prescription, lab result, clinic note, etc.)

2. WHAT IT SAYS IN PLAIN LANGUAGE: 3-6 short bullet points translating the medical content into what a caregiver actually needs to know. No jargon. If a medication is mentioned, explain what it's for and how to give it. If there are dosages or schedules, be explicit. If there are warning signs listed, highlight them.

3. QUESTIONS TO ASK THE DOCTOR: 3-5 specific questions the caregiver should ask at the next appointment based on what's in this document.

Never diagnose. Never replace a doctor. If the document is unclear, blurry, or you cannot read part of it, say so clearly. If you cannot identify the document type, say 'I cannot read this clearly enough to explain it — please try a clearer photo.'`;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const image = formData.get("image");

    if (!(image instanceof File) || !image.type.startsWith("image/")) {
      return Response.json({ error: "An image file is required." }, { status: 400 });
    }

    const bytes = Buffer.from(await image.arrayBuffer());
    const imageDataUrl = `data:${image.type};base64,${bytes.toString("base64")}`;
    const model = "gpt-5.6-sol";
    let stream;

    try {
      console.info("OPENAI MODEL ATTEMPT:", model);
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      stream = await openai.responses.create({
        model,
        input: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              { type: "input_text", text: "Please explain this medical document." },
              { type: "input_image", image_url: imageDataUrl, detail: "high" },
            ],
          },
        ],
        stream: true,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("OPENAI ERROR:", message);
      console.error(err);
      return Response.json({ error: message }, { status: 500 });
    }

    const encoder = new TextEncoder();
    const body = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (event.type === "response.output_text.delta") {
              controller.enqueue(encoder.encode(event.delta));
            }
          }
          controller.close();
        } catch (error) {
          console.error("OPENAI STREAM ERROR:", error);
          controller.error(error);
        }
      },
    });

    return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
  } catch (error) {
    console.error("NOTES ROUTE ERROR:", error);
    return Response.json({ error: "Unable to explain this note." }, { status: 500 });
  }
}
