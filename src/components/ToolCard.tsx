import { useState } from "react";
import {
  Heart,
  ArrowUp,
  TrendingUp,
  Star,
} from "lucide-react";
import type { Tool, Category, Pricing } from "../types";

/* ================= TYPES ================= */
interface ToolCardProps {
  tool: Tool;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onUpvote: (id: string) => void;
  onSelect: (tool: Tool) => void;
}

/* ================= SEO STRUCTURED DATA ================= */
function ToolStructuredData({ tool }: { tool: Tool }) {
  const schema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.name,
    applicationCategory: tool.category,
    description: tool.description,
    url: tool.website || "",
  });

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: schema }}
    />
  );
}

/* ================= STYLES ================= */
const PRICING_STYLES: Record<Pricing, string> = {
  Free: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
  Freemium: "bg-blue-500/15 text-blue-400 border border-blue-500/30",
  Paid: "bg-amber-500/15 text-amber-400 border border-amber-500/30",
  Unknown: "bg-gray-500/15 text-gray-400 border border-gray-500/30",
};

const CATEGORY_STYLES: Record<Category, string> = {
  Image: "bg-pink-500/15 text-pink-400",
  Video: "bg-red-500/15 text-red-400",
  Writing: "bg-indigo-500/15 text-indigo-400",
  Code: "bg-purple-500/15 text-purple-400",
  Voice: "bg-sky-500/15 text-sky-400",
  Productivity: "bg-lime-500/15 text-lime-400",
  Business: "bg-yellow-500/15 text-yellow-400",
  Automation: "bg-orange-500/15 text-orange-400",
  Audio: "bg-cyan-500/15 text-cyan-400",
  Research: "bg-teal-500/15 text-teal-400",
};

/* ================= IMAGE ================= */
function getImageSrc(tool: Tool): string {
  const src = tool.logo || tool.image_url || "";
  if (src) return src;

  try {
    if (!tool.website) return "";
    const domain = new URL(tool.website).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
  } catch {
    return "";
  }
}

function ToolAvatar({ tool }: { tool: Tool }) {
  const [imgSrc, setImgSrc] = useState<string>(getImageSrc(tool));
  const [failed, setFailed] = useState(false);

  const handleError = () => {
    try {
      if (!tool.website) return setFailed(true);
      const domain = new URL(tool.website).hostname;
      const fallback = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
      if (imgSrc !== fallback) {
        setImgSrc(fallback);
        return;
      }
    } catch {}
    setFailed(true);
  };

  if (!failed && imgSrc) {
    return (
      <img
        src={imgSrc}
        alt={`${tool.name} AI tool for ${tool.category}`}
        title={`${tool.name} - ${tool.category}`}
        className="w-10 h-10 rounded-xl object-contain bg-gray-700/30 shrink-0"
        loading="lazy"
        onError={handleError}
      />
    );
  }

  return (
    <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-white font-bold shrink-0">
      {tool.name.charAt(0).toUpperCase()}
    </div>
  );
}

/* ================= MAIN CARD ================= */
// ✅ Local modal completely removed — clicking a card fires onSelect()
// which opens the single global ToolModal managed in App.tsx.
// This fixes the double-modal / expand-in-grid bug.
export function ToolCard({
  tool,
  isFavorite,
  onToggleFavorite,
  onUpvote,
  onSelect,
}: ToolCardProps) {
  return (
    <div
      className="rounded-2xl border border-gray-700/40 bg-gray-800/30 hover:bg-gray-800/60 hover:border-purple-500/40 transition-all duration-200 cursor-pointer flex flex-col p-5 gap-3 min-h-[220px]"
      onClick={() => onSelect(tool)}
    >
      <ToolStructuredData tool={tool} />

      <div className="flex items-start gap-3">
        <ToolAvatar tool={tool} />

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-100 text-sm truncate">
            <a
              href={`/tool/${tool.id}`}
              onClick={(e) => e.stopPropagation()}
              className="hover:text-purple-400"
            >
              {tool.name}
            </a>
          </h3>

          <div className="flex flex-wrap gap-2 mt-1">
            <span className={`text-xs px-2 py-0.5 rounded-full ${CATEGORY_STYLES[tool.category]}`}>
              {tool.category}
            </span>

            {tool.is_trending && (
              <span className="text-xs text-rose-400 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Trending
              </span>
            )}
          </div>
        </div>

        {tool.is_featured && (
          <Star className="w-4 h-4 text-amber-400 shrink-0" fill="currentColor" />
        )}
      </div>

      <p className="text-gray-400 text-xs line-clamp-3 flex-1">
        {tool.description}
      </p>

      <div className="flex items-center justify-between mt-auto">
        <span className={`text-xs px-2 py-0.5 rounded-full ${PRICING_STYLES[tool.pricing]}`}>
          {tool.pricing}
        </span>

        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onUpvote(tool.id);
            }}
            className="text-xs text-gray-400 hover:text-purple-400 px-2 py-1"
          >
            <ArrowUp className="w-3 h-3 inline mr-1" />
            {tool.upvotes}
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(tool.id);
            }}
            className={`p-1.5 rounded-lg ${
              isFavorite
                ? "text-pink-400 bg-pink-500/10"
                : "text-gray-500 hover:text-pink-400"
            }`}
          >
            <Heart
              className="w-3.5 h-3.5"
              fill={isFavorite ? "currentColor" : "none"}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
