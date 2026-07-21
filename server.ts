import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";
import { createRequire } from "module";

// Load environment variables
dotenv.config();

// Safely create a require function that works in both ESM (dev) and CJS (prod)
const requireFn = typeof require !== "undefined"
  ? require
  : createRequire(import.meta.url);

const pdfModule = requireFn("pdf-parse");

const extractTextFromPdf = async (buffer: Buffer) => {
  const pdfFunc = typeof pdfModule === "function" ? pdfModule : (pdfModule.default && typeof pdfModule.default === "function" ? pdfModule.default : null);
  if (pdfFunc) {
    const data = await pdfFunc(buffer);
    return {
      text: data.text || "",
      numpages: data.numpages || 1
    };
  } else if (pdfModule.PDFParse) {
    const parser = new pdfModule.PDFParse({ data: buffer });
    const data = await parser.getText();
    return {
      text: data.text || "",
      numpages: data.total || (data.pages ? data.pages.length : 1)
    };
  } else {
    throw new Error("No PDF parsing function or class found in pdf-parse module.");
  }
};

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json({ limit: "50mb" })); // Support larger text and PDF inputs
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Lazy Gemini client helper to prevent crash on startup if key is missing
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not defined. Please set it in the Secrets panel or .env file.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Helper to handle transient model errors and fallback gracefully
async function callGeminiWithRetry(
  fn: (modelName: string) => Promise<any>,
  initialModel = "gemini-3.5-flash",
  fallbackModel = "gemini-3.1-flash-lite"
): Promise<any> {
  const maxRetries = 2;
  let delay = 1000;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn(initialModel);
    } catch (error: any) {
      console.warn(`Gemini attempt ${attempt} with ${initialModel} failed:`, error.message || error);
      
      const isTransient = error.status === "UNAVAILABLE" || 
                          error.status === 503 || 
                          (error.message && (
                            error.message.includes("503") || 
                            error.message.includes("high demand") || 
                            error.message.includes("UNAVAILABLE") ||
                            error.message.includes("service is currently unavailable")
                          ));
                          
      if (isTransient && attempt < maxRetries) {
        console.log(`Retrying after ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2;
        continue;
      }
      
      // Try fallback model if one is specified and is different
      if (fallbackModel && initialModel !== fallbackModel) {
        console.warn(`Falling back to ${fallbackModel} due to error on ${initialModel}`);
        try {
          return await fn(fallbackModel);
        } catch (fallbackError: any) {
          console.error(`Fallback model ${fallbackModel} also failed:`, fallbackError.message || fallbackError);
          throw fallbackError;
        }
      }
      
      throw error;
    }
  }
}

// API Routes

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", apiKeyConfigured: !!process.env.GEMINI_API_KEY });
});

// Extract text from PDF file
app.post("/api/extract-pdf", async (req, res) => {
  try {
    const { file } = req.body;
    if (!file || typeof file !== "string") {
      return res.status(400).json({ error: "Missing or invalid base64 file data." });
    }

    // Strip prefix if any (e.g. data:application/pdf;base64,)
    const base64Data = file.replace(/^data:application\/pdf;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    const data = await extractTextFromPdf(buffer);

    res.json({
      text: data.text || "",
      numpages: data.numpages || 1
    });
  } catch (error: any) {
    console.error("Error extracting PDF:", error);
    res.status(500).json({
      error: "Failed to extract text from the PDF file.",
      details: error.message || String(error)
    });
  }
});

// Helper to optimize large scientific texts for fast processing
function optimizeTextForSummarization(text: string): string {
  const maxLength = 45000; // ~10,000 - 12,000 words. Excellent balance of high accuracy and extremely fast response times
  if (text.length <= maxLength) {
    return text;
  }
  
  console.log(`[Performance Optimization] Truncating large text from ${text.length} to ${maxLength} chars for faster insight extraction.`);
  
  // Extract key sections:
  // - First 25,000 characters (typically contains Title, Abstract, Intro, Objectives, early Methods)
  // - Last 20,000 characters (typically contains Results details, Discussion, Conclusions, and Future Work)
  const startLength = 25000;
  const endLength = 20000;
  
  const startText = text.substring(0, startLength);
  const endText = text.substring(text.length - endLength);
  
  return `${startText}\n\n[... TEXT TRUNCATED FOR COGNITIVE SPEED & PERFORMANCE OPTIMIZATION ...]\n\n${endText}`;
}

// Summarize research paper
app.post("/api/summarize", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== "string" || text.trim().length < 50) {
      return res.status(400).json({
        error: "Invalid input. Please provide a scientific paper or abstract containing at least 50 characters."
      });
    }

    const ai = getGeminiClient();

    const systemPrompt = `You are an expert scientific communications assistant. Your task is to process scientific or academic literature and extract highly precise structured insights. 
Ensure technical terms are preserved but explained in clear, user-friendly language suitable for undergrad students or interdisciplinary researchers. Avoid vague summaries or placeholders. Use direct evidence from the text.`;

    const optimizedText = optimizeTextForSummarization(text);

    const prompt = `Please analyze the following scientific text and extract key metadata and structural insights. 

TEXT:
"""
${optimizedText}
"""`;

    const response = await callGeminiWithRetry((modelName) =>
      ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "Full formal title of the paper. If not clearly stated, infer a professional title." },
              authors: { type: Type.STRING, description: "List of authors or researchers if available, otherwise 'Not specified'." },
              journal: { type: Type.STRING, description: "Journal, venue, conference, or institution if available, otherwise 'Not specified'." },
              year: { type: Type.STRING, description: "Publication year if available, otherwise 'Not specified'." },
              tldr: { type: Type.STRING, description: "A highly concise layperson summary (3-4 sentences) explaining the significance of the paper without overly dense jargon." },
              objectives: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Key objectives, research questions, hypotheses, or problems being addressed. List up to 4 points."
              },
              methods: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Methodological procedures, materials, delivery systems, algorithms, experimental setup, or tools. List up to 4 points."
              },
              results: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Core empirical findings, measurements, figures, percentages, statistics, or performance metrics. List up to 4 points."
              },
              conclusions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Key takeaways, direct real-world implications, limitations mentioned, and future work. List up to 4 points."
              },
              suggestedQuestions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Three highly relevant, deep, specific questions the user can click to drill down on details of this paper."
              }
            },
            required: [
              "title",
              "authors",
              "journal",
              "year",
              "tldr",
              "objectives",
              "methods",
              "results",
              "conclusions",
              "suggestedQuestions"
            ]
          }
        }
      })
    );

    const resultText = response.text;
    if (!resultText) {
      throw new Error("Empty response from Gemini.");
    }

    const parsedResult = JSON.parse(resultText);
    res.json(parsedResult);
  } catch (error: any) {
    console.error("Error summarizing paper:", error);
    res.status(500).json({
      error: "Failed to summarize paper",
      details: error.message || String(error)
    });
  }
});

// Q&A Interface to drill down
app.post("/api/query", async (req, res) => {
  try {
    const { text, query, history } = req.body;
    if (!text || !query) {
      return res.status(400).json({ error: "Missing required fields: 'text' or 'query'." });
    }

    const ai = getGeminiClient();

    let chatModel = "gemini-3.5-flash";
    let chat = ai.chats.create({
      model: chatModel,
      config: {
        systemInstruction: `You are an elite scientific Q&A assistant designed to help researchers drill down into the details of an academic paper.
You are given the full or partial text of the paper. You must answer the user's questions truthfully and accurately using only the information in the paper.
If the answer is not in the paper, explain that the text does not contain that information, but offer general context if appropriate.
Explain scientific terminology clearly but maintain technical accuracy. Use bullet points and clear Markdown where beneficial.`,
      }
    });

    let response;
    try {
      // Prime the chat with the paper context
      await chat.sendMessage({
        message: `Here is the scientific paper we are discussing. Please memorize its contents and await my questions.

PAPER TEXT:
"""
${text}
"""`
      });

      // If there is preceding history, replay it into the chat session (excluding the initial paper prime)
      if (history && Array.isArray(history)) {
        for (const turn of history) {
          if (turn.role === "user" && turn.content !== query) {
            await chat.sendMessage({ message: turn.content });
          }
        }
      }

      // Send the user's actual current query
      response = await chat.sendMessage({ message: query });
    } catch (chatError: any) {
      console.warn("Chat failed with gemini-3.5-flash, trying gemini-3.1-flash-lite fallback:", chatError.message || chatError);
      
      chatModel = "gemini-3.1-flash-lite";
      chat = ai.chats.create({
        model: chatModel,
        config: {
          systemInstruction: `You are an elite scientific Q&A assistant designed to help researchers drill down into the details of an academic paper.
You are given the full or partial text of the paper. You must answer the user's questions truthfully and accurately using only the information in the paper.
If the answer is not in the paper, explain that the text does not contain that information, but offer general context if appropriate.
Explain scientific terminology clearly but maintain technical accuracy. Use bullet points and clear Markdown where beneficial.`,
        }
      });

      // Prime the fallback chat
      await chat.sendMessage({
        message: `Here is the scientific paper we are discussing. Please memorize its contents and await my questions.

PAPER TEXT:
"""
${text}
"""`
      });

      // Replay history
      if (history && Array.isArray(history)) {
        for (const turn of history) {
          if (turn.role === "user" && turn.content !== query) {
            await chat.sendMessage({ message: turn.content });
          }
        }
      }

      // Send current query
      response = await chat.sendMessage({ message: query });
    }
    
    // Also, generate 2 quick follow-up questions for convenience
    const followUpsResponse = await callGeminiWithRetry((modelName) =>
      ai.models.generateContent({
        model: modelName,
        contents: `Based on this question: "${query}" and this answer: "${response.text}", generate exactly 2 short follow-up questions that the user might want to ask next to explore deeper. Return them as a raw JSON array of 2 strings. Do not write markdown blocks or explanations, just the JSON array.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        }
      })
    );

    let followUpQuestions: string[] = [];
    try {
      if (followUpsResponse.text) {
        followUpQuestions = JSON.parse(followUpsResponse.text);
      }
    } catch {
      followUpQuestions = ["Can you elaborate on the study's limitations?", "What were the experimental baselines?"];
    }

    res.json({
      answer: response.text,
      suggestedFollowUps: followUpQuestions
    });
  } catch (error: any) {
    console.error("Error querying paper:", error);
    res.status(500).json({
      error: "Failed to answer query",
      details: error.message || String(error)
    });
  }
});

// Vite/Static asset integration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
