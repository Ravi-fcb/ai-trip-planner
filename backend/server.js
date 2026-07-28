const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const Groq = require("groq-sdk");
const { z } = require("zod");

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:3000"],
  credentials: true
}));
app.use(express.json());

// Initialize Groq API
const groqApiKey = process.env.GROQ_API_KEY;
let groq;
if (groqApiKey) {
  groq = new Groq({ apiKey: groqApiKey });
}

// Define validation schemas using Zod
const StopSchema = z.object({
  name: z.string().min(1, "Stop name is required"),
  time: z.string().min(1, "Stop time is required"),
  type: z.enum(["activity", "food", "transport", "lodging"]).default("activity"),
  notes: z.string().optional().default("No notes provided.")
});

const DaySchema = z.object({
  day: z.number().int().positive(),
  title: z.string().min(1, "Day title is required"),
  stops: z.array(StopSchema).min(1, "Each day must have at least one stop")
});

const ItinerarySchema = z.object({
  destination: z.string().min(1, "Destination is required"),
  durationDays: z.number().int().positive(),
  days: z.array(DaySchema).min(1, "Itinerary must contain at least one day")
});

// JSON extraction utility
function extractJsonString(rawText) {
  let cleaned = rawText.trim();
  
  // Remove markdown block if outputted
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```json\s*/i, "").replace(/^```\s*/, "").replace(/\s*```$/, "");
  }
  
  // Try to find first '{' and last '}' to strip any external text
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }
  
  return cleaned;
}

// Helper to call Groq API and parse response
async function fetchGroqItinerary(systemPrompt, userPrompt) {
  if (!groq) {
    throw new Error("GROQ_API_KEY is not configured on the server. Please add it to your backend/.env file.");
  }

  const completion = await groq.chat.completions.create({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ],
    model: "llama-3.3-70b-versatile",
    response_format: { type: "json_object" }, // Force JSON output mode
    temperature: 0.7
  });

  const rawText = completion.choices[0]?.message?.content;
  if (!rawText) {
    throw new Error("Received empty response from Groq API.");
  }

  let parsedJson;
  try {
    const cleanJsonText = extractJsonString(rawText);
    parsedJson = JSON.parse(cleanJsonText);
  } catch (parseErr) {
    console.error("Raw response that failed parsing:\n", rawText);
    throw new Error("Failed to parse AI output as JSON: " + parseErr.message);
  }

  // Validate JSON schema with Zod
  const validationResult = ItinerarySchema.safeParse(parsedJson);
  if (!validationResult.success) {
    console.error("Zod Validation errors:\n", validationResult.error.format());
    throw new Error("AI output did not match the expected itinerary structure.");
  }

  return validationResult.data;
}

// Route 1: POST /api/plan-trip (Initial Generation)
app.post("/api/plan-trip", async (req, res) => {
  const { description } = req.body;

  if (!description || typeof description !== "string" || description.trim() === "") {
    return res.status(400).json({ 
      success: false, 
      error: "Please enter a valid trip description." 
    });
  }

  console.log(`[Groq] Planning trip: "${description.substring(0, 60)}..."`);

  const systemInstruction = 
    `You are an expert travel planner. Create a highly detailed and cohesive travel itinerary based on the user's request.
    
    You must output a single JSON object matching this schema:
    {
      "destination": string,
      "durationDays": number,
      "days": [
        {
          "day": number,
          "title": string,
          "stops": [
            {
              "name": string,
              "time": string,
              "type": "activity" | "food" | "transport" | "lodging",
              "notes": string
            }
          ]
        }
      ]
    }
    
    Ensure:
    1. Realistic times (e.g. 09:00 AM, Lunch, 04:00 PM).
    2. Logical sequence of activities.
    3. Categorize each stop accurately into: 'activity' (sightseeing), 'food' (dining), 'transport' (transit), or 'lodging' (hotel).
    4. Respond with ONLY valid raw JSON. No markdown code blocks, no prose outside JSON.`;

  const userPrompt = `Create a trip itinerary for: "${description}"`;

  let attempts = 0;
  const maxAttempts = 2;

  while (attempts < maxAttempts) {
    attempts++;
    try {
      const itinerary = await fetchGroqItinerary(systemInstruction, userPrompt);
      return res.json({ success: true, data: itinerary });
    } catch (err) {
      console.warn(`[Groq Plan] Attempt ${attempts} failed: ${err.message}`);
      if (attempts >= maxAttempts) {
        return res.status(502).json({
          success: false,
          error: err.message || "Failed to generate itinerary. Please try again."
        });
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
});

// Route 2: POST /api/refine-trip (Follow-up Refinement Loop)
app.post("/api/refine-trip", async (req, res) => {
  const { currentItinerary, prompt } = req.body;

  if (!currentItinerary || !prompt || typeof prompt !== "string" || prompt.trim() === "") {
    return res.status(400).json({ 
      success: false, 
      error: "Missing currentItinerary or valid refinement instruction." 
    });
  }

  console.log(`[Groq] Refining itinerary based on: "${prompt.substring(0, 60)}..."`);

  const systemInstruction = 
    `You are an expert travel planner. You will edit an existing travel itinerary JSON based on the user's refinement instructions.
    
    You must return the FULL updated itinerary JSON matching the original schema.
    Ensure:
    1. Apply the user's modifications carefully (e.g. adding stops, removing stops, changing times, making it budget-friendly, or editing descriptions).
    2. Maintain all required fields for every day and stop: day, title, stops, name, time, type ("activity" | "food" | "transport" | "lodging"), notes.
    3. Keep unchanged days and stops mostly the same, only altering what is requested.
    4. Respond with ONLY valid raw JSON. No markdown, no commentary, no prose.`;

  const userPrompt = `Current Itinerary JSON:
${JSON.stringify(currentItinerary, null, 2)}

User Refinement Request:
"${prompt}"`;

  let attempts = 0;
  const maxAttempts = 2;

  while (attempts < maxAttempts) {
    attempts++;
    try {
      const updatedItinerary = await fetchGroqItinerary(systemInstruction, userPrompt);
      return res.json({ success: true, data: updatedItinerary });
    } catch (err) {
      console.warn(`[Groq Refine] Attempt ${attempts} failed: ${err.message}`);
      if (attempts >= maxAttempts) {
        return res.status(502).json({
          success: false,
          error: err.message || "Failed to refine the itinerary. Please try again."
        });
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
});

// Simple healthcheck
app.get("/health", (req, res) => {
  res.json({ status: "healthy", keyConfigured: !!groqApiKey });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
  console.log(`Groq API Key configured: ${groqApiKey ? "YES" : "NO (Please configure GROQ_API_KEY in .env)"}`);
  if (groq) {
    console.log(`Groq Client initialized successfully.`);
  }
});
