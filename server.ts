import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));

// Lazy initializer for Gemini
let aiInstance: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured. Please add it under Settings > Secrets.");
    }
    aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiInstance;
}

// Robust retry and fallback function to handle 503 Service Unavailable, rate limits, and model spikes.
async function generateContentWithRetry(
  params: {
    model: string;
    contents: any;
    config?: any;
  },
  retries = 3,
  delay = 1000
): Promise<any> {
  const ai = getGemini();
  let lastError: any = null;
  
  // Define fallback list based on the requested model
  const modelsToTry = [params.model];
  if (params.model === "gemini-3.5-flash") {
    // Fall back to gemini-flash-latest, then gemini-3.1-flash-lite
    modelsToTry.push("gemini-flash-latest");
    modelsToTry.push("gemini-3.1-flash-lite");
  } else if (params.model === "gemini-flash-latest") {
    modelsToTry.push("gemini-3.5-flash");
    modelsToTry.push("gemini-3.1-flash-lite");
  }

  for (const model of modelsToTry) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(`Calling model ${model} (attempt ${attempt}/${retries})...`);
        const response = await ai.models.generateContent({
          ...params,
          model,
        });
        return response;
      } catch (err: any) {
        lastError = err;
        const status = err.status || (err.error && err.error.code);
        console.warn(`Attempt ${attempt} for model ${model} failed with status ${status}:`, err.message || err);
        
        // If it's a client error (400-499) and not rate limiting (429), don't retry, just try next model
        if (status && status >= 400 && status < 500 && status !== 429) {
          break; // break retry loop and try next model
        }

        if (attempt < retries) {
          const backoff = delay * Math.pow(2, attempt - 1) + Math.random() * 500;
          await new Promise((resolve) => setTimeout(resolve, backoff));
        }
      }
    }
  }

  throw lastError || new Error("Failed to generate content after retrying and fallback.");
}

// -------------------------------------------------------------------------
// API ROUTES
// -------------------------------------------------------------------------

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Route: AI Cross-Platform Creator - Generates platform variations from a base post
app.post("/api/generate-variants", async (req, res) => {
  try {
    const { prompt, platforms, customInstructions } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }
    if (!platforms || !Array.isArray(platforms) || platforms.length === 0) {
      return res.status(400).json({ error: "At least one target platform is required" });
    }

    const ai = getGemini();

    const systemInstruction = `You are an elite, multi-platform social media marketer and viral growth engineer.
Given a user's raw input idea, post, or draft, translate and optimize it for each requested platform using their exact visual specs, copywriting guidelines, and viral engagement hooks.
Be creative, highly engaging, and apply native-style elements (like square formatting and carousels for Instagram/LinkedIn, trending hook setups, and spacing).
Do not output markdown codeblocks around the JSON. Return exactly a JSON object matching the requested schema.`;

    let contentsText = `Generate platform-specific post variants for the following base post/idea:
"${prompt}"

Target Platforms: ${platforms.join(", ")}`;

    if (customInstructions && typeof customInstructions === "object") {
      contentsText += `\n\nApply the following platform-specific custom guidelines and instruction overrides when writing each variant:`;
      for (const [plat, inst] of Object.entries(customInstructions)) {
        if (inst && typeof inst === "string" && inst.trim() !== "") {
          contentsText += `\n- **${plat}**: ${inst.trim()}`;
        }
      }
    }

    const response = await generateContentWithRetry({
      model: "gemini-3.5-flash",
      contents: contentsText,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            variants: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  platform: {
                    type: Type.STRING,
                    description: "The platform name (e.g. Instagram, TikTok, YouTube, LinkedIn)",
                  },
                  caption: {
                    type: Type.STRING,
                    description: "The customized high-converting copy or script caption with line breaks and emojis.",
                  },
                  aspectRatio: {
                    type: Type.STRING,
                    description: "The recommended aspect ratio (e.g. 1:1, 9:16, 16:9)",
                  },
                  hook: {
                    type: Type.STRING,
                    description: "The exact 3-second hook text or visual opener design suggestion.",
                  },
                  hashtags: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Optimal, trending hashtag groups for this specific post and platform.",
                  },
                  trendingAudioSuggestion: {
                    type: Type.STRING,
                    description: "Type of sound, vibe, or current trend template to pair with.",
                  },
                  visualLayoutGuide: {
                    type: Type.STRING,
                    description: "Visual guidelines (e.g. 'Use a clean carousel with 3 slides', 'A-roll talking head with dynamic caption overlays')",
                  },
                },
                required: ["platform", "caption", "aspectRatio", "hook", "hashtags", "trendingAudioSuggestion", "visualLayoutGuide"],
              },
            },
          },
          required: ["variants"],
        },
      },
    });

    const resultText = response.text || "{}";
    res.json(JSON.parse(resultText));
  } catch (err: any) {
    console.error("Error in generate-variants:", err);
    res.status(500).json({ error: err.message || "Failed to generate platform variations." });
  }
});

// Route: AI Performance Diagnostics - Diagnoses post metrics and drafts against the viral spec
app.post("/api/analyze-post", async (req, res) => {
  try {
    const { platform, text, views, engagement, followerCount } = req.body;
    if (!platform || !text) {
      return res.status(400).json({ error: "Platform and post text are required." });
    }

    const ai = getGemini();

    const systemInstruction = `You are an AI Social Media Analytics Diagnostician.
You analyze an existing post's text/hook and its performance metrics (views, engagement, follower count) against that platform's exact current algorithm and viral benchmarks.
Identify exact drop-off points, hook strength, visual spacing, readability, hashtag SEO strength, and deliver a precise weekly-level report card with a concrete "1-Click Fix" or "Suggested Recovery" layout.
Output exactly a JSON object matching the requested schema.`;

    const response = await generateContentWithRetry({
      model: "gemini-3.5-flash",
      contents: `Analyze the following social post and metrics:
Platform: ${platform}
Post Text: "${text}"
Current Metrics:
- Views: ${views || 0}
- Engagement Rate: ${engagement || 0}%
- Creator Follower Count: ${followerCount || "Unknown"}`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            hookGrade: { type: Type.STRING, description: "Letter grade A-F" },
            hookAnalysis: { type: Type.STRING, description: "Detailed analysis of the 3-second hook strength." },
            pacingFeedback: { type: Type.STRING, description: "Feedback on copywriting pacing, line breaks, visual density, and readability." },
            seoGrade: { type: Type.STRING, description: "Letter grade A-F for search visibility, keywords, and hashtags." },
            seoFeedback: { type: Type.STRING, description: "Feedback on keyword placement and hashtags." },
            viralSpecAdherence: { type: Type.STRING, description: "How well it follows the current platform algorithm specs." },
            actionableRecommendation: { type: Type.STRING, description: "Concrete, actionable strategy. Write a fully redesigned or optimized draft template of this post that the user can immediately try." },
          },
          required: ["hookGrade", "hookAnalysis", "pacingFeedback", "seoGrade", "seoFeedback", "viralSpecAdherence", "actionableRecommendation"],
        },
      },
    });

    const resultText = response.text || "{}";
    res.json(JSON.parse(resultText));
  } catch (err: any) {
    console.error("Error in analyze-post:", err);
    res.status(500).json({ error: err.message || "Failed to analyze post performance." });
  }
});

// Route: Weekly AI Growth Report & Next Action Suggestions
app.post("/api/generate-growth-report", async (req, res) => {
  try {
    const { niche, recentPosts } = req.body;
    const nicheStr = niche || "general creative entrepreneurship";

    const ai = getGemini();

    const systemInstruction = `You are a social media strategic intelligence expert.
Generate a personalized Weekly Growth Report and Next-Action recommendations.
Return a Top Performer Spotlight (praising a hypothetical or actual post structure), a Recovery Tip for a struggling post with a 1-click template, and a completely fresh "Suggested Next Post" template optimized for the user's niche.
Output exactly a JSON object matching the requested schema.`;

    const recentPostsText = recentPosts && recentPosts.length > 0 
      ? JSON.stringify(recentPosts) 
      : "No post history available. Generate based on general high-performing patterns for this niche.";

    const response = await generateContentWithRetry({
      model: "gemini-3.5-flash",
      contents: `Generate a Weekly AI Growth Report and strategic playbook for:
Niche: ${nicheStr}
Recent Post Data:
${recentPostsText}`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            nicheAssessed: { type: Type.STRING },
            topPerformerSpotlight: {
              type: Type.OBJECT,
              properties: {
                platform: { type: Type.STRING },
                concept: { type: Type.STRING, description: "The core format/angle that worked best." },
                whyItWorked: { type: Type.STRING, description: "Algorithmic explanation." },
                keyTakeaway: { type: Type.STRING, description: "One simple rule to replicate." },
              },
              required: ["platform", "concept", "whyItWorked", "keyTakeaway"],
            },
            recoveryTip: {
              type: Type.OBJECT,
              properties: {
                issueIdentified: { type: Type.STRING, description: "e.g., 'Weak TikTok visual hooks drop 40% viewers'" },
                fixAction: { type: Type.STRING, description: "Action step" },
                templateText: { type: Type.STRING, description: "A draft post template applying the fix." },
                platform: { type: Type.STRING },
              },
              required: ["issueIdentified", "fixAction", "templateText", "platform"],
            },
            suggestedNextPost: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                platform: { type: Type.STRING },
                aspectRatio: { type: Type.STRING },
                formatCategory: { type: Type.STRING, description: "e.g. Carousel, Short-form Video, Text Essay" },
                recommendedHook: { type: Type.STRING },
                copywritingFramework: { type: Type.STRING, description: "e.g., AIDA, PAS, Curiosity Hook" },
                suggestedDraft: { type: Type.STRING, description: "A ready-to-publish custom draft post text." },
                recommendedTags: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: ["title", "platform", "aspectRatio", "formatCategory", "recommendedHook", "copywritingFramework", "suggestedDraft", "recommendedTags"],
            },
          },
          required: ["nicheAssessed", "topPerformerSpotlight", "recoveryTip", "suggestedNextPost"],
        },
      },
    });

    const resultText = response.text || "{}";
    res.json(JSON.parse(resultText));
  } catch (err: any) {
    console.error("Error in generate-growth-report:", err);
    res.status(500).json({ error: err.message || "Failed to generate growth report." });
  }
});

// Route: AI Video Studio - Generate Script
app.post("/api/generate-script", async (req, res) => {
  try {
    const { idea, tone, platform } = req.body;
    if (!idea) {
      return res.status(400).json({ error: "Script idea is required." });
    }

    const ai = getGemini();

    const systemInstruction = `You are an elite short-form video scriptwriter.
Generate a structured video script (title, scene-by-scene breakdown) for an avatar-presenter.
Optimize scene durations, pacing, visual cues, caption overlays, and narration lines to maximize watch time.
Output exactly a JSON object matching the requested schema.`;

    const response = await generateContentWithRetry({
      model: "gemini-3.5-flash",
      contents: `Create a video script based on:
Idea: "${idea}"
Tone: ${tone || "engaging & confident"}
Platform: ${platform || "TikTok/Shorts"}`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            estimatedTotalDuration: { type: Type.NUMBER, description: "Total seconds" },
            scenes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  sceneNumber: { type: Type.INTEGER },
                  durationSeconds: { type: Type.NUMBER },
                  visualDescription: { type: Type.STRING, description: "Action, avatar expression, or camera movement." },
                  narrationText: { type: Type.STRING, description: "What the avatar actually speaks." },
                  captionText: { type: Type.STRING, description: "Word-for-word on-screen text." },
                  bRollSuggestion: { type: Type.STRING, description: "Stock video, visual overlay, or background asset suggestion." },
                },
                required: ["sceneNumber", "durationSeconds", "visualDescription", "narrationText", "captionText", "bRollSuggestion"],
              },
            },
          },
          required: ["title", "estimatedTotalDuration", "scenes"],
        },
      },
    });

    const resultText = response.text || "{}";
    res.json(JSON.parse(resultText));
  } catch (err: any) {
    console.error("Error in generate-script:", err);
    res.status(500).json({ error: err.message || "Failed to generate video script." });
  }
});

// Route: AI Video Studio - Text-to-Speech Generation using gemini-3.1-flash-tts-preview
app.post("/api/generate-tts", async (req, res) => {
  try {
    const { text, voice } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Text is required for TTS." });
    }

    const ai = getGemini();

    const allowedVoices = ["Puck", "Charon", "Kore", "Fenrir", "Zephyr"];
    const voiceName = allowedVoices.includes(voice) ? voice : "Zephyr";

    console.log(`Generating TTS using voice ${voiceName} for: "${text.substring(0, 40)}..."`);

    const response = await generateContentWithRetry({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text: `Generate spoken speech for this script: ${text}` }] }],
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      throw new Error("No audio data returned from Gemini TTS model.");
    }

    res.json({ audio: base64Audio });
  } catch (err: any) {
    console.error("Error in generate-tts:", err);
    res.status(500).json({ error: err.message || "Failed to synthesize speech." });
  }
});

// Route: AI Trending Topics Finder - Fetches recent viral tags/topics using Google Search grounding
app.post("/api/trending-topics", async (req, res) => {
  try {
    const { niche } = req.body;
    if (!niche) {
      return res.status(400).json({ error: "Niche is required." });
    }

    console.log(`Fetching trending topics with Search Grounding for niche: "${niche}"`);

    const systemInstruction = `You are an elite, highly precise AI Trend Analyst and Social Media Growth Hacker.
Your mission is to perform a deep Google Search to find actual, real-world trending topics, viral hashtags, popular content formats, and breaking news relevant to the user's niche in the last 7 to 14 days.
Generate highly actionable angles that content creators can immediately use to design viral posts.
Return a structured JSON object. Do not output markdown code blocks.`;

    const contentsText = `Perform a comprehensive search of Google for the most recent trending topics, hot discussions, breaking news, or viral content formats inside the "${niche}" niche over the past week.
Identify 3 distinct high-potential trends with exact descriptions, traffic spikes, viewer sentiments, recommended angles, and hashtags.`;

    const response = await generateContentWithRetry({
      model: "gemini-3.5-flash",
      contents: contentsText,
      config: {
        systemInstruction,
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            trends: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  topic: { type: Type.STRING, description: "Clear title of the viral topic or industry news." },
                  explanation: { type: Type.STRING, description: "Why it is trending and the algorithmic benefit of posting about it." },
                  trafficSpike: { type: Type.STRING, description: "Trend growth metrics, e.g. '+240% search spike', 'Emerging Breakout'." },
                  sentiment: { type: Type.STRING, description: "Audience sentiment, e.g. 'Highly positive', 'Skeptical but curious'." },
                  suggestedAngle: { type: Type.STRING, description: "A high-converting post hook or video concept structure to capitalize on this." },
                  tags: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "3-4 highly relevant hashtags or keywords."
                  }
                },
                required: ["topic", "explanation", "trafficSpike", "sentiment", "suggestedAngle", "tags"]
              }
            }
          },
          required: ["trends"]
        }
      }
    });

    const resultText = response.text || "{}";
    let parsedData: any = {};
    try {
      parsedData = JSON.parse(resultText);
    } catch (parseErr) {
      console.warn("Fell back to regex-extracting JSON:", parseErr);
      const jsonMatch = resultText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Failed to parse Gemini JSON response.");
      }
    }

    // Extract grounding sources to display real-world links in the UI
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    let sources: { title: string; url: string }[] = [];
    if (chunks && Array.isArray(chunks)) {
      sources = chunks
        .filter((chunk: any) => chunk.web && chunk.web.uri)
        .map((chunk: any) => ({
          title: chunk.web.title || "Reference Article",
          url: chunk.web.uri
        }));
    }

    res.json({
      trends: parsedData.trends || [],
      sources
    });
  } catch (err: any) {
    console.error("Error in trending-topics:", err);
    res.status(500).json({ error: err.message || "Failed to fetch trending topics with search grounding." });
  }
});

// -------------------------------------------------------------------------
// VITE DEV SERVER & STATIC HOSTING MIDDLEWARE
// -------------------------------------------------------------------------

async function startServer() {
  // Vite middleware for development
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
    console.log(`Water Creator server running at http://0.0.0.0:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  });
}

startServer();
