import { TrendingUp, ExternalLink, Flame } from 'lucide-react';
import type { Tool } from '../types';
import { useState, memo, useMemo } from 'react';

interface TrendingSectionProps {
  tools: Tool[];
  onSelectTool: (tool: Tool) => void;
}

const SmallLogo = memo(function SmallLogo({
  logo,
  name,
}: {
  logo?: string | null;
  name: string;
}) {
  const [err, setErr] = useState(false);
  const hue = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;

  if (logo && !err) {
    return (
      <img
        src={logo}
        alt={name}
        className="w-9 h-9 rounded-xl object-contain flex-shrink-0"
        style={{ background: 'rgba(255,255,255,0.05)' }}
        onError={() => setErr(true)}
      />
    );
  }

  return (
    <div
      className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
      style={{ background: `hsl(${hue},60%,38%)` }}
    >
      {name.slice(0, 2).toUpperCase()}
    </div>
  );
});

// Medal colors for top 3
const RANK_STYLES: Record<number, { gradient: string; glow: string }> = {
  0: { gradient: 'linear-gradient(135deg,#f59e0b,#fbbf24)', glow: 'rgba(245,158,11,0.3)' },
  1: { gradient: 'linear-gradient(135deg,#9ca3af,#d1d5db)', glow: 'rgba(156,163,175,0.25)' },
  2: { gradient: 'linear-gradient(135deg,#b45309,#d97706)', glow: 'rgba(180,83,9,0.25)' },
};

export const TrendingSection = memo(function TrendingSection({
  tools,
  onSelectTool,
}: TrendingSectionProps) {
  // Sort by upvotes descending, take top 6
  const trending = useMemo(
    () =>
      [...tools]
        .sort((a, b) => (b.upvotes ?? 0) - (a.upvotes ?? 0))
        .slice(0, 6),
    [tools]
  );

  if (!trending.length) return null;

  return (
    <section className="py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: 'rgba(251,191,36,0.12)',
              border: '1px solid rgba(251,191,36,0.25)',
            }}
          >
            <TrendingUp className="w-4 h-4 text-yellow-400" />
          </div>
          <h2 className="text-xl font-bold text-white">Trending Now</h2>
          <span
            className="text-xs px-2 py-0.5 rounded-full font-medium text-yellow-400"
            style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)' }}
          >
            Top 6
          </span>
          <div
            className="flex-1 h-px"
            style={{ background: 'linear-gradient(90deg,rgba(255,255,255,0.07),transparent)' }}
          />
        </div>

        {/* 6-card grid — 2 cols on mobile, 3 on md, 6 on xl */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
          {trending.map((tool, i) => {
            const rankStyle = RANK_STYLES[i];
            const isTop3 = i < 3;

            return (
              <button
                key={tool.id}
                onClick={() => onSelectTool(tool)}
                aria-label={`View ${tool.name}`}
                className="relative flex flex-col items-center gap-2 p-4 rounded-2xl text-center w-full transition-all duration-200 group hover:scale-105 active:scale-95"
                style={{
                  background: isTop3
                    ? 'rgba(255,255,255,0.06)'
                    : 'rgba(255,255,255,0.03)',
                  border: isTop3
                    ? '1px solid rgba(255,255,255,0.12)'
                    : '1px solid rgba(255,255,255,0.07)',
                  boxShadow: isTop3 ? `0 0 20px ${rankStyle.glow}` : 'none',
                }}
              >
                {/* Rank badge */}
                <div
                  className="absolute -top-2 -left-2 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black text-white shadow-lg"
                  style={{
                    background: rankStyle
                      ? rankStyle.gradient
                      : 'rgba(255,255,255,0.12)',
                  }}
                >
                  {i + 1}
                </div>

                {/* Flame icon for #1 */}
                {i === 0 && (
                  <Flame
                    className="absolute -top-2 -right-2 w-4 h-4 text-orange-400"
                    fill="currentColor"
                  />
                )}

                {/* Logo */}
                <SmallLogo
                  logo={tool.image_url ?? (tool as any).logo}
                  name={tool.name}
                />

                {/* Name */}
                <div className="font-semibold text-white text-xs leading-tight line-clamp-2 group-hover:text-blue-300 transition-colors w-full">
                  {tool.name}
                </div>

                {/* Category */}
                <div className="text-[10px] text-gray-500 truncate w-full">
                  {tool.category}
                </div>

                {/* Upvote count */}
                <div
                  className="flex items-center gap-1 text-[10px] font-medium mt-auto"
                  style={{ color: isTop3 ? '#a855f7' : '#6b7280' }}
                >
                  <TrendingUp className="w-3 h-3" />
                  {tool.upvotes ?? 0}
                </div>

                {/* Hover: visit icon */}
                <ExternalLink
                  className="absolute bottom-2 right-2 w-3 h-3 text-gray-600 group-hover:text-blue-400 transition-colors opacity-0 group-hover:opacity-100"
                />
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
});