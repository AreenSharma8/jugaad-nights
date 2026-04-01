/**
 * ============================================================================
 * VITE CONFIGURATION - Frontend Build & Dev Server Setup
 * ============================================================================
 * Vite is a modern frontend build tool with HMR (Hot Module Replacement)
 * for instant updates during development.
 * 
 * This config handles:
 * - Development server setup (port 8080)
 * - Hot reload (HMR) configuration
 * - API proxy setup (routes /api to backend)
 * - TypeScript path aliases (@/... -> src/...)
 * - React plugin with SWC compiler
 * ============================================================================
 */

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";  // React plugin with SWC (faster compiler)
import path from "path";
import { componentTagger } from "lovable-tagger";  // Component tagging for development

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  /**
   * ========== DEVELOPMENT SERVER CONFIG ==========
   * Vite dev server configuration for hot reload
   */
  server: {
    /**
     * Host configuration
     * - "localhost" means server only accessible from your machine
     * - Use "0.0.0.0" in Docker to accept external connections
     */
    host: "localhost",

    /**
     * Development server port
     * Frontend will be accessible at: http://localhost:8080
     */
    port: 8080,

    /**
     * ========== HMR (Hot Module Replacement) CONFIG ==========
     * HMR allows automatic page updates when you save files
     * No need to manually refresh browser during development
     * 
     * Why separate config:
     * - Vite server is inside Docker
     * - Browser is on your machine (outside Docker)
     * - Need to tell browser where Vite server is
     */
    hmr: {
      protocol: "ws",        // WebSocket protocol for HMR
      host: "localhost",     // Host where browser can reach Vite server
      port: 8080,            // Port where Vite server runs
      timeout: 60000,        // How long to wait for HMR before timeout
    },

    /**
     * ========== API PROXY CONFIGURATION ==========
     * Proxies all /api requests to the backend server
     * 
     * How it works:
     * 1. Browser requests http://localhost:8080/api/users
     * 2. Vite intercepts this request
     * 3. Vite forwards to http://localhost:3000/api/users
     * 4. Backend responds
     * 5. Response returned to browser
     * 
     * Benefits:
     * - No CORS errors during development (same origin)
     * - Can test with backend running on different port
     * - Easy to switch backend URL (just change target)
     * 
     * In Docker:
     * - Frontend: http://frontend:80
     * - Backend: http://backend:3000
     * - But nginx proxy handles this (no need for Vite proxy in Docker)
     */
    proxy: {
      "/api": {
        target: "http://localhost:3000",  // Backend server URL
        changeOrigin: true,               // Modify Origin header
        rewrite: (path) => path.replace(/^\/api/, "/api"),  // Keep /api prefix
      },
    },
  },

  /**
   * ========== PLUGINS ==========
   * Vite plugins for build optimizations
   */
  plugins: [
    react(),  // React fast refresh + SWC compiler

    /**
     * Component Tagger: Development-only plugin
     * Tags React components for easier debugging
     * Only included in development mode
     */
    mode === "development" && componentTagger(),
  ].filter(Boolean),  // Remove falsy values (e.g., if not in dev mode)

  /**
   * ========== RESOLVE ALIASES ==========
   * TypeScript/JavaScript path aliases
   * Instead of: import Button from "../../components/ui/button"
   * Use: import Button from "@/components/ui/button"
   * 
   * "@" maps to: "./src"
   * So @/hooks/useAuth -> ./src/hooks/useAuth
   */
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));

