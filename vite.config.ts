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
      // Note: Do NOT mark Node.js modules as external for browser builds
      // The resolve.alias configuration below handles them correctly
      external: (id) => {
        // Completely exclude Node.js built-in modules
        const nodeModules = [
          'fs', 'path', 'os', 'crypto', 'util', 'stream', 'buffer', 'events',
          'child_process', 'net', 'tls', 'http', 'https', 'zlib', 'url',
          'querystring', 'assert', 'constants', 'domain', 'punycode', 'process',
          'vm', 'cluster', 'dgram', 'dns', 'readline', 'repl', 'string_decoder',
          'timers', 'tty', 'v8', 'worker_threads'
        ];
        
        return nodeModules.includes(id);
      },
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
          if (id.includes('/components/')) {
            return 'shared-components';
          }
        },
      },
    },
    chunkSizeWarningLimit: 500, // 500KB warning limit
    target: 'es2020', // Modern target for smaller bundles
    minify: 'esbuild', // Use esbuild for minification
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
      // Node.js module polyfills - set to empty module to avoid errors
      fs: path.resolve(__dirname, './src/lib/empty-module.ts'),
      path: path.resolve(__dirname, './src/lib/empty-module.ts'),
      os: path.resolve(__dirname, './src/lib/empty-module.ts'),
      crypto: path.resolve(__dirname, './src/lib/empty-module.ts'),
      util: path.resolve(__dirname, './src/lib/empty-module.ts'),
      stream: path.resolve(__dirname, './src/lib/empty-module.ts'),
      buffer: path.resolve(__dirname, './src/lib/empty-module.ts'),
      events: path.resolve(__dirname, './src/lib/empty-module.ts'),
      child_process: path.resolve(__dirname, './src/lib/empty-module.ts'),
      net: path.resolve(__dirname, './src/lib/empty-module.ts'),
      tls: path.resolve(__dirname, './src/lib/empty-module.ts'),
      http: path.resolve(__dirname, './src/lib/empty-module.ts'),
      https: path.resolve(__dirname, './src/lib/empty-module.ts'),
      zlib: path.resolve(__dirname, './src/lib/empty-module.ts'),
      // Additional Node.js modules that might be causing issues
      url: path.resolve(__dirname, './src/lib/empty-module.ts'),
      querystring: path.resolve(__dirname, './src/lib/empty-module.ts'),
      assert: path.resolve(__dirname, './src/lib/empty-module.ts'),
      constants: path.resolve(__dirname, './src/lib/empty-module.ts'),
      domain: path.resolve(__dirname, './src/lib/empty-module.ts'),
      punycode: path.resolve(__dirname, './src/lib/empty-module.ts'),
      process: path.resolve(__dirname, './src/lib/empty-module.ts'),
      vm: path.resolve(__dirname, './src/lib/empty-module.ts'),
      cluster: path.resolve(__dirname, './src/lib/empty-module.ts'),
      dgram: path.resolve(__dirname, './src/lib/empty-module.ts'),
      dns: path.resolve(__dirname, './src/lib/empty-module.ts'),
      readline: path.resolve(__dirname, './src/lib/empty-module.ts'),
      repl: path.resolve(__dirname, './src/lib/empty-module.ts'),
      string_decoder: path.resolve(__dirname, './src/lib/empty-module.ts'),
      timers: path.resolve(__dirname, './src/lib/empty-module.ts'),
      tty: path.resolve(__dirname, './src/lib/empty-module.ts'),
      v8: path.resolve(__dirname, './src/lib/empty-module.ts'),
      worker_threads: path.resolve(__dirname, './src/lib/empty-module.ts'),
      // TanStack Query replacement
      '@tanstack/react-query': path.resolve(__dirname, './src/lib/query-client-replacement.ts'),
    },
  },
});
