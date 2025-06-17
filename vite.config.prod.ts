import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path, { dirname } from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { fileURLToPath } from "url";
import { VitePWA } from 'vite-plugin-pwa';
import { visualizer } from 'rollup-plugin-visualizer';
import { compression } from 'vite-plugin-compression';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    themePlugin(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/theviewsconsultancy\.com\/api\/(properties|announcements)/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24, // 24 hours
              },
            },
          },
          {
            urlPattern: /\/api\/(properties|announcements)/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'local-api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24, // 24 hours
              },
            },
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
          {
            urlPattern: /\/uploads\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'property-images-cache',
              expiration: {
                maxEntries: 300,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          }
        ]
      },
      manifest: {
        name: 'The Views Real Estate Consultancy',
        short_name: 'The Views',
        description: 'Premium real estate consultant for Egypt and Dubai properties',
        start_url: '/',
        display: 'standalone',
        theme_color: '#B87333',
        background_color: '#ffffff',
        orientation: 'portrait-primary',
        scope: '/',
        lang: 'en-US',
        categories: ['business', 'lifestyle'],
        icons: [
          {
            src: '/views-logo-new.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/views-logo-new.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ],
        shortcuts: [
          {
            name: 'Browse Properties',
            short_name: 'Properties',
            description: 'View available properties',
            url: '/properties',
            icons: [{ src: '/views-logo-new.png', sizes: '96x96' }]
          },
          {
            name: 'Projects',
            short_name: 'Projects',
            description: 'View our projects',
            url: '/projects',
            icons: [{ src: '/views-logo-new.png', sizes: '96x96' }]
          },
          {
            name: 'Contact Us',
            short_name: 'Contact',
            description: 'Get in touch with us',
            url: '/contact',
            icons: [{ src: '/views-logo-new.png', sizes: '96x96' }]
          }
        ]
      }
    }),
    // Production optimizations
    visualizer({
      filename: 'dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
    compression({
      algorithm: 'gzip',
      ext: '.gz',
    }),
    compression({
      algorithm: 'brotliCompress',
      ext: '.br',
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
    },
  },
  root: path.resolve(__dirname, "client"),
  build: {
    target: 'es2020',
    minify: 'terser',
    cssMinify: true,
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-toast'],
          routing: ['wouter'],
          query: ['@tanstack/react-query'],
          icons: ['lucide-react'],
          utils: ['clsx', 'tailwind-merge', 'class-variance-authority'],
        },
      },
    },
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
    exclude: ['@replit/vite-plugin-cartographer'],
  },
});