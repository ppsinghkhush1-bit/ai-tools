export type Category =
  | 'Image'
  | 'Video'
  | 'Writing'
  | 'Code'
  | 'Voice'
  | 'Productivity'
  | 'Business'
  | 'Automation'
  | 'Audio'
  | 'Research';

export type Pricing = 'Free' | 'Paid' | 'Freemium';

export type SortOption = 'popular' | 'newest' | 'free-first' | 'name';

export interface Tool {
  id: string;
  slug: string;
  name: string;
  description: string;
  long_description: string | null;
  website: string;
  category: Category;
  pricing: Pricing;
  logo: string | null; // Must be present
  tags: string[];      // Must be present
  source: 'scraped' | 'manual' | 'api';
  upvotes: number;
  is_trending: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface ToolFilters {
  search: string;
  category: Category | 'All';
  pricing: Pricing | 'All';
  sort: SortOption;
}