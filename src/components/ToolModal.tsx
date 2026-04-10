import { useState, useEffect } from 'react';
import {
  X,
  ExternalLink,
  Heart,
  ThumbsUp,
  Tag,
  Globe,
  TrendingUp,
  Star,
} from 'lucide-react';
import type { Tool } from '../types';

interface ToolModalProps {
  tool: Tool | null;
  isFavorite: boolean;
  onClose: () => void;
  onToggleFavorite: (id: string) => void;
  onUpvote: (id: string) => void;
  onRecordView: (id: string) => void;
}

function ToolLogo({ logo, name }: { logo: string | null; name: string }) {
  const [imgError, setImgError] = useState(false);

  if (logo && !imgError) {
    return (
      <img
        src={logo}
        alt={name}
        className="w-16 h-16 rounded-2xl object-contain"
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div
      className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-2xl"
      style={{ background: 'linear-gradient(135deg, #00b4ff, #a855f7)' }}
    >
      {name.slice(0, 2).toUpperCase()}
    </div>
  );
}

const pricingColors: Record<string, string> = {
  Free: '#4ade80',
  Paid: '#f87171',
  Freemium: '#fbbf24',
};

export function ToolModal({
  tool,
  isFavorite,
  onClose,
  onToggleFavorite,
  onUpvote,
  onRecordView,
}: ToolModalProps) {
  const [upvoted, setUpvoted] = useState(false);

  useEffect(() => {
    if (!tool) return;

    setUpvoted(false);
    onRecordView(tool.id);
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = '';
    };
  }, [tool, onRecordView]);

  useEffect(() => {
    if (!tool) return;

    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [tool, onClose]);

  if (!tool) return null;

  const pricingColor = pricingColors[tool.pricing] ?? '#94a3b8';

  function handleUpvote() {
    if (upvoted) return;
    setUpvoted(true);
    onUpvote(tool.id);
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="tool-modal-title"
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl animate-scale-in"
        style={{
          background: 'rgba(10,10,26,0.95)',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow:
            '0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,180,255,0.1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
          <div
            className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-10"
            style={{ background: '#00b4ff', filter: 'blur(60px)' }}
          />
          <div
            className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full opacity-10"
            style={{ background: '#a855f7', filter: 'blur(60px)' }}
          />
        </div>

        <div className="relative p-6 sm:p-8">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="absolute top-4 right-4 p-2 rounded-xl text-gray-500 hover:text-white hover:bg-white/10 transition-all z-10"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-start gap-4 mb-6">
            <div
              className="p-1.5 rounded-2xl"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <ToolLogo logo={tool.logo} name={tool.name} />
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-1.5">
                <h2 id="tool-modal-title" className="text-2xl font-bold text-white">
                  {tool.name}
                </h2>

                {tool.is_trending && (
                  <span
                    className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
                    style={{
                      background: 'rgba(251,191,36,0.15)',
                      border: '1px solid rgba(251,191,36,0.3)',
                      color: '#fbbf24',
                    }}
                  >
                    <TrendingUp className="w-3 h-3" />
                    Trending
                  </span>
                )}

                {tool.is_featured && (
                  <span
                    className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
                    style={{
                      background: 'rgba(0,180,255,0.15)',
                      border: '1px solid rgba(0,180,255,0.3)',
                      color: '#00b4ff',
                    }}
                  >
                    <Star className="w-3 h-3" />
                    Featured
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <span className="category-tag">{tool.category}</span>
                <span
                  className="text-xs font-semibold px-2.5 py-1 rounded-full"
                  style={{
                    background: `${pricingColor}20`,
                    border: `1px solid ${pricingColor}40`,
                    color: pricingColor,
                  }}
                >
                  {tool.pricing}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">
                About
              </h3>
              <p className="text-gray-300 leading-relaxed">
                {tool.long_description || tool.description}
              </p>
            </div>

            {(tool.tags?.length ?? 0) > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {tool.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-3 py-1.5 rounded-xl text-gray-400"
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.08)',
                      }}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-3 gap-3">
              <div className="stat-card">
                <ThumbsUp className="w-4 h-4 text-neon-blue mx-auto mb-1" />
                <div className="text-lg font-bold text-white">
                  {tool.upvotes + (upvoted ? 1 : 0)}
                </div>
                <div className="text-[11px] text-gray-500">Upvotes</div>
              </div>

              <div className="stat-card">
                <Globe className="w-4 h-4 text-neon-purple mx-auto mb-1" />
                <div className="text-lg font-bold text-white capitalize">
                  {tool.source}
                </div>
                <div className="text-[11px] text-gray-500">Source</div>
              </div>

              <div className="stat-card">
                <Star className="w-4 h-4 text-yellow-400 mx-auto mb-1" />
                <div className="text-lg font-bold text-white">{tool.pricing}</div>
                <div className="text-[11px] text-gray-500">Pricing</div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <a
                href={tool.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 btn-primary text-white flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold"
              >
                <ExternalLink className="w-4 h-4" />
                Visit {tool.name}
              </a>

              <button
                type="button"
                onClick={handleUpvote}
                className={`flex items-center gap-2 px-4 py-3.5 rounded-xl text-sm font-medium transition-all ${
                  upvoted
                    ? 'text-neon-blue border border-neon-blue/30 bg-blue-500/10'
                    : 'text-gray-400 hover:text-white border border-white/10 hover:border-white/20 bg-white/5'
                }`}
              >
                <ThumbsUp className="w-4 h-4" />
                {upvoted ? 'Upvoted' : 'Upvote'}
              </button>

              <button
                type="button"
                onClick={() => onToggleFavorite(tool.id)}
                aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                className={`p-3.5 rounded-xl transition-all border ${
                  isFavorite
                    ? 'text-red-400 bg-red-500/10 border-red-500/30'
                    : 'text-gray-400 hover:text-red-400 border-white/10 hover:border-red-500/20 bg-white/5'
                }`}
              >
                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}