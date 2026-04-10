import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

interface ScrapedTool {
  name: string;
  description: string;
  website: string;
  category: string;
  pricing: string;
  logo: string;
  tags: string[];
}

async function scrapeProductHunt(): Promise<ScrapedTool[]> {
  const tools: ScrapedTool[] = [];
  try {
    const res = await fetch(
      "https://api.producthunt.com/v2/api/graphql",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `{ posts(topic: "artificial-intelligence", first: 10) { edges { node { name tagline website thumbnail { url } } } } }`,
        }),
      }
    );
    if (res.ok) {
      const data = await res.json();
      const posts = data?.data?.posts?.edges || [];
      for (const { node } of posts) {
        tools.push({
          name: node.name,
          description: node.tagline,
          website: node.website || "",
          category: "Productivity",
          pricing: "Freemium",
          logo: node.thumbnail?.url || "",
          tags: ["ai", "product-hunt"],
        });
      }
    }
  } catch {
  }
  return tools;
}

async function enrichTool(tool: ScrapedTool): Promise<ScrapedTool> {
  const categories = ["Image", "Video", "Writing", "Code", "Voice", "Productivity", "Business", "Automation", "Audio", "Research"];
  const desc = (tool.description + " " + tool.name).toLowerCase();

  let category = "Productivity";
  if (desc.includes("image") || desc.includes("photo") || desc.includes("art") || desc.includes("visual")) category = "Image";
  else if (desc.includes("video") || desc.includes("film") || desc.includes("clip")) category = "Video";
  else if (desc.includes("write") || desc.includes("writing") || desc.includes("copy") || desc.includes("content") || desc.includes("text")) category = "Writing";
  else if (desc.includes("code") || desc.includes("develop") || desc.includes("program") || desc.includes("github")) category = "Code";
  else if (desc.includes("voice") || desc.includes("speech") || desc.includes("audio") || desc.includes("tts")) category = "Voice";
  else if (desc.includes("music") || desc.includes("song") || desc.includes("sound")) category = "Audio";
  else if (desc.includes("search") || desc.includes("research") || desc.includes("data")) category = "Research";
  else if (desc.includes("automat") || desc.includes("workflow") || desc.includes("integr")) category = "Automation";
  else if (desc.includes("business") || desc.includes("sales") || desc.includes("market")) category = "Business";

  let pricing = "Freemium";
  if (desc.includes("free") && !desc.includes("paid") && !desc.includes("premium")) pricing = "Free";
  else if (desc.includes("paid") || desc.includes("subscription") || desc.includes("pricing")) pricing = "Paid";

  const tags: string[] = ["ai", "tool"];
  if (category.toLowerCase() !== "productivity") tags.push(category.toLowerCase());

  return { ...tool, category, pricing, tags };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const url = new URL(req.url);
    const path = url.pathname.replace("/scraper", "");

    if (path === "/run" && req.method === "POST") {
      const scraped = await scrapeProductHunt();
      const enriched = await Promise.all(scraped.map(enrichTool));

      const { data: existing } = await supabase.from("tools").select("slug");
      const existingSlugs = new Set(existing?.map((t: { slug: string }) => t.slug) || []);

      const newTools = enriched
        .filter(t => t.name && t.website)
        .map(t => ({ ...t, slug: slugify(t.name) }))
        .filter(t => !existingSlugs.has(t.slug));

      if (newTools.length === 0) {
        return json({ message: "No new tools found", scraped: scraped.length, added: 0 });
      }

      const toInsert = newTools.map(t => ({
        slug: t.slug,
        name: t.name,
        description: t.description.substring(0, 500),
        website: t.website,
        category: t.category,
        pricing: t.pricing,
        logo: t.logo,
        tags: t.tags,
        source: "scraped",
        upvotes: 0,
        is_featured: false,
        is_trending: false,
      }));

      const { data: inserted, error } = await supabase.from("tools").insert(toInsert).select("id, name");
      if (error) return json({ error: error.message }, 500);

      return json({
        message: "Scrape completed",
        scraped: scraped.length,
        added: inserted?.length ?? 0,
        tools: inserted,
      });
    }

    if (path === "/status" || path === "" || path === "/") {
      const { data } = await supabase
        .from("tools")
        .select("source")
        .order("created_at", { ascending: false });

      const counts = (data || []).reduce<Record<string, number>>((acc, t) => {
        acc[t.source] = (acc[t.source] || 0) + 1;
        return acc;
      }, {});

      return json({
        status: "ready",
        tool_counts_by_source: counts,
        total: data?.length ?? 0,
        endpoints: {
          run: "POST /scraper/run — trigger a scrape",
          status: "GET /scraper/status — view scraper status",
        },
      });
    }

    return json({ error: "Not found" }, 404);

  } catch (err) {
    return json({ error: String(err) }, 500);
  }
});
