import { StrictMode, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

// 🚀 Lazy load App (reduces initial JS bundle)
const App = lazy(() => import('./App.tsx'));

// 🚀 Faster root render
const rootElement = document.getElementById('root');

if (rootElement) {
createRoot(rootElement).render( <StrictMode>
{/* 🚀 Suspense improves loading performance */}
<Suspense fallback={<div style={{padding: "20px"}}>Loading...</div>}> <App /> </Suspense> </StrictMode>
);
}
