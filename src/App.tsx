import { useState, useCallback, useRef, useMemo } from "react";
import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { SearchBar } from "./components/SearchBar";
import { CategoryFilter } from "./components/CategoryFilter";
import { ToolGrid } from "./components/ToolGrid";
import { ToolModal } from "./components/ToolModal";
import { TrendingSection } from "./components/TrendingSection";
import { FavoritesView } from "./components/FavoritesView";
import { AdminPanel } from "./components/AdminPanel";
import { Footer } from "./components/Footer";
import { useTools } from "./hooks/useTools";
import { useFavorites } from "./hooks/useFavorites";
import type { Tool, ToolFilters, Category } from "./types";
import { RefreshCw } from "lucide-react";

const PAGE_SIZE = 12;

const defaultFilters: ToolFilters = {
  search: "",
  category: "All",
  pricing: "All",
  sort: "popular",
};

type View = "home" | "favorites" | "admin";

export default function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [currentView, setCurrentView] = useState<View>("home");
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [filters, setFilters] = useState<ToolFilters>(defaultFilters);
  const [page, setPage] = useState(1);

  const directoryRef = useRef<HTMLDivElement>(null);

  const { tools, loading, upvoteTool, recordView, refetch, fetchToolDetails } =
    useTools();

  const { favorites, toggleFavorite } = useFavorites();

  const safeTools: Tool[] = useMemo(
    () =>
      (tools ?? []).map((t) => ({
        ...t,
        upvotes: t.upvotes ?? 0,
        description: t.description ?? "",
        name: t.name ?? "Untitled",
        image_url:
          t.image_url ||
          (() => {
            try {
              return `https://icons.duckduckgo.com/ip3/${new URL(t.website).hostname}.ico`;
            } catch {
              return "";
            }
          })(),
      })),
    [tools]
  );

  const filteredTools = useMemo(() => {
    const searchLower = filters.search.toLowerCase().trim();
    return safeTools.filter((tool) => {
      const matchesSearch =
        !searchLower ||
        tool.name.toLowerCase().includes(searchLower) ||
        tool.description.toLowerCase().includes(searchLower) ||
        (tool.long_description?.toLowerCase().includes(searchLower) ?? false);
      const matchesCategory =
        filters.category === "All" || tool.category === filters.category;
      const matchesPricing =
        filters.pricing === "All" || tool.pricing === filters.pricing;
      return matchesSearch && matchesCategory && matchesPricing;
    });
  }, [safeTools, filters.search, filters.category, filters.pricing]);

  const sortedTools = useMemo(() => {
    return [...filteredTools].sort((a, b) => {
      switch (filters.sort) {
        case "newest":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case "name":
          return a.name.localeCompare(b.name);
        case "free-first": {
          const order: Record<string, number> = { Free: 0, Freemium: 1, Paid: 2 };
          return (order[a.pricing] ?? 99) - (order[b.pricing] ?? 99);
        }
        case "popular":
        default:
          return (b.upvotes || 0) - (a.upvotes || 0);
      }
    });
  }, [filteredTools, filters.sort]);

  const categoryCounts = useMemo(() => {
    return safeTools.reduce<Record<string, number>>((acc, tool) => {
      acc[tool.category] = (acc[tool.category] || 0) + 1;
      return acc;
    }, {});
  }, [safeTools]);

  const paginatedTools = useMemo(
    () => sortedTools.slice(0, page * PAGE_SIZE),
    [sortedTools, page]
  );

  const showLoadMore = sortedTools.length > page * PAGE_SIZE;

  const trendingTools = useMemo(
    () => safeTools.filter((t) => t.upvotes > 50).slice(0, 6),
    [safeTools]
  );

  const updateFilters = useCallback((partial: Partial<ToolFilters>) => {
    setFilters((prev) => ({ ...prev, ...partial }));
    setPage(1);
    if (directoryRef.current) {
      directoryRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  const handleNavigate = useCallback((view: string) => {
    setCurrentView(view as View);
    window.scrollTo({ top: 0, behavior: "smooth" });
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
              ? { ...prev, long_description: details.text, image_url: details.image_url || prev.image_url }
              : prev
          );
        }
      } catch (error) {
        console.error("Failed to load details", error);
      }
    },
    [fetchToolDetails, recordView]
  );

  const favoriteTools = useMemo(
    () => safeTools.filter((t) => favorites.has(t.id)),
    [safeTools, favorites]
  );

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        darkMode ? "dark bg-[#05050f] text-gray-200" : "bg-white text-gray-900"
      }`}
    >
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        darkMode={darkMode}
        onToggleDark={() => setDarkMode((d) => !d)}
        favoritesCount={favorites.size}
      />

      {currentView === "home" && (
        <main className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Hero totalTools={safeTools.length} onExplore={handleExplore} />

          {trendingTools.length > 0 && (
            <TrendingSection tools={trendingTools} onSelectTool={handleSelectTool} />
          )}

          <div ref={directoryRef} className="max-w-7xl mx-auto p-6 scroll-mt-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
                  AI Tools Directory
                </h2>
                <p className="text-gray-500 mt-1">Discover the next generation of AI</p>
              </div>
              <button
                onClick={refetch}
                className="w-fit p-3 rounded-xl bg-gray-500/10 hover:bg-gray-500/20 transition-all active:scale-95 flex items-center gap-2"
                aria-label="Refresh tools"
              >
                <span className="text-sm font-medium">Sync Data</span>
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-purple-500" : ""}`} />
              </button>
            </div>

            {/* CategoryFilter now owns both category tabs AND pricing pills */}
            <CategoryFilter
              selected={filters.category}
              onChange={(cat) => updateFilters({ category: cat as Category | "All" })}
              counts={categoryCounts}
              pricing={filters.pricing}
              onPricingChange={(p) => updateFilters({ pricing: p })}
            />

            <div className="my-8">
              <SearchBar
                filters={filters}
                onFiltersChange={updateFilters}
                resultCount={sortedTools.length}
              />
            </div>

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
                  className="group px-10 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-2xl font-bold shadow-xl shadow-purple-500/20 transition-all hover:scale-105 active:scale-95"
                >
                  Load More AI Tools
                </button>
              </div>
            )}
          </div>
        </main>
      )}

      {currentView === "favorites" && (
        <FavoritesView
          tools={favoriteTools}
          onSelectTool={handleSelectTool}
          onToggleFavorite={toggleFavorite}
        />
      )}

      {currentView === "admin" && <AdminPanel />}

      <Footer />

      <ToolModal
        tool={selectedTool}
        isFavorite={!!selectedTool && favorites.has(selectedTool.id)}
        onClose={() => setSelectedTool(null)}
        onToggleFavorite={toggleFavorite}
        onUpvote={upvoteTool}
        onRecordView={recordView}
      />
    </div>
  );
}