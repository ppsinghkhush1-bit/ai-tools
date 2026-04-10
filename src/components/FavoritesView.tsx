import { Heart } from 'lucide-react';
import { ToolCard } from './ToolCard';
import type { Tool } from '../types';

interface FavoritesViewProps {
  tools: Tool[];
  favorites: Set<string>;
  onToggleFavorite: (id: string) => void;
  onUpvote: (id: string) => void;
  onSelectTool: (tool: Tool) => void;
  onExplore: () => void;
}

export function FavoritesView({ tools, favorites, onToggleFavorite, onUpvote, onSelectTool, onExplore }: FavoritesViewProps) {
  const favoriteTools = tools.filter(t => favorites.has(t.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(248,113,113,0.15)', border: '1px solid rgba(248,113,113,0.3)' }}>
          <Heart className="w-5 h-5 text-red-400 fill-current" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">My Favorites</h1>
          <p className="text-sm text-gray-500 mt-0.5">{favoriteTools.length} tool{favoriteTools.length !== 1 ? 's' : ''} saved</p>
        </div>
      </div>

      {favoriteTools.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <Heart className="w-10 h-10 text-gray-700" />
          </div>
          <h3 className="text-xl font-semibold text-gray-400 mb-2">No favorites yet</h3>
          <p className="text-gray-600 max-w-xs mb-6">
            Browse AI tools and click the heart icon to save your favorites here.
          </p>
          <button
            onClick={onExplore}
            className="btn-primary text-white px-6 py-3 rounded-xl"
          >
            Explore Tools
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {favoriteTools.map((tool, i) => (
            <div key={tool.id} className="animate-slide-up" style={{ animationDelay: `${i * 0.04}s` }}>
              <ToolCard
                tool={tool}
                isFavorite={true}
                onToggleFavorite={onToggleFavorite}
                onUpvote={onUpvote}
                onClick={onSelectTool}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
