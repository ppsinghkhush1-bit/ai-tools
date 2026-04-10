import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
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
    const path = url.pathname.replace("/tools-api", "");

    if (path === "/tools" || path === "/" || path === "") {
      const { data, error } = await supabase
        .from("tools")
        .select("*")
        .order("upvotes", { ascending: false });

      if (error) return json({ error: error.message }, 500);
      return json({ tools: data, count: data?.length ?? 0 });
    }

    if (path === "/search") {
      const q = url.searchParams.get("q") || "";
      const { data, error } = await supabase
        .from("tools")
        .select("*")
        .or(`name.ilike.%${q}%,description.ilike.%${q}%`)
        .order("upvotes", { ascending: false });

      if (error) return json({ error: error.message }, 500);
      return json({ tools: data, count: data?.length ?? 0, query: q });
    }

    if (path.startsWith("/category/")) {
      const category = decodeURIComponent(path.replace("/category/", ""));
      const { data, error } = await supabase
        .from("tools")
        .select("*")
        .eq("category", category)
        .order("upvotes", { ascending: false });

      if (error) return json({ error: error.message }, 500);
      return json({ tools: data, count: data?.length ?? 0, category });
    }

    if (path.startsWith("/tools/")) {
      const id = path.replace("/tools/", "");
      const { data, error } = await supabase
        .from("tools")
        .select("*")
        .or(`id.eq.${id},slug.eq.${id}`)
        .maybeSingle();

      if (error) return json({ error: error.message }, 500);
      if (!data) return json({ error: "Tool not found" }, 404);
      return json({ tool: data });
    }

    if (path === "/trending") {
      const { data, error } = await supabase
        .from("tools")
        .select("*")
        .eq("is_trending", true)
        .order("upvotes", { ascending: false })
        .limit(10);

      if (error) return json({ error: error.message }, 500);
      return json({ tools: data });
    }

    if (path === "/featured") {
      const { data, error } = await supabase
        .from("tools")
        .select("*")
        .eq("is_featured", true)
        .order("upvotes", { ascending: false })
        .limit(6);

      if (error) return json({ error: error.message }, 500);
      return json({ tools: data });
    }

    if (path === "/stats") {
      const { data: tools } = await supabase.from("tools").select("category, pricing");
      const stats = {
        total: tools?.length ?? 0,
        by_category: tools?.reduce<Record<string, number>>((acc, t) => {
          acc[t.category] = (acc[t.category] || 0) + 1;
          return acc;
        }, {}),
        by_pricing: tools?.reduce<Record<string, number>>((acc, t) => {
          acc[t.pricing] = (acc[t.pricing] || 0) + 1;
          return acc;
        }, {}),
      };
      return json(stats);
    }

    return json({ error: "Not found", available_endpoints: [
      "GET /tools-api/tools",
      "GET /tools-api/tools/:id",
      "GET /tools-api/search?q=query",
      "GET /tools-api/category/:name",
      "GET /tools-api/trending",
      "GET /tools-api/featured",
      "GET /tools-api/stats",
    ]}, 404);

  } catch (err) {
    return json({ error: String(err) }, 500);
  }
});
