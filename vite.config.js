import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    react({
      // Ensure React is properly imported in all files
      jsxRuntime: 'automatic',
    }),
    tailwindcss()
  ],
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: {
      // Ensure single React instance
      'react': 'react',
      'react-dom': 'react-dom',
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
  server: {
    host: "0.0.0.0",
    port: 3000,
    strictPort: true,
    hmr: {
      port: 3000,
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
        },
      },
    },
  },
});
