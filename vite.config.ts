import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react({
      // FIX: babel transform only runs on files that need it
      // Faster builds, smaller output
      babel: {
        plugins: [
          ['babel-plugin-react-compiler', {}],
        ],
      },
    }),
  ],

  // ═══════════════════════════════════════
  // BUILD OPTIMIZATIONS
  // ═══════════════════════════════════════
  build: {
    // FIX: Target modern browsers only — eliminates legacy polyfills
    // Saves ~20-30kb from bundle
    target: 'es2020',

    // FIX: Increase chunk warning threshold (default 500kb is too aggressive)
    chunkSizeWarningLimit: 600,

    // FIX: Enable CSS code splitting — each chunk loads only its CSS
    cssCodeSplit: true,

    // FIX: Minify with esbuild (default) — fast and effective
    minify: 'esbuild',

    rollupOptions: {
      output: {
        // ═══════════════════════════════════════
        // MANUAL CHUNK SPLITTING
        // WHY: Without this, Vite bundles everything into one ~500kb+
        // JS file. Lighthouse penalizes large JS bundles heavily.
        // Splitting means:
        //   1. Browser caches vendor libs separately from your app code
        //   2. A code change only invalidates the app chunk, not react/supabase
        //   3. Critical path JS is much smaller → faster LCP/TTI
        // ═══════════════════════════════════════
        manualChunks: {
          // React core — changes almost never, cached long-term
          'vendor-react': ['react', 'react-dom'],

          // Supabase — large library, separate chunk
          'vendor-supabase': ['@supabase/supabase-js'],

          // Lucide icons — large, rarely changes
          'vendor-icons': ['lucide-react'],

          // Utilities
          'vendor-utils': ['axios', 'clsx', 'tailwind-merge'],
        },

        // FIX: Deterministic file names with content hash for long-term caching
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },

    // FIX: Generate sourcemaps only for production debugging
    // Set to false if you don't need them — saves build time
    sourcemap: false,
  },

  // ═══════════════════════════════════════
  // DEPENDENCY PRE-BUNDLING
  // FIX: removed lucide-react from exclude — excluding it means
  // it gets processed at request time (slow dev + larger prod bundle).
  // Let Vite pre-bundle it normally.
  // ═══════════════════════════════════════
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'lucide-react',
      'clsx',
      'tailwind-merge',
    ],
  },

  // ═══════════════════════════════════════
  // SERVER (dev only)
  // ═══════════════════════════════════════
  server: {
    port: 3000,
    open: false,
  },

  // ═══════════════════════════════════════
  // PREVIEW (local prod testing)
  // ═══════════════════════════════════════
  preview: {
    port: 4173,
    headers: {
      // Test caching headers locally before Railway deploy
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  },
});
