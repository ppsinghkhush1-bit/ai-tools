import { Zap, Github, Twitter } from 'lucide-react';

export function Footer() {
  return (
    <footer className="mt-24 py-12 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #00b4ff, #a855f7)' }}>
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-white">
              Nexus<span className="gradient-text">AI</span>
            </span>
          </div>

          <p className="text-gray-600 text-sm text-center">
            Discover and explore the best AI tools curated for every use case.
          </p>

          <div className="flex items-center gap-3 text-gray-500 text-xs">
            <span>Built with</span>
            <span className="text-neon-blue">React</span>
            <span>+</span>
            <span className="text-neon-purple">Supabase</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
