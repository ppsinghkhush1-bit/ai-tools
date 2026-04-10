import { ArrowRight, Sparkles, Zap, TrendingUp } from 'lucide-react';

interface HeroProps {
  totalTools: number;
  onExplore: () => void;
}

export function Hero({ totalTools, onExplore }: HeroProps) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      <div className="grid-line" />

      <div className="orb w-96 h-96 top-1/4 -left-48"
        style={{ background: '#00b4ff', animationDelay: '0s' }} />
      <div className="orb w-80 h-80 top-1/3 -right-40"
        style={{ background: '#a855f7', animationDelay: '-2s' }} />
      <div className="orb w-64 h-64 bottom-1/4 left-1/3"
        style={{ background: '#00f5ff', animationDelay: '-4s', opacity: 0.08 }} />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 animate-fade-in"
          style={{
            background: 'rgba(0,180,255,0.08)',
            border: '1px solid rgba(0,180,255,0.2)'
          }}>
          <Sparkles className="w-4 h-4 text-neon-cyan" />
          <span className="text-sm text-gray-300">
            The Future of AI Discovery is Here
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full font-semibold text-neon-blue"
            style={{ background: 'rgba(0,180,255,0.15)' }}>
            NEW
          </span>
        </div>

        <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-white leading-[1.1] mb-6 animate-slide-up">
          Discover the Best
          <br />
          <span className="gradient-text">AI Tools</span> on Earth
        </h1>

        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed animate-slide-up"
          style={{ animationDelay: '0.1s' }}>
          Explore {totalTools}+ curated AI tools across every category.
          From image generation to code assistance — find your perfect AI workflow.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-slide-up"
          style={{ animationDelay: '0.2s' }}>
          <button
            onClick={onExplore}
            className="btn-primary text-white flex items-center gap-2 text-base px-8 py-3.5"
          >
            Explore Tools
            <ArrowRight className="w-5 h-5" />
          </button>
          <button className="btn-secondary text-gray-300 flex items-center gap-2 text-base px-8 py-3.5">
            <Zap className="w-5 h-5 text-neon-blue" />
            View Trending
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 sm:gap-8 max-w-md mx-auto animate-fade-in"
          style={{ animationDelay: '0.3s' }}>
          {[
            { value: `${totalTools}+`, label: 'AI Tools', icon: Sparkles },
            { value: '10+', label: 'Categories', icon: TrendingUp },
            { value: '100%', label: 'Free Access', icon: Zap },
          ].map(({ value, label, icon: Icon }) => (
            <div key={label} className="stat-card">
              <Icon className="w-4 h-4 text-neon-blue mx-auto mb-1" />
              <div className="text-2xl font-bold gradient-text-blue">{value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-float">
        <div className="text-xs text-gray-600">Scroll to explore</div>
        <div className="w-5 h-8 rounded-full border border-white/10 flex items-start justify-center p-1">
          <div className="w-1 h-2 rounded-full bg-neon-blue animate-bounce" />
        </div>
      </div>
    </section>
  );
}
