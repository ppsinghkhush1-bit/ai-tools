import { Search, X, SlidersHorizontal } from 'lucide-react';
import type { ToolFilters, SortOption } from '../types';

interface SearchBarProps {
  filters: ToolFilters;
  onFiltersChange: (f: Partial<ToolFilters>) => void;
  resultCount: number;
}

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'popular', label: 'Most Popular' },
  { value: 'newest', label: 'Newest First' },
  { value: 'free-first', label: 'Free First' },
  { value: 'name', label: 'A-Z' },
];

export function SearchBar({ filters, onFiltersChange, resultCount }: SearchBarProps) {
  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
        <input
          type="text"
          value={filters.search}
          onChange={e => onFiltersChange({ search: e.target.value })}
          placeholder="Search AI tools by name, category, or use case..."
          className="input-search"
        />
        {filters.search && (
          <button
            onClick={() => onFiltersChange({ search: '' })}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-lg text-gray-500 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <SlidersHorizontal className="w-4 h-4" />
          <span>{resultCount} tool{resultCount !== 1 ? 's' : ''} found</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-600 hidden sm:block">Sort:</span>
          <select
            value={filters.sort}
            onChange={e => onFiltersChange({ sort: e.target.value as SortOption })}
            className="text-sm rounded-xl px-3 py-2 text-gray-300 outline-none transition-all cursor-pointer"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            {sortOptions.map(opt => (
              <option key={opt.value} value={opt.value}
                style={{ background: '#0f0f24' }}>
                {opt.label}
              </option>
            ))}
          </select>

          <select
            value={filters.pricing}
            onChange={e => onFiltersChange({ pricing: e.target.value as ToolFilters['pricing'] })}
            className="text-sm rounded-xl px-3 py-2 text-gray-300 outline-none transition-all cursor-pointer"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            {['All', 'Free', 'Freemium', 'Paid'].map(p => (
              <option key={p} value={p} style={{ background: '#0f0f24' }}>{p}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
