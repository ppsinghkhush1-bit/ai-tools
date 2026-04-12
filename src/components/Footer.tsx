import { Github, Twitter } from 'lucide-react';

export function Footer() {
  return (
    <footer
      className="mt-24 py-12 border-t"
      style={{ borderColor: 'rgba(255,255,255,0.06)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">

          {/* 🔥 LOGO + NAME */}
          <div className="flex items-center gap-3 group">
            <div className="relative flex items-center justify-center w-9 h-9">
              <img
                src="/logo.png"
                alt="There's an AI for That"
                className="max-w-full max-h-full object-contain drop-shadow-md group-hover:scale-105 transition duration-300"
              />
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-300 blur-lg"
                style={{ background: 'linear-gradient(135deg, #00b4ff, #a855f7)' }}
              />
            </div>

            <span className="text-2xl font-bold text-white tracking-tight leading-none">
              Best <span className="gradient-text font-extrabold">AI</span> Tools
            </span>
          </div>

          {/* 🔥 DESCRIPTION */}
          <p className="text-gray-500 text-sm text-center">
            Discover and explore the best AI tools curated for every use case.
          </p>

          {/* 🔥 COPYRIGHT */}
          <div className="text-gray-500 text-xs">
            © 2026 There’s an AI for That
          </div>

        </div>
      </div>
    </footer>
  );
}
