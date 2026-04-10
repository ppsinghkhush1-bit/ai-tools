import { useEffect, useState } from "react";
import {
  Heart,
  ArrowUp,
  ExternalLink,
  X,
  Star,
  TrendingUp,
} from "lucide-react";
import type { Tool, Category, Pricing } from "../types";

interface ToolCardProps {
  tool: Tool;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onUpvote: (id: string) => void;
  onSelect: (tool: Tool) => void;
}

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

// ✅ FIXED: Resolves image from logo OR image_url, with Google S2 as backup
function getImageSrc(tool: Tool): string {
  // Use logo first, then image_url (set by useTools.ts)
  const src = tool.logo || tool.image_url || "";
  if (src) return src;

  // Final fallback: Google favicon service
  try {
    const domain = new URL(tool.website).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
  } catch {
    return "";
  }
}

// ✅ Avatar shown only when ALL image sources fail
function ToolAvatar({ tool }: { tool: Tool }) {
  const [imgSrc, setImgSrc] = useState<string>(getImageSrc(tool));
  const [failed, setFailed] = useState(false);

  // Try Google S2 as second fallback when primary fails
  const handleError = () => {
    try {
      const domain = new URL(tool.website).hostname;
      const googleFavicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
      if (imgSrc !== googleFavicon) {
        setImgSrc(googleFavicon);
        return;
      }
    } catch {}
    setFailed(true);
  };

  if (!failed && imgSrc) {
    return (
      <img
        src={imgSrc}
        alt={tool.name}
        className="w-10 h-10 rounded-xl object-contain bg-gray-700/30 shrink-0"
        loading="lazy"
        onError={handleError}
      />
    );
  }

  // Letter avatar — only shown if all image sources fail
  return (
    <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-white font-bold shrink-0">
      {tool.name.charAt(0).toUpperCase()}
    </div>
  );
}

function ToolModal({
  tool,
  isFavorite,
  onClose,
  onToggleFavorite,
  onUpvote,
}: {
  tool: Tool;
  isFavorite: boolean;
  onClose: () => void;
  onToggleFavorite: (id: string) => void;
  onUpvote: (id: string) => void;
}) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl bg-[#111827] border border-white/10 p-6 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            {/* ✅ FIXED: modal also uses ToolAvatar */}
            <ToolAvatar tool={tool} />
            <div>
              <h2 className="text-2xl font-bold">{tool.name}</h2>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className={`text-xs px-2 py-1 rounded-full ${CATEGORY_STYLES[tool.category]}`}>
                  {tool.category}
                </span>
                <span className={`text-xs px-2 py-1 rounded-full ${PRICING_STYLES[tool.pricing]}`}>
                  {tool.pricing}
                </span>
                {tool.is_featured && (
                  <span className="text-xs px-2 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    Featured
                  </span>
                )}
                {tool.is_trending && (
                  <span className="text-xs px-2 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    Trending
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-gray-300 mb-4 leading-relaxed">
          {tool.long_description ?? tool.description}
        </p>

        {tool.tags && tool.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {tool.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-1 rounded-full bg-white/5 text-gray-300 border border-white/10"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="text-sm text-gray-400 mb-6 space-y-1">
          <div>🌐 <a href={tool.website} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">{tool.website}</a></div>
          <div>💰 Pricing: {tool.pricing}</div>
          <div>🔥 Upvotes: {tool.upvotes}</div>
        </div>

        <div className="flex flex-wrap gap-3">
          <a
            href={tool.website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-medium"
          >
            <ExternalLink className="w-4 h-4" />
            Visit Now
          </a>

          <button
            type="button"
            onClick={() => onUpvote(tool.id)}
            className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-200"
          >
            <ArrowUp className="w-4 h-4 inline mr-2" />
            {tool.upvotes}
          </button>

          <button
            type="button"
            onClick={() => onToggleFavorite(tool.id)}
            className={`px-4 py-3 rounded-xl border ${
              isFavorite
                ? "text-pink-400 bg-pink-500/10 border-pink-500/20"
                : "text-gray-200 bg-white/5 border-white/10"
            }`}
          >
            <Heart
              className="w-4 h-4 inline mr-2"
              fill={isFavorite ? "currentColor" : "none"}
            />
            {isFavorite ? "Favorited" : "Favorite"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function ToolCard({
  tool,
  isFavorite,
  onToggleFavorite,
  onUpvote,
  onSelect,
}: ToolCardProps) {
  const [modalOpen, setModalOpen] = useState(false);

  const handleCardClick = () => {
    setModalOpen(true);
    onSelect(tool);
  };

  return (
    <>
      <div
        className="rounded-2xl border border-gray-700/40 bg-gray-800/30 hover:bg-gray-800/60 hover:border-purple-500/40 transition-all duration-200 cursor-pointer flex flex-col p-5 gap-3 min-h-[220px]"
        onClick={handleCardClick}
      >
        <div className="flex items-start gap-3">
          {/* ✅ FIXED: Use ToolAvatar instead of checking tool.logo only */}
          <ToolAvatar tool={tool} />

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-100 text-sm truncate">{tool.name}</h3>
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
              type="button"
              className="text-xs text-gray-400 hover:text-purple-400 px-2 py-1"
              onClick={(e) => {
                e.stopPropagation();
                onUpvote(tool.id);
              }}
            >
              <ArrowUp className="w-3 h-3 inline mr-1" />
              {tool.upvotes}
            </button>

            <button
              type="button"
              className={`p-1.5 rounded-lg ${
                isFavorite
                  ? "text-pink-400 bg-pink-500/10"
                  : "text-gray-500 hover:text-pink-400"
              }`}
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(tool.id);
              }}
            >
              <Heart
                className="w-3.5 h-3.5"
                fill={isFavorite ? "currentColor" : "none"}
              />
            </button>
          </div>
        </div>
      </div>

      {modalOpen && (
        <ToolModal
          tool={tool}
          isFavorite={isFavorite}
          onClose={() => setModalOpen(false)}
          onToggleFavorite={onToggleFavorite}
          onUpvote={onUpvote}
        />
      )}
    </>
  );
}