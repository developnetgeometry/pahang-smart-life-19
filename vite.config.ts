import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Optimize chunks for better loading performance
    rollupOptions: {
      output: {
        manualChunks: {
          // Core vendor chunks
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          query: ['@tanstack/react-query'],
          // UI libraries (split for better caching)
          'ui-core': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-popover', '@radix-ui/react-select'],
          'ui-extended': ['@radix-ui/react-tabs', '@radix-ui/react-accordion', '@radix-ui/react-toast', '@radix-ui/react-alert-dialog'],
          // Backend and data
          supabase: ['@supabase/supabase-js'],
          // Heavy feature libraries (lazy loaded)
          charts: ['recharts'],
          maps: ['mapbox-gl'],
          video: ['hls.js'],
          // Form and validation
          forms: ['react-hook-form', '@hookform/resolvers', 'zod'],
          // Date and time
          dates: ['date-fns', 'react-day-picker'],
        },
      },
    },
    // Target modern browsers for better optimization
    target: 'esnext',
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      'react-router-dom', 
      '@tanstack/react-query',
      '@supabase/supabase-js'
    ],
  },
  // Performance improvements
  esbuild: {
    // Drop console logs in production, keep essential logs in development
    drop: mode === 'production' ? ['console', 'debugger'] : ['debugger'],
    pure: mode === 'production' ? ['console.log', 'console.info', 'console.debug'] : [],
  },
}));
