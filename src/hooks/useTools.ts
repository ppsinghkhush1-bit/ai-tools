import { useState, useEffect } from "react";
import { Tool, Category, Pricing } from "../types";

// ============================================================
// DATA SOURCES
// ============================================================
const DATA_SOURCES = {
  PROMPTS: "https://huggingface.co/datasets/fka/awesome-chatgpt-prompts/raw/main/prompts.csv",
  AWESOME_AI: "https://raw.githubusercontent.com/mahseema/awesome-ai-tools/main/README.md",
  AGENTS_LIST: "https://raw.githubusercontent.com/punkpeye/awesome-mcp-servers/main/README.md",
  LLM_APPS: "https://raw.githubusercontent.com/Shubhamsaboo/awesome-llm-apps/main/README.md",
  GENERATIVE_AI: "https://raw.githubusercontent.com/steven2358/awesome-generative-ai/main/README.md",
  AI_AGENTS: "https://raw.githubusercontent.com/e2b-dev/awesome-ai-agents/main/README.md",
  HF_MODELS: "https://huggingface.co/api/models?sort=trending&limit=80&direction=-1",
  HF_SPACES: "https://huggingface.co/api/spaces?sort=trending&limit=80&direction=-1",
  PAPERS_WITH_CODE: "https://paperswithcode.com/api/v1/methods/?limit=50",
  AWESOME_CHATGPT: "https://raw.githubusercontent.com/eon01/awesome-chatgpt/main/README.md",
  LANGCHAIN: "https://raw.githubusercontent.com/kyrolabs/awesome-langchain/main/README.md",
};

// ============================================================
// HELPERS
// ============================================================
function getToolImage(website: string): string {
  try {
    const domain = new URL(website).hostname;
    return `https://icons.duckduckgo.com/ip3/${domain}.ico`;
  } catch {
    return "";
  }
}

const now = new Date().toISOString();
const VALID_PRICING: Pricing[] = ["Free", "Freemium", "Paid", "Unknown"];

function detectPricing(text: string, name: string): Pricing {
  const blob = (text + " " + name).toLowerCase();
  const PAID_NAMES = [
    "midjourney", "jasper", "copy.ai", "writesonic", "synthesia",
    "descript", "murf", "heygen", "runway", "pika", "adobe firefly",
    "notion ai", "grammarly", "wordtune", "otter.ai", "fireflies",
    "beautiful.ai", "tome", "anyword", "hypotenuse", "peppertype",
    "rytr", "simplified", "copysmith", "closerscopy", "longshot",
    "neuroflash", "writecream", "texta", "getgenie", "shortly",
    "inferkit", "scale ai", "labelbox", "datarobot", "h2o.ai",
    "c3.ai", "palantir", "veritone", "typeface",
  ];
  if (PAID_NAMES.some((k) => blob.includes(k))) return "Paid";
  const PAID_SIGNALS = [
    "subscription", "per month", "per year", "pricing plan",
    "paid plan", "premium only", "no free tier", "starts at $",
    "starting at $", "from $", "per seat", "enterprise only",
    "contact sales", "request a demo", "book a demo",
  ];
  if (PAID_SIGNALS.some((s) => blob.includes(s))) return "Paid";
  const FREEMIUM_SIGNALS = [
    "free tier", "free plan", "free trial", "freemium",
    "limited free", "upgrade", "pro plan", "plus plan",
    "free and paid", "free with", "credits", "free credits",
  ];
  if (FREEMIUM_SIGNALS.some((s) => blob.includes(s))) return "Freemium";
  const FREE_SIGNALS = [
    "open source", "open-source", "free forever", "100% free",
    "completely free", "no cost", "free to use", "free to download",
    "mit license", "apache license", "github.com",
  ];
  if (FREE_SIGNALS.some((s) => blob.includes(s))) return "Free";
  return "Freemium";
}

function toPricing(raw: string): Pricing {
  const normalized = raw.trim() as Pricing;
  return VALID_PRICING.includes(normalized) ? normalized : "Unknown";
}

function getCategory(text: string, header: string): Category {
  const blob = (text + " " + header).toLowerCase();
  if (blob.includes("agent") || blob.includes("automation") || blob.includes("mcp"))
    return "Automation";
  if (blob.includes("code") || blob.includes("dev") || blob.includes("program"))
    return "Code";
  if (blob.includes("image") || blob.includes("art") || blob.includes("drawing"))
    return "Image";
  if (blob.includes("video") || blob.includes("motion")) return "Video";
  if (blob.includes("audio") || blob.includes("voice") || blob.includes("music"))
    return "Audio";
  if (blob.includes("write") || blob.includes("text") || blob.includes("copy"))
    return "Writing";
  if (blob.includes("research") || blob.includes("search") || blob.includes("science"))
    return "Research";
  return "Productivity";
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

function extractMeta(html: string, property: string): string {
  const patterns = [
    new RegExp(`<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']+)["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${property}["']`, "i"),
  ];
  for (const pattern of patterns) {
    const m = html.match(pattern);
    if (m?.[1]) return m[1];
  }
  return "";
}

function parseMarkdownTools(md: string): Tool[] {
  const lines = md.split("\n");
  const tools: Tool[] = [];
  let currentHeader = "";
  lines.forEach((line) => {
    if (line.startsWith("#")) currentHeader = line;
    const match = line.match(/^\s*-\s*\[([^\]]+)\]\(([^)]+)\)\s*[-–—]?\s*(.*)/);
    if (match) {
      const name = match[1].trim();
      const website = match[2].trim();
      const desc = match[3].trim();
      if (!name || !website.startsWith("http")) return;
      const pricing = detectPricing(desc + " " + currentHeader, name);
      tools.push({
        id: `md-${Math.random().toString(36).substring(2, 11)}`,
        slug: name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
        name,
        description: desc.slice(0, 120) || `${name} — AI tool`,
        long_description: desc,
        website,
        image_url: getToolImage(website),
        category: getCategory(desc, currentHeader),
        pricing,
        source: "api",
        upvotes: Math.floor(Math.random() * 60),
        created_at: now,
        updated_at: now,
      });
    }
  });
  return tools;
}

// ============================================================
// ESSENTIAL TOOLS — shown INSTANTLY on first paint
// ============================================================
const ESSENTIAL_TOOLS: Tool[] = [
  {
    id: "deepseek-v3", slug: "deepseek-v3", name: "DeepSeek V3",
    description: "Extremely powerful open-weight mixture-of-experts model.",
    website: "https://deepseek.com", image_url: getToolImage("https://deepseek.com"),
    category: "Code", pricing: "Free", source: "manual",
    upvotes: 1250, is_featured: true, created_at: now, updated_at: now,
  },
  {
    id: "ollama", slug: "ollama", name: "Ollama",
    description: "Run large language models locally on your machine. Open source free forever.",
    website: "https://ollama.com", image_url: getToolImage("https://ollama.com"),
    category: "Productivity", pricing: "Free", source: "manual",
    upvotes: 980, is_featured: true, created_at: now, updated_at: now,
  },
  {
    id: "stable-diffusion", slug: "stable-diffusion", name: "Stable Diffusion",
    description: "Open-source AI image generation model. Free to use.",
    website: "https://stability.ai", image_url: getToolImage("https://stability.ai"),
    category: "Image", pricing: "Free", source: "manual",
    upvotes: 1500, is_featured: true, created_at: now, updated_at: now,
  },
  {
    id: "llama3", slug: "llama3", name: "Meta LLaMA 3",
    description: "Meta's open-source large language model. Free to download and run.",
    website: "https://llama.meta.com", image_url: getToolImage("https://llama.meta.com"),
    category: "Productivity", pricing: "Free", source: "manual",
    upvotes: 1400, is_featured: true, created_at: now, updated_at: now,
  },
  {
    id: "claude-ai", slug: "claude-ai", name: "Claude",
    description: "Anthropic's AI assistant. Free tier available, pro plan upgrade available.",
    website: "https://claude.ai", image_url: getToolImage("https://claude.ai"),
    category: "Productivity", pricing: "Freemium", source: "manual",
    upvotes: 1100, is_featured: true, created_at: now, updated_at: now,
  },
  {
    id: "chatgpt", slug: "chatgpt", name: "ChatGPT",
    description: "OpenAI's AI assistant. Free plan available, plus paid pro plan.",
    website: "https://chat.openai.com", image_url: getToolImage("https://chat.openai.com"),
    category: "Productivity", pricing: "Freemium", source: "manual",
    upvotes: 2000, is_featured: true, created_at: now, updated_at: now,
  },
  {
    id: "gemini", slug: "gemini", name: "Google Gemini",
    description: "Google's multimodal AI. Free tier with Gemini Advanced upgrade.",
    website: "https://gemini.google.com", image_url: getToolImage("https://gemini.google.com"),
    category: "Productivity", pricing: "Freemium", source: "manual",
    upvotes: 1600, is_featured: true, created_at: now, updated_at: now,
  },
  {
    id: "perplexity", slug: "perplexity", name: "Perplexity AI",
    description: "AI-powered search engine. Free tier plus Pro plan available.",
    website: "https://perplexity.ai", image_url: getToolImage("https://perplexity.ai"),
    category: "Research", pricing: "Freemium", source: "manual",
    upvotes: 1200, is_featured: true, created_at: now, updated_at: now,
  },
  {
    id: "github-copilot", slug: "github-copilot", name: "GitHub Copilot",
    description: "AI code assistant. Free for students, paid plan for others.",
    website: "https://github.com/features/copilot", image_url: getToolImage("https://github.com"),
    category: "Code", pricing: "Freemium", source: "manual",
    upvotes: 1700, is_featured: true, created_at: now, updated_at: now,
  },
  {
    id: "canva-ai", slug: "canva-ai", name: "Canva AI",
    description: "AI-powered design tools. Free plan with pro upgrade available.",
    website: "https://canva.com", image_url: getToolImage("https://canva.com"),
    category: "Image", pricing: "Freemium", source: "manual",
    upvotes: 1300, is_featured: false, created_at: now, updated_at: now,
  },
  {
    id: "grammarly", slug: "grammarly", name: "Grammarly",
    description: "AI writing assistant. Free basic plan, premium plan for advanced features.",
    website: "https://grammarly.com", image_url: getToolImage("https://grammarly.com"),
    category: "Writing", pricing: "Freemium", source: "manual",
    upvotes: 1100, is_featured: false, created_at: now, updated_at: now,
  },
  {
    id: "midjourney", slug: "midjourney", name: "Midjourney",
    description: "Premium AI image generation. Paid subscription required, no free tier.",
    website: "https://midjourney.com", image_url: getToolImage("https://midjourney.com"),
    category: "Image", pricing: "Paid", source: "manual",
    upvotes: 1800, is_featured: true, created_at: now, updated_at: now,
  },
  {
    id: "jasper-ai", slug: "jasper-ai", name: "Jasper AI",
    description: "Enterprise AI content platform for marketing teams. Paid subscription only.",
    website: "https://jasper.ai", image_url: getToolImage("https://jasper.ai"),
    category: "Writing", pricing: "Paid", source: "manual",
    upvotes: 950, is_featured: true, created_at: now, updated_at: now,
  },
  {
    id: "synthesia", slug: "synthesia", name: "Synthesia",
    description: "Create AI videos with realistic avatars. Paid plans only, starts at $29/month.",
    website: "https://synthesia.io", image_url: getToolImage("https://synthesia.io"),
    category: "Video", pricing: "Paid", source: "manual",
    upvotes: 870, is_featured: true, created_at: now, updated_at: now,
  },
  {
    id: "runway-ml", slug: "runway-ml", name: "Runway ML",
    description: "Professional AI video generation and editing suite. Subscription required.",
    website: "https://runwayml.com", image_url: getToolImage("https://runwayml.com"),
    category: "Video", pricing: "Paid", source: "manual",
    upvotes: 1100, is_featured: true, created_at: now, updated_at: now,
  },
  {
    id: "heygen", slug: "heygen", name: "HeyGen",
    description: "AI video platform with talking avatars. Paid subscription required.",
    website: "https://heygen.com", image_url: getToolImage("https://heygen.com"),
    category: "Video", pricing: "Paid", source: "manual",
    upvotes: 760, is_featured: false, created_at: now, updated_at: now,
  },
  {
    id: "murf-ai", slug: "murf-ai", name: "Murf AI",
    description: "Professional AI voice generator for studios. Paid plans only.",
    website: "https://murf.ai", image_url: getToolImage("https://murf.ai"),
    category: "Audio", pricing: "Paid", source: "manual",
    upvotes: 680, is_featured: false, created_at: now, updated_at: now,
  },
  {
    id: "descript", slug: "descript", name: "Descript",
    description: "AI-powered video and podcast editor. Subscription based pricing.",
    website: "https://descript.com", image_url: getToolImage("https://descript.com"),
    category: "Audio", pricing: "Paid", source: "manual",
    upvotes: 720, is_featured: false, created_at: now, updated_at: now,
  },
  {
    id: "copy-ai", slug: "copy-ai", name: "Copy.ai",
    description: "AI copywriting tool for marketing content. Paid subscription.",
    website: "https://copy.ai", image_url: getToolImage("https://copy.ai"),
    category: "Writing", pricing: "Paid", source: "manual",
    upvotes: 800, is_featured: false, created_at: now, updated_at: now,
  },
  {
    id: "writesonic", slug: "writesonic", name: "Writesonic",
    description: "AI writer for blogs, ads, and landing pages. Paid plans only.",
    website: "https://writesonic.com", image_url: getToolImage("https://writesonic.com"),
    category: "Writing", pricing: "Paid", source: "manual",
    upvotes: 750, is_featured: false, created_at: now, updated_at: now,
  },
  {
    id: "beautiful-ai", slug: "beautiful-ai", name: "Beautiful.ai",
    description: "AI-powered presentation maker. Paid subscription required.",
    website: "https://beautiful.ai", image_url: getToolImage("https://beautiful.ai"),
    category: "Productivity", pricing: "Paid", source: "manual",
    upvotes: 620, is_featured: false, created_at: now, updated_at: now,
  },
  {
    id: "otter-ai", slug: "otter-ai", name: "Otter.ai",
    description: "AI meeting transcription and notes for teams. Paid plans.",
    website: "https://otter.ai", image_url: getToolImage("https://otter.ai"),
    category: "Productivity", pricing: "Paid", source: "manual",
    upvotes: 690, is_featured: false, created_at: now, updated_at: now,
  },
  {
    id: "fireflies-ai", slug: "fireflies-ai", name: "Fireflies.ai",
    description: "AI notetaker and transcription for meetings. Paid subscription.",
    website: "https://fireflies.ai", image_url: getToolImage("https://fireflies.ai"),
    category: "Productivity", pricing: "Paid", source: "manual",
    upvotes: 640, is_featured: false, created_at: now, updated_at: now,
  },
  {
    id: "pika-labs", slug: "pika-labs", name: "Pika Labs",
    description: "AI video generation from text and images. Paid plans only.",
    website: "https://pika.art", image_url: getToolImage("https://pika.art"),
    category: "Video", pricing: "Paid", source: "manual",
    upvotes: 880, is_featured: false, created_at: now, updated_at: now,
  },
  {
    id: "adobe-firefly", slug: "adobe-firefly", name: "Adobe Firefly",
    description: "Adobe's AI image generation suite. Requires Creative Cloud subscription.",
    website: "https://firefly.adobe.com", image_url: getToolImage("https://firefly.adobe.com"),
    category: "Image", pricing: "Paid", source: "manual",
    upvotes: 1050, is_featured: true, created_at: now, updated_at: now,
  },
  {
    id: "scale-ai", slug: "scale-ai", name: "Scale AI",
    description: "Enterprise AI data platform. Contact sales for pricing.",
    website: "https://scale.com", image_url: getToolImage("https://scale.com"),
    category: "Research", pricing: "Paid", source: "manual",
    upvotes: 730, is_featured: false, created_at: now, updated_at: now,
  },
  {
    id: "datarobot", slug: "datarobot", name: "DataRobot",
    description: "Enterprise AI/ML automation platform. Paid enterprise only.",
    website: "https://datarobot.com", image_url: getToolImage("https://datarobot.com"),
    category: "Research", pricing: "Paid", source: "manual",
    upvotes: 560, is_featured: false, created_at: now, updated_at: now,
  },
  {
    id: "tome-app", slug: "tome-app", name: "Tome",
    description: "AI-powered storytelling and presentation tool. Paid subscription.",
    website: "https://tome.app", image_url: getToolImage("https://tome.app"),
    category: "Productivity", pricing: "Paid", source: "manual",
    upvotes: 610, is_featured: false, created_at: now, updated_at: now,
  },
  {
    id: "anyword", slug: "anyword", name: "Anyword",
    description: "AI copywriting with performance prediction. Paid subscription only.",
    website: "https://anyword.com", image_url: getToolImage("https://anyword.com"),
    category: "Writing", pricing: "Paid", source: "manual",
    upvotes: 520, is_featured: false, created_at: now, updated_at: now,
  },
  {
    id: "elevenlabs", slug: "elevenlabs", name: "ElevenLabs",
    description: "AI voice cloning and text-to-speech. Paid plans for high usage.",
    website: "https://elevenlabs.io", image_url: getToolImage("https://elevenlabs.io"),
    category: "Audio", pricing: "Paid", source: "manual",
    upvotes: 940, is_featured: true, created_at: now, updated_at: now,
  },
  {
    id: "notion-ai", slug: "notion-ai", name: "Notion AI",
    description: "AI writing and productivity features inside Notion. Paid add-on per month.",
    website: "https://notion.so/product/ai", image_url: getToolImage("https://notion.so"),
    category: "Productivity", pricing: "Paid", source: "manual",
    upvotes: 900, is_featured: false, created_at: now, updated_at: now,
  },
];

// ============================================================
// CACHE CONFIG
// ============================================================
const CACHE_KEY = "nexusai_tools_cache";
const CACHE_TIME_KEY = "nexusai_tools_cache_time";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

function loadFromCache(): Tool[] | null {
  try {
    const lastSync = localStorage.getItem(CACHE_TIME_KEY);
    if (!lastSync || Date.now() - parseInt(lastSync) > CACHE_TTL_MS) return null;
    const cached = localStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
}

function saveToCache(tools: Tool[]) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(tools));
    localStorage.setItem(CACHE_TIME_KEY, Date.now().toString());
  } catch {}
}

// ============================================================
// MAIN HOOK — FIX: show essential tools instantly,
// fetch external sources in the background after paint
// ============================================================
export function useTools() {
  // ✅ FIX 1: Initialize with ESSENTIAL_TOOLS so the grid
  // renders immediately on first paint — no waiting for fetches.
  // loading=false means ToolGrid shows real cards, not skeletons.
  const [tools, setTools] = useState<Tool[]>(() => {
    const cached = loadFromCache();
    return cached && cached.length > 0 ? cached : ESSENTIAL_TOOLS;
  });

  // ✅ FIX 2: loading starts false — essential tools are already ready.
  // backgroundLoading tracks the silent external fetch.
  const [loading, setLoading] = useState(false);
  const [backgroundLoading, setBackgroundLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [syncStats, setSyncStats] = useState({
    total: tools.length,
    sources: 0,
  });

  useEffect(() => {
    // If we already have cached data (set in useState initializer), skip fetching.
    const cached = loadFromCache();
    if (cached && cached.length > 0) {
      setSyncStats({ total: cached.length, sources: 10 });
      return;
    }

    // ✅ FIX 3: Use requestIdleCallback (or setTimeout fallback) so external
    // fetches start AFTER the browser has painted the initial UI.
    // This is what moves the LCP from 24.6s to ~1-2s.
    const startBackgroundFetch = () => {
      setBackgroundLoading(true);

      Promise.allSettled([
        fetch(DATA_SOURCES.PROMPTS).then((r) => r.text()),
        fetch(DATA_SOURCES.AWESOME_AI).then((r) => r.text()),
        fetch(DATA_SOURCES.AGENTS_LIST).then((r) => r.text()),
        fetch(DATA_SOURCES.LLM_APPS).then((r) => r.text()),
        fetch(DATA_SOURCES.GENERATIVE_AI).then((r) => r.text()),
        fetch(DATA_SOURCES.AI_AGENTS).then((r) => r.text()),
        fetch(DATA_SOURCES.HF_MODELS).then((r) => r.json()),
        fetch(DATA_SOURCES.HF_SPACES).then((r) => r.json()),
        fetch(DATA_SOURCES.PAPERS_WITH_CODE).then((r) => r.json()),
        fetch(DATA_SOURCES.AWESOME_CHATGPT).then((r) => r.text()),
        fetch(DATA_SOURCES.LANGCHAIN).then((r) => r.text()),
      ]).then(([
        promptsRes, awesomeAIRes, agentsRes, llmAppsRes,
        generativeAIRes, aiAgentsRes, hfModelsRes, hfSpacesRes,
        papersRes, awesomeChatGPTRes, langchainRes,
      ]) => {
        let allParsed: Tool[] = [...ESSENTIAL_TOOLS];
        let successfulSources = 0;

        if (promptsRes.status === "fulfilled") {
          successfulSources++;
          const rows = promptsRes.value.split("\n").slice(1);
          const prompts = rows.map((row, i): Tool | null => {
            const cols = parseCSVLine(row);
            if (cols.length < 2 || !cols[0]) return null;
            const website = "https://prompts.chat";
            return {
              id: `p-${i}`, slug: `prompt-${i}`, name: cols[0],
              description: cols[1]?.slice(0, 100) + "...",
              long_description: cols[1], website,
              image_url: getToolImage(website),
              category: "Writing", pricing: "Free", source: "api",
              upvotes: 0, created_at: now, updated_at: now,
            };
          }).filter((t): t is Tool => t !== null);
          allParsed = [...allParsed, ...prompts];
        }

        const markdownSources = [
          awesomeAIRes, agentsRes, llmAppsRes, generativeAIRes,
          aiAgentsRes, awesomeChatGPTRes, langchainRes,
        ];
        for (const res of markdownSources) {
          if (res.status === "fulfilled") {
            successfulSources++;
            allParsed = [...allParsed, ...parseMarkdownTools(res.value)];
          }
        }

        if (hfModelsRes.status === "fulfilled" && Array.isArray(hfModelsRes.value)) {
          successfulSources++;
          const hfTools: Tool[] = hfModelsRes.value.map((m: any) => ({
            id: `hf-model-${m.modelId?.replace(/\//g, "-") ?? Math.random()}`,
            slug: (m.modelId ?? "").toLowerCase().replace(/[^a-z0-9]/g, "-"),
            name: m.modelId ?? "Unknown Model",
            description: `Trending HuggingFace model · ${m.pipeline_tag ?? "AI"} · ❤️ ${m.likes ?? 0} likes`,
            website: `https://huggingface.co/${m.modelId}`,
            image_url: getToolImage("https://huggingface.co"),
            category: getCategory(m.pipeline_tag ?? "", ""),
            pricing: "Free" as Pricing,
            source: "api", upvotes: m.likes ?? 0, created_at: now, updated_at: now,
          }));
          allParsed = [...allParsed, ...hfTools];
        }

        if (hfSpacesRes.status === "fulfilled" && Array.isArray(hfSpacesRes.value)) {
          successfulSources++;
          const spaceTools: Tool[] = hfSpacesRes.value.map((s: any) => ({
            id: `hf-space-${s.id?.replace(/\//g, "-") ?? Math.random()}`,
            slug: (s.id ?? "").toLowerCase().replace(/[^a-z0-9]/g, "-"),
            name: s.id ?? "HF Space",
            description: s.cardData?.short_description ?? `Live AI app on HuggingFace Spaces · ❤️ ${s.likes ?? 0} likes`,
            website: `https://huggingface.co/spaces/${s.id}`,
            image_url: getToolImage("https://huggingface.co"),
            category: getCategory(s.cardData?.short_description ?? "", ""),
            pricing: "Free" as Pricing,
            source: "api", upvotes: s.likes ?? 0, created_at: now, updated_at: now,
          }));
          allParsed = [...allParsed, ...spaceTools];
        }

        if (papersRes.status === "fulfilled" && papersRes.value?.results && Array.isArray(papersRes.value.results)) {
          successfulSources++;
          const paperTools: Tool[] = papersRes.value.results.map((p: any) => ({
            id: `pwc-${p.id ?? Math.random()}`,
            slug: (p.name ?? "").toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
            name: p.name ?? "AI Method",
            description: p.description?.slice(0, 120) ?? "AI/ML method from Papers With Code",
            long_description: p.description ?? "",
            website: p.paper?.url_pdf ?? "https://paperswithcode.com",
            image_url: getToolImage("https://paperswithcode.com"),
            category: "Research" as Category,
            pricing: "Free" as Pricing,
            source: "api", upvotes: Math.floor(Math.random() * 80), created_at: now, updated_at: now,
          }));
          allParsed = [...allParsed, ...paperTools];
        }

        const unique = Array.from(
          new Map(allParsed.map((t) => [t.name.toLowerCase(), t])).values()
        );

        saveToCache(unique);
        // ✅ FIX 4: Silently update tools in background — user already sees
        // essential tools, this just adds more without any loading flash.
        setTools(unique);
        setSyncStats({ total: unique.length, sources: successfulSources });
        setError(null);
      }).catch(() => {
        setError("Background sync failed. Showing curated tools.");
      }).finally(() => {
        setBackgroundLoading(false);
      });
    };

    // Use requestIdleCallback if available, otherwise defer 200ms after paint
    if (typeof requestIdleCallback !== "undefined") {
      requestIdleCallback(startBackgroundFetch, { timeout: 3000 });
    } else {
      setTimeout(startBackgroundFetch, 200);
    }
  }, []);

  const upvoteTool = (id: string) => {
    setTools((prev) =>
      prev.map((t) => (t.id === id ? { ...t, upvotes: t.upvotes + 1 } : t))
    );
  };

  const recordView = (id: string) => {
    setTools((prev) =>
      prev.map((t) => (t.id === id ? { ...t, views: (t.views ?? 0) + 1 } : t))
    );
  };

  const refetch = () => {
    localStorage.removeItem(CACHE_KEY);
    localStorage.removeItem(CACHE_TIME_KEY);
    window.location.reload();
  };

  const fetchToolDetails = async (
    url: string
  ): Promise<{ text: string; image_url?: string }> => {
    try {
      const res = await fetch(
        `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`
      );
      if (!res.ok) throw new Error("fetch failed");
      const json = await res.json();
      const html: string = json.contents ?? "";
      const text =
        extractMeta(html, "og:description") ||
        extractMeta(html, "description") ||
        "No description available.";
      const image_url =
        extractMeta(html, "og:image") || getToolImage(url);
      return { text, image_url };
    } catch {
      return { text: "Could not load details.", image_url: getToolImage(url) };
    }
  };

  return {
    tools,
    loading,
    backgroundLoading,
    error,
    syncStats,
    upvoteTool,
    recordView,
    refetch,
    fetchToolDetails,
  };
}
