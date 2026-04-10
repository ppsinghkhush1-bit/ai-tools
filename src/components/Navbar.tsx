import { useState, useEffect } from 'react';
import { Zap, Sun, Moon, Heart, LayoutGrid, Plus, Menu, X } from 'lucide-react';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  darkMode: boolean;
  onToggleDark: () => void;
  favoritesCount: number;
}

export function Navbar({ currentView, onNavigate, darkMode, onToggleDark, favoritesCount }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const navLinks = [
    { id: 'home', label: 'Discover' },
    { id: 'favorites', label: 'Favorites' },
    { id: 'admin', label: 'Submit Tool' },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
        scrolled ? 'glass shadow-glass py-3' : 'py-5 bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2.5 group"
          >
            <div className="relative">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #00b4ff, #a855f7)' }}>
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: 'linear-gradient(135deg, #00b4ff, #a855f7)', filter: 'blur(8px)', zIndex: -1 }} />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">
              Nexus<span className="gradient-text">AI</span>
            </span>
          </button>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <button
                key={link.id}
                onClick={() => onNavigate(link.id)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  currentView === link.id
                    ? 'text-white bg-white/10 border border-white/15'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.id === 'favorites' && favoritesCount > 0 ? (
                  <span className="flex items-center gap-1.5">
                    {link.label}
                    <span className="w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold text-white"
                      style={{ background: 'linear-gradient(135deg, #00b4ff, #a855f7)' }}>
                      {favoritesCount}
                    </span>
                  </span>
                ) : link.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('favorites')}
              className="md:hidden relative p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all"
            >
              <Heart className="w-5 h-5" />
              {favoritesCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[9px] flex items-center justify-center font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, #00b4ff, #a855f7)' }}>
                  {favoritesCount}
                </span>
              )}
            </button>

            <button
              onClick={onToggleDark}
              className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-200"
              aria-label="Toggle theme"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <button
              onClick={() => onNavigate('admin')}
              className="hidden md:flex items-center gap-2 btn-primary text-white"
            >
              <Plus className="w-4 h-4" />
              Submit Tool
            </button>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-white/10 animate-fade-in">
            <div className="flex flex-col gap-1 pt-4">
              {navLinks.map(link => (
                <button
                  key={link.id}
                  onClick={() => { onNavigate(link.id); setMobileOpen(false); }}
                  className={`px-4 py-3 rounded-xl text-sm font-medium text-left transition-all ${
                    currentView === link.id
                      ? 'text-white bg-white/10'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
