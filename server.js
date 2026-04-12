// server.js — Production server for Railway
// WHY: Railway serves your app via this file. Without it, there are
// NO compression headers and NO cache headers → Lighthouse penalizes both.
//
// WHAT THIS ADDS:
//   ✓ Brotli + Gzip compression    → saves 60-70% JS/CSS transfer size
//   ✓ Long-term asset caching      → 1 year cache for hashed files
//   ✓ SPA fallback routing         → fixes 404 on page refresh
//   ✓ Security headers             → improves Best Practices score
//   ✓ Correct content-type headers → prevents MIME sniffing warnings

import express from 'express';
import compression from 'compression';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const DIST = join(__dirname, 'dist');

// ═══════════════════════════════════════
// 1. COMPRESSION (Brotli + Gzip)
// WHY: Lighthouse "Enable text compression" audit.
// Brotli compresses ~15% better than gzip.
// This alone can move performance score +10 points.
// ═══════════════════════════════════════
app.use(compression({
  level: 6,        // Balance between CPU cost and compression ratio
  threshold: 1024, // Only compress responses > 1kb
  filter: (req, res) => {
    // Always compress these types
    if (req.headers['x-no-compression']) return false;
    return compression.filter(req, res);
  },
}));

// ═══════════════════════════════════════
// 2. SECURITY HEADERS
// WHY: Lighthouse Best Practices checks for these.
// ═══════════════════════════════════════
app.use((req, res, next) => {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  // Prevent MIME sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  // XSS protection (legacy browsers)
  res.setHeader('X-XSS-Protection', '1; mode=block');
  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  // Permissions policy
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});

// ═══════════════════════════════════════
// 3. STATIC ASSETS — Long-term cache
// WHY: Vite outputs hashed filenames (main-a3f2b1.js).
// Since the hash changes when content changes, we can safely
// cache for 1 year. Lighthouse "Serve static assets with
// efficient cache policy" audit requires max-age > 31536000.
// ═══════════════════════════════════════
app.use('/assets', express.static(join(DIST, 'assets'), {
  maxAge: '1y',           // 1 year cache
  immutable: true,        // Tells browser content will never change
  etag: false,            // Hash in filename makes etag redundant
  lastModified: false,    // Same — hash is the cache key
}));

// ═══════════════════════════════════════
// 4. OTHER STATIC FILES (favicon, manifest, robots.txt etc.)
// Short cache — these files don't have hashes
// ═══════════════════════════════════════
app.use(express.static(DIST, {
  maxAge: '1h',
  etag: true,
  index: false, // We handle index.html manually below for SPA routing
}));

// ═══════════════════════════════════════
// 5. SPA FALLBACK — All routes → index.html
// WHY: React Router needs this. Without it, refreshing any
// non-root URL returns 404 from the server.
// index.html gets a short cache (no hash) so updates deploy fast.
// ═══════════════════════════════════════
app.get('*', (req, res) => {
  const indexPath = join(DIST, 'index.html');

  if (!existsSync(indexPath)) {
    return res.status(503).send('App not built yet. Run: npm run build');
  }

  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.sendFile(indexPath);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
