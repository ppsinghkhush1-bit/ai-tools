import { useState, useCallback, useRef, useMemo, lazy, Suspense } from "react";
import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { SearchBar } from "./components/SearchBar";
import { CategoryFilter } from "./components/CategoryFilter";
import { ToolGrid } from "./components/ToolGrid";
import { TrendingSection } from "./components/TrendingSection";
import { Footer } from "./components/Footer";
import { useTools } from "./hooks/useTools";
import { useFavorites } from "./hooks/useFavorites";
import type { Tool, ToolFilters, Category } from "./types";

// ✅ FIX: .then(m => ({ default: m.X })) handles named exports with lazy()
const ToolModal = lazy(() =>
  import("./components/ToolModal").then((m) => ({ default: m.ToolModal }))
);
const FavoritesView = lazy(() =>
  import("./components/FavoritesView").then((m) => ({ default: m.FavoritesView }))
);
const AdminPanel = lazy(() =>
  import("./components/AdminPanel").then((m) => ({ default: m.AdminPanel }))
);

const PAGE_SIZE = 12;

const defaultFilters: ToolFilters = {
  search: "",
  category: "All",
  pricing: "All",
  sort: "popular",
};

type View = "home" | "favorites" | "admin";

function getFaviconUrl(website: string): string {
  try {
    return `https://icons.duckduckgo.com/ip3/${new URL(website).hostname}.ico`;
  } catch {
    return "/placeholder-tool.svg";
  }
}

export default function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [currentView, setCurrentView] = useState<View>("home");
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [filters, setFilters] = useState<ToolFilters>(defaultFilters);
  const [page, setPage] = useState(1);

  const directoryRef = useRef<HTMLDivElement>(null);

  const { tools, loading, upvoteTool, recordView, fetchToolDetails } =
    useTools();

  const { favorites, toggleFavorite } = useFavorites();

  const safeTools: Tool[] = useMemo(() => {
    if (!tools) return [];
    return tools.map((t) => ({
      ...t,
      upvotes: t.upvotes ?? 0,
      description: t.description ?? "",
      name: t.name ?? "Untitled",
      image_url: t.image_url || getFaviconUrl(t.website),
    }));
  }, [tools]);

  const filteredTools = useMemo(() => {
    const search = filters.search.toLowerCase().trim();
    return safeTools.filter((tool) => {
      if (search) {
        const text =
          tool.name + tool.description + (tool.long_description || "");
        if (!text.toLowerCase().includes(search)) return false;
      }
      if (filters.category !== "All" && tool.category !== filters.category)
        return false;
      if (filters.pricing !== "All" && tool.pricing !== filters.pricing)
        return false;
      return true;
    });
  }, [safeTools, filters]);

  const sortedTools = useMemo(() => {
    const list = [...filteredTools];
    switch (filters.sort) {
      case "newest":
        return list.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      case "name":
        return list.sort((a, b) => a.name.localeCompare(b.name));
      case "free-first": {
        const order: Record<string, number> = { Free: 0, Freemium: 1, Paid: 2 };
        return list.sort(
          (a, b) => (order[a.pricing] ?? 99) - (order[b.pricing] ?? 99)
        );
      }
      default:
        return list.sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));
    }
  }, [filteredTools, filters.sort]);

  const paginatedTools = useMemo(
    () => sortedTools.slice(0, page * PAGE_SIZE),
    [sortedTools, page]
  );

  const showLoadMore = sortedTools.length > page * PAGE_SIZE;

  const trendingTools = useMemo(
    () => safeTools.filter((t) => t.upvotes > 50).slice(0, 6),
    [safeTools]
  );

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    safeTools.forEach((tool) => {
      counts[tool.category] = (counts[tool.category] || 0) + 1;
    });
    return counts;
  }, [safeTools]);

  const updateFilters = useCallback((partial: Partial<ToolFilters>) => {
    setFilters((prev) => ({ ...prev, ...partial }));
    setPage(1);
    directoryRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const handleNavigate = useCallback((view: string) => {
    setCurrentView(view as View);
    window.scrollTo({ top: 0 });
  }, []);

  const handleExplore = useCallback(() => {
    directoryRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const handleSelectTool = useCallback(
    async (tool: Tool) => {
      setSelectedTool(tool);
      recordView(tool.id);

      try {
        const details = await fetchToolDetails(tool.website);
        if (details) {
          setSelectedTool((prev) =>
            prev?.id === tool.id
              ? {
                  ...prev,
                  long_description: details.text,
                  image_url: details.image_url || prev.image_url,
                }
              : prev
          );
        }
      } catch {}
    },
    [fetchToolDetails, recordView]
  );

  const favoriteTools = useMemo(
    () => safeTools.filter((t) => favorites.has(t.id)),
    [safeTools, favorites]
  );

  return (
    <div
      className={
        darkMode
          ? "dark bg-[#05050f] text-gray-200 min-h-screen"
          : "bg-white text-gray-900 min-h-screen"
      }
    >
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        darkMode={darkMode}
        onToggleDark={() => setDarkMode((d) => !d)}
        favoritesCount={favorites.size}
      />

      {currentView === "home" && (
        <main>
          <Hero totalTools={safeTools.length} onExplore={handleExplore} />

          {trendingTools.length > 0 && (
            <TrendingSection
              tools={trendingTools}
              onSelectTool={handleSelectTool}
            />
          )}

          <div ref={directoryRef} className="max-w-7xl mx-auto p-6">
            <SearchBar
              filters={filters}
              onFiltersChange={updateFilters}
              resultCount={sortedTools.length}
            />

            <CategoryFilter
              selected={filters.category}
              onChange={(cat) =>
                updateFilters({ category: cat as Category | "All" })
              }
              counts={categoryCounts}
              pricing={filters.pricing}
              onPricingChange={(p) => updateFilters({ pricing: p })}
            />

            <ToolGrid
              tools={paginatedTools}
              loading={loading}
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
              onUpvote={upvoteTool}
              onSelectTool={handleSelectTool}
            />

            {showLoadMore && (
              <div className="flex justify-center mt-12 pb-20">
                <button
                  onClick={() => setPage((p) => p + 1)}
                  className="px-8 py-3 bg-purple-600 text-white rounded-lg"
                >
                  Load More
                </button>
              </div>
            )}
          </div>
        </main>
      )}

      <Suspense fallback={null}>
        {currentView === "favorites" && (
          <FavoritesView
            tools={favoriteTools}
            onSelectTool={handleSelectTool}
            onToggleFavorite={toggleFavorite}
          />
        )}

        {currentView === "admin" && <AdminPanel />}

        {selectedTool && (
          <ToolModal
            tool={selectedTool}
            isFavorite={favorites.has(selectedTool.id)}
            onClose={() => setSelectedTool(null)}
            onToggleFavorite={toggleFavorite}
            onUpvote={upvoteTool}
            onRecordView={recordView}
          />
        )}
      </Suspense>

      <Footer />
    </div>
  );
}
