import OpenAI from "openai";
import type { Checkin, Moment } from "@/lib/storage";
import { relativeTime } from "@/lib/time";

const systemPrompt = `You are BesideYou, writing a compassionate handover brief from one family caregiver to the next. This will be read by a family member (spouse, sibling, adult child) who is taking over care of a loved one with dementia for the next shift, day, or weekend.

Write in three short sections:

1. WHAT HAPPENED THIS WEEK: 2-3 sentences summarizing the pattern of moments. Focus on themes, not every detail. If the caregiver has been struggling, gently acknowledge that so the next person can offer support.

2. WHAT'S BEEN WORKING: 2-4 short bullet points of specific interventions that have helped, based on the moments described. If there's a recurring successful approach (validation, redirection, particular activities), name it.

3. FOR YOUR SHIFT: 2-3 practical suggestions for the next person. What to watch for, what triggers to avoid, what routines seem to soothe. Practical, not prescriptive.

Tone: warm, familial, honest. Never clinical. Write as if you're a wise older aunt handing over care to a younger family member. If you don't have enough information to make a specific suggestion, say so - don't invent details. Keep the total brief to about 150-250 words. Use the person's own patterns; don't inject generic advice.`;

const themeMatchers = [
  /validation(?: therapy)?/i,
  /redirect(?:ion)?/i,
  /sundowning/i,
  /medication refusal/i,
  /calm(?:ing)? environment/i,
  /agitat(?:ed|ion)/i,
  /reassur(?:e|ance)/i,
  /routine/i,
  /music/i,
];

function oneSentence(text: string) {
  const sentence = text.replace(/\s+/g, " ").match(/^(.{1,220}?[.!?])(?:\s|$)/)?.[1] ?? text.slice(0, 220);
  return sentence.trim();
}

function responseThemes(response: string) {
  const themes = themeMatchers
    .map((matcher) => response.match(matcher)?.[0])
    .filter((theme): theme is string => Boolean(theme));
  return themes.length ? [...new Set(themes)].join(", ") : "No clear recurring intervention recorded";
}

function moodSummary(checkins: Checkin[]) {
  if (!checkins.length) return "No caregiver check-ins were recorded this week.";
  const hard = checkins.filter(({ mood }) => mood === "struggling" || mood === "tired").length;
  if (hard >= 3) return `The caregiver checked in ${checkins.length} times and has been carrying a lot lately (${hard} harder check-ins).`;
  if (hard >= 1) return `The caregiver checked in ${checkins.length} times, with some harder moments alongside steadier ones.`;
  return `The caregiver checked in ${checkins.length} times and has mostly been feeling okay or alright.`;
}

function buildContext(moments: Moment[], checkins: Checkin[], noteCount: number) {
  const formattedMoments = moments.map((moment) => (
    `- [${relativeTime(moment.timestamp)}] "${oneSentence(moment.situation)}"\n  Response themes: ${responseThemes(moment.response)}`
  )).join("\n");

  return `RECENT CARE MOMENTS:\n${formattedMoments}\n\nCAREGIVER WELLBEING:\n${moodSummary(checkins)}\n\nDOCTOR'S NOTES:\nThe caregiver also has ${noteCount} doctor's notes analyzed in the past week.`;
}

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    if (!body || typeof body !== "object") return Response.json({ error: "Handover data is required." }, { status: 400 });

    const { moments, checkins, noteCount } = body as { moments?: Moment[]; checkins?: Checkin[]; noteCount?: number };
    if (!Array.isArray(moments) || !Array.isArray(checkins) || typeof noteCount !== "number") {
      return Response.json({ error: "Invalid handover data." }, { status: 400 });
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
          { role: "user", content: buildContext(moments, checkins, noteCount) },
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
    const responseBody = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (event.type === "response.output_text.delta") controller.enqueue(encoder.encode(event.delta));
          }
          controller.close();
        } catch (error) {
          console.error("OPENAI STREAM ERROR:", error);
          controller.error(error);
        }
      },
    });

    return new Response(responseBody, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
  } catch (error) {
    console.error("HANDOVER ROUTE ERROR:", error);
    return Response.json({ error: "Unable to generate a handover brief." }, { status: 500 });
  }
}
