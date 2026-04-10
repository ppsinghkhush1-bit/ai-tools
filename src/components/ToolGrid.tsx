import React from "react";
import { ToolCard } from './ToolCard';
import type { Tool } from '../types';
import { Bot } from 'lucide-react';

interface ToolGridProps {
  tools: Tool[];
  loading: boolean;
  favorites: Set<string>;
  onToggleFavorite: (id: string) => void;
  onUpvote: (id: string) => void;
  onSelectTool: (tool: Tool) => void;
}

// Per-card error boundary so one bad card never blanks the whole grid
class CardErrorBoundary extends React.Component<
  { children: React.ReactNode; name: string },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; name: string }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="card-tool p-5 flex items-center justify-center text-gray-600 text-sm min-h-[160px]">
          {this.props.name || "Tool"} unavailable
        </div>
      );
    }
    return this.props.children;
  }
}

function SkeletonCard() {
  return (
    <div className="card-tool p-5 cursor-default">
      <div className="flex items-start gap-3 mb-4">
        <div className="skeleton w-14 h-14 rounded-xl flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-4 rounded-lg w-3/4" />
          <div className="flex gap-2">
            <div className="skeleton h-5 rounded-full w-16" />
            <div className="skeleton h-5 rounded-full w-14" />
          </div>
        </div>
      </div>
      <div className="space-y-2 mb-4">
        <div className="skeleton h-3 rounded w-full" />
        <div className="skeleton h-3 rounded w-5/6" />
      </div>
      <div className="flex gap-2 mb-4">
        <div className="skeleton h-5 rounded-md w-16" />
        <div className="skeleton h-5 rounded-md w-12" />
      </div>
      <div
        className="flex justify-between pt-3"
        style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
      >
        <div className="flex gap-2">
          <div className="skeleton h-8 rounded-lg w-20" />
          <div className="skeleton h-8 rounded-lg w-8" />
        </div>
        <div className="skeleton h-8 rounded-lg w-16" />
      </div>
    </div>
  );
}

export function ToolGrid({
  tools,
  loading,
  favorites,
  onToggleFavorite,
  onUpvote,
  onSelectTool,
}: ToolGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 9 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (!Array.isArray(tools) || tools.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <Bot className="w-8 h-8 text-gray-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-400 mb-2">No tools found</h3>
        <p className="text-sm text-gray-600 max-w-xs">
          Try adjusting your search or filters to discover more AI tools.
        </p>
      </div>
    );
  }

  // App.tsx handles pagination and passes already-sliced tools.
  // Do NOT re-paginate here — just render what we receive.
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {tools.map((tool, i) => (
        <div
          key={tool.id}
          className="animate-slide-up"
          style={{ animationDelay: `${Math.min(i, 8) * 0.04}s` }}
        >
          <CardErrorBoundary name={tool.name}>
            <ToolCard
              tool={tool}
              isFavorite={favorites.has(tool.id)}
              onToggleFavorite={onToggleFavorite}
              onUpvote={onUpvote}
              onSelect={onSelectTool}
            />
          </CardErrorBoundary>
        </div>
      ))}
    </div>
  );
}