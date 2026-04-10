import express from "express";
import cors from "cors";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 5000;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// -----------------------
// CACHE
// -----------------------
const cache = {};
const CACHE_TIME = 1000 * 60 * 10;

// -----------------------
// CATEGORY DETECTION
// -----------------------
function getCategory(text = "") {
  text = text.toLowerCase();

  if (text.includes("image")) return "Image";
  if (text.includes("chat")) return "Chatbot";
  if (text.includes("code")) return "Developer";
  if (text.includes("video")) return "Video";
  if (text.includes("voice") || text.includes("audio")) return "Audio";
  if (text.includes("marketing")) return "Marketing";

  return "Other";
}

// -----------------------
// SCORE FUNCTION
// -----------------------
function scoreTool(item) {
  let score = 0;
  const text = `${item.title} ${item.description || ""}`.toLowerCase();

  if (text.includes("ai")) score += 2;
  if (text.includes("tool")) score += 2;
  if (text.includes("gpt")) score += 3;

  if (item.description && item.description.length > 200) score += 2;

  return score;
}

// -----------------------
// 🔥 GENERATE AI TOOLS LIST USING OPENROUTER
// -----------------------
app.get("/api/tools", async (req, res) => {
  try {
    const query = req.query.q || "AI tools";

    // CACHE CHECK
    if (cache[query] && Date.now() - cache[query].time < CACHE_TIME) {
      return res.json({ tools: cache[query].data });
    }

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-4o-mini", // you can change model
        messages: [
          {
            role: "user",
            content: `List 20 AI tools related to "${query}".
Return JSON array with:
- name
- description
- category
- url (real or placeholder)`
          }
        ]
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "HTTP-Referer": "http://localhost:5000",
          "X-Title": "AI Tools App"
        }
      }
    );

    let content = response.data?.choices?.[0]?.message?.content;

    // Try parsing JSON safely
    let tools = [];
    try {
      tools = JSON.parse(content);
    } catch (e) {
      console.log("⚠️ JSON parse failed, raw:", content);
    }

    // If model didn't return proper JSON, fallback
    if (!Array.isArray(tools)) {
      tools = [];
    }

    const processed = tools.map((item, index) => {
      const score = scoreTool(item);

      return {
        id: index,
        name: item.name || "Unnamed",
        description: item.description || "No description",
        url: item.url || "#",
        category: getCategory(item.name + item.description),
        upvotes: score,
        views: Math.floor(Math.random() * 1000)
      };
    });

    processed.sort((a, b) => b.upvotes - a.upvotes);

    // CACHE
    cache[query] = {
      time: Date.now(),
      data: processed
    };

    res.json({ tools: processed });

  } catch (err) {
    console.error("❌ ERROR:", err.response?.data || err.message);
    res.status(500).json({
      error: "Failed to fetch tools",
      details: err.response?.data || err.message
    });
  }
});

// -----------------------
// TOOL DETAILS (OPTIONAL)
// -----------------------
app.get("/api/tool-details", async (req, res) => {
  try {
    const name = req.query.name;

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: `Give a detailed explanation of this AI tool: ${name}`
          }
        ]
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "HTTP-Referer": "http://localhost:5000",
          "X-Title": "AI Tools App"
        }
      }
    );

    const text = response.data?.choices?.[0]?.message?.content;

    res.json({ text: text || "No details found" });

  } catch (err) {
    console.error("❌ ERROR:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to fetch details" });
  }
});

// -----------------------
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});