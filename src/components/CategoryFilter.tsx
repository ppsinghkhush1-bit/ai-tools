import { useRef } from 'react';
import {
  Image, Video, FileText, Code2, Mic, Brain,
  Briefcase, Zap, Music, Search, ChevronLeft, ChevronRight,
  DollarSign,
} from 'lucide-react';
import type { Category } from '../types';

interface CategoryFilterProps {
  selected: Category | 'All';
  onChange: (cat: Category | 'All') => void;
  counts: Record<string, number>;
  // Optional: pricing filter state passed from App
  pricing?: string;
  onPricingChange?: (p: string) => void;
}

const CATEGORIES: { value: Category | 'All'; label: string; icon: React.ElementType; color: string }[] = [
  { value: 'All',          label: 'All Tools',    icon: Brain,    color: '#00b4ff' },
  { value: 'Image',        label: 'Image',        icon: Image,    color: '#f472b6' },
  { value: 'Video',        label: 'Video',        icon: Video,    color: '#fb923c' },
  { value: 'Writing',      label: 'Writing',      icon: FileText, color: '#a3e635' },
  { value: 'Code',         label: 'Code',         icon: Code2,    color: '#34d399' },
  { value: 'Voice',        label: 'Voice',        icon: Mic,      color: '#f59e0b' },
  { value: 'Productivity', label: 'Productivity', icon: Zap,      color: '#60a5fa' },
  { value: 'Business',     label: 'Business',     icon: Briefcase,color: '#818cf8' },
  { value: 'Automation',   label: 'Automation',   icon: Zap,      color: '#c084fc' },
  { value: 'Audio',        label: 'Audio',        icon: Music,    color: '#f87171' },
  { value: 'Research',     label: 'Research',     icon: Search,   color: '#2dd4bf' },
];

const PRICING_OPTIONS: { value: string; label: string; color: string }[] = [
  { value: 'All',      label: 'All',      color: '#9ca3af' },
  { value: 'Free',     label: 'Free',     color: '#34d399' },
  { value: 'Freemium', label: 'Freemium', color: '#60a5fa' },
  { value: 'Paid',     label: 'Paid',     color: '#f59e0b' },
];

export function CategoryFilter({
  selected,
  onChange,
  counts,
  pricing = 'All',
  onPricingChange,
}: CategoryFilterProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir === 'left' ? -200 : 200, behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-3">
      {/* ── Category row with arrow buttons ── */}
      <div className="relative flex items-center gap-1">
        {/* Left arrow */}
        <button
          onClick={() => scroll('left')}
          className="flex-shrink-0 p-1.5 rounded-lg text-gray-500 hover:text-gray-200 hover:bg-white/08 transition-colors"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Scrollable pill strip */}
        <div
          ref={scrollRef}
          className="flex gap-2 overflow-x-auto pb-1"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {CATEGORIES.map(({ value, label, icon: Icon, color }) => {
            const isActive = selected === value;
            const count =
              value === 'All'
                ? Object.values(counts).reduce((a, b) => a + b, 0)
                : counts[value] || 0;

            return (
              <button
                key={value}
                onClick={() => onChange(value)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 flex-shrink-0 ${
                  isActive ? 'text-white' : 'text-gray-400 hover:text-white'
                }`}
                style={
                  isActive
                    ? {
                        background: `${color}20`,
                        border: `1px solid ${color}50`,
                        boxShadow: `0 0 16px ${color}20`,
                      }
                    : {
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.07)',
                      }
                }
              >
                <Icon
                  className="w-4 h-4 flex-shrink-0"
                  style={{ color: isActive ? color : undefined }}
                />
                {label}
                {count > 0 && (
                  <span
                    className="text-[11px] px-1.5 py-0.5 rounded-full"
                    style={{
                      background: isActive ? `${color}30` : 'rgba(255,255,255,0.08)',
                      color: isActive ? color : '#6b7280',
                    }}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Right arrow */}
        <button
          onClick={() => scroll('right')}
          className="flex-shrink-0 p-1.5 rounded-lg text-gray-500 hover:text-gray-200 transition-colors"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
          aria-label="Scroll right"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* ── Pricing filter row (only shown if handler provided) ── */}
      {onPricingChange && (
        <div className="flex items-center gap-2">
          <DollarSign className="w-3.5 h-3.5 text-gray-600 flex-shrink-0" />
          <div className="flex gap-2 flex-wrap">
            {PRICING_OPTIONS.map(({ value, label, color }) => {
              const isActive = pricing === value;
              return (
                <button
                  key={value}
                  onClick={() => onPricingChange(value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                    isActive ? 'text-white' : 'text-gray-500 hover:text-gray-300'
                  }`}
                  style={
                    isActive
                      ? {
                          background: `${color}20`,
                          border: `1px solid ${color}50`,
                          boxShadow: `0 0 10px ${color}15`,
                        }
                      : {
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px solid rgba(255,255,255,0.07)',
                        }
                  }
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}