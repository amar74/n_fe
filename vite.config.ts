import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    // Only define globals that are safe and commonly needed
    global: 'globalThis',
  },
  css: {
    devSourcemap: true,
  },
  build: {
    sourcemap: false, // Disable source maps for production
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Split by vendor libraries
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'react-vendor';
            }
            if (id.includes('@radix-ui')) {
              return 'ui-vendor';
            }
            if (id.includes('lucide-react')) {
              return 'icons-vendor';
            }
            if (id.includes('recharts')) {
              return 'charts-vendor';
            }
            if (id.includes('axios') || id.includes('date-fns') || id.includes('zod')) {
              return 'utils-vendor';
            }
            return 'vendor';
          }
          
          // Split by page/route
          if (id.includes('/pages/modules/opportunities/')) {
            return 'opportunities';
          }
          if (id.includes('/pages/modules/accounts/')) {
            return 'accounts';
          }
          if (id.includes('/pages/modules/proposals/')) {
            return 'proposals';
          }
          if (id.includes('/components/proposal/')) {
            return 'proposal-components';
          }
          // Don't split shared components - keep them in main bundle
          // if (id.includes('/components/')) {
          //   return 'shared-components';
          // }
        },
      },
    },
    chunkSizeWarningLimit: 500, // 500KB warning limit
    target: 'es2020', // Modern target for smaller bundles
    minify: 'terser', // Use Terser for minification (esbuild was naming vars as 'fs')
    // Configure Terser to avoid using Node.js built-in module names as minified variable names
    terserOptions: {
      mangle: {
        // Reserve Node.js built-in module names to prevent conflicts
        // Minifier was renaming 'cva' -> 'fs', causing "Cannot access 'fs' before initialization" errors
        reserved: ['fs', 'path', 'os', 'crypto', 'util', 'stream', 'buffer', 'events', 'child_process', 'net', 'tls', 'http', 'https', 'zlib', 'url', 'querystring', 'assert', 'constants', 'domain', 'punycode', 'process', 'vm', 'cluster', 'dgram', 'dns', 'readline', 'repl', 'string_decoder', 'timers', 'tty', 'v8', 'worker_threads'],
      },
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      sourcemap: false,
      define: {
        global: 'globalThis'
      },
    },
    exclude: ['xlsx'], // Let Vite handle xlsx specially
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@layouts': path.resolve(__dirname, './src/layouts'),
      '@services': path.resolve(__dirname, './src/services'),
      '@store': path.resolve(__dirname, './src/store'),
      '@types': path.resolve(__dirname, './src/types'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@lib': path.resolve(__dirname, './src/lib'),
      '@assets': path.resolve(__dirname, './src/assets'),
      '@models': path.resolve(__dirname, './src/models'),
      '@controllers': path.resolve(__dirname, './src/controllers'),
      // REMOVED Node.js module aliases - they were interfering with minified variable names!
      // Minifiers can rename 'cva' -> 'fs', and the alias would resolve it to empty-module
      // Instead, we rely on Vite's built-in handling and the external config above
    },
  },
});
