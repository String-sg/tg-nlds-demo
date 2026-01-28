import { OpenAI } from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { query } = await req.json();

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an educational assistant for teachers. Prioritise returning a short summary of how to solve the issue provided. Focus on immediate practical steps or solutions. Keep it under 60 words.",
        },
        {
          role: "user",
          content: `Define and explain: ${query}`,
        },
      ],
      max_tokens: 100,
    });

    const summary = completion.choices[0].message.content || "No summary available.";

    return NextResponse.json({ summary });
  } catch (error) {
    console.error("OpenAI API Error:", error);
    return NextResponse.json(
      { error: "Failed to generate summary" },
      { status: 500 }
    );
  }
}
