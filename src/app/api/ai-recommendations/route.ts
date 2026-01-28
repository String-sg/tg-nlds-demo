import { OpenAI } from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});


export async function POST(req: Request) {
  const ASSISTANT_ID = process.env.OPENAI_RECOMMENDATION_ASSISTANT_ID as string;

  try {
    const { query } = await req.json();

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    console.log(`DEBUG: Starting search for "${query}"...`);

    // 1. Create Thread AND Run (Combined step for speed)
    // We use "createAndPoll" which handles the loop/timeout automatically
    const run = await openai.beta.threads.createAndRunPoll({
      assistant_id: ASSISTANT_ID,
      thread: {
        messages: [
          { 
            role: "user", 
            // CRITICAL: We explicitly ask for the 'recommendations' key to match your parsing logic
            content: `User Query: "${query}". 
                      Search the attached file for relevant courses.
                      Return a JSON object with a key "recommendations" containing the array of courses.` 
          }
        ]
      },
      tool_choice: { type: "file_search" }, // <--- FORCES AI TO READ THE CSV
      response_format: { type: "json_object" }
    });

    console.log(`DEBUG: Run Finished. Status: ${run.status}`);

    if (run.status !== "completed") {
      // If it failed, print why (usually file access issues)
      console.error("Run failed:", run.last_error);
      return NextResponse.json({ error: "AI failed to process request" }, { status: 500 });
    }

    // 2. Retrieve the messages
    const messages = await openai.beta.threads.messages.list(run.thread_id);
    
    // Get the last message from the AI
    const lastMessage = messages.data[0]; // .list() returns newest first by default

    console.log({lastMessage})
    if (lastMessage && lastMessage.content[0] && lastMessage.content[0].type === 'text') {
      let textContent = lastMessage.content[0].text.value; 
      console.log({textContent})
      textContent = textContent.replace(/```json/g, "").replace(/```/g, "").trim();
      console.log({newContent: textContent})
       
       try {
           const parsedData = JSON.parse(textContent);
           console.log("DEBUG: Parsed Keys:", Object.keys(parsedData));

           // robust parsing strategy
           if (parsedData.recommendations && Array.isArray(parsedData.recommendations)) {
               return NextResponse.json({ recommendations: parsedData.recommendations });
           } 
           else if (parsedData.courses && Array.isArray(parsedData.courses)) {
               // Handle case where AI used 'courses' key from system instructions
               return NextResponse.json({ recommendations: parsedData.courses });
           }
           else if (Array.isArray(parsedData)) {
               return NextResponse.json({ recommendations: parsedData });
           }

           // Fallback: If AI wrapped it in some random key like { "result": [...] }
           const fallbackArray = Object.values(parsedData).find(val => Array.isArray(val));
           if (fallbackArray) {
               return NextResponse.json({ recommendations: fallbackArray });
           }

           console.warn("DEBUG: No array found in JSON:", textContent);
           return NextResponse.json({ recommendations: [] });

       } catch (e) {
           console.error("JSON Parse Error. Raw text was:", textContent);
           return NextResponse.json({ recommendations: [] });
       }
    }

    return NextResponse.json({ recommendations: [] });

  } catch (error) {
    console.error("OpenAI API Critical Failure:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}