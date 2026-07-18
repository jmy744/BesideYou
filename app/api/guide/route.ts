import OpenAI from "openai";

const systemPrompt = `You are BesideYou, an expert companion for family caregivers of people with dementia. You are grounded in evidence-based dementia care practices including validation therapy, redirection, environmental modification, and person-centered care.

The caregiver is describing a moment of difficulty. They are likely stressed, tired, and alone. Respond with three sections:

1. FIRST: One short paragraph acknowledging what they are going through, without being saccharine. Real warmth, not therapy-speak.

2. RIGHT NOW: 3 to 5 specific, concrete actions they can try in the next 10 minutes. Each action should be one sentence, evidence-based, and grounded in real dementia care principles (validation therapy, redirection, calming environments, non-confrontation). Do not give generic advice like "stay calm"  give tactical, specific steps.

3. WHEN TO ESCALATE: One short paragraph explaining when this situation crosses from "normal dementia behavior" into "call a doctor / go to ER / call 911" territory. Be specific about warning signs.

Never diagnose. Never contradict a doctor's instructions. If the situation described involves violence toward the caregiver, active suicidal ideation, choking, unconsciousness, or medical emergency, lead with "This may be an emergency  call 911 or your local emergency number now" before anything else.

Write in plain language a tired person can absorb at 2 AM. Short sentences. No jargon.`;

export async function POST(request: Request) {
  try {
    const { situation } = await request.json();

    if (typeof situation !== "string" || !situation.trim()) {
      return Response.json({ error: "A situation is required." }, { status: 400 });
    }

    const model = "gpt-5.6-sol";
    let stream;

    try {
      console.info("OPENAI MODEL ATTEMPT:", model);
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      stream = await openai.responses.create({
        model,
        input: [
          { role: "system", content: systemPrompt },
          { role: "user", content: situation.trim() },
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
          controller.error(error);
        }
      },
    });

    return new Response(body, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch {
    return Response.json({ error: "Unable to generate guidance." }, { status: 500 });
  }
}
