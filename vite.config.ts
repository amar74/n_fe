import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// Plugin to remove Node.js imports
const removeNodeImports = () => ({
  name: 'remove-node-imports',
  transform(code: string, id: string) {
    // Remove fs and other Node.js imports from all files
    const nodeImports = ['fs', 'path', 'os', 'crypto', 'util', 'stream', 'buffer', 'events', 'child_process', 'cluster', 'dgram', 'dns', 'domain', 'http', 'https', 'net', 'readline', 'repl', 'tls', 'tty', 'url', 'vm', 'zlib'];
    
    for (const nodeImport of nodeImports) {
      // Remove import statements
      code = code.replace(new RegExp(`import\\s+.*\\s+from\\s+['"]${nodeImport}['"]`, 'g'), '');
      code = code.replace(new RegExp(`import\\s+['"]${nodeImport}['"]`, 'g'), '');
      code = code.replace(new RegExp(`require\\(['"]${nodeImport}['"]\\)`, 'g'), 'undefined');
      // Replace fs usage with undefined
      code = code.replace(new RegExp(`\\bfs\\b`, 'g'), 'undefined');
      // Replace new fs() with undefined
      code = code.replace(new RegExp(`new\\s+${nodeImport}\\s*\\(`, 'g'), 'undefined(');
    }
    return code;
  }
});

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), removeNodeImports()],
  define: {
    global: 'globalThis',
    'process.env': '{}',
    'process': '{}',
    'Buffer': 'undefined',
    'fs': 'undefined',
    'path': 'undefined',
    'os': 'undefined',
    'crypto': 'undefined',
    'util': 'undefined',
    'stream': 'undefined',
    'buffer': 'undefined',
    'events': 'undefined',
  },
  css: {
    devSourcemap: true,
  },
  build: {
    sourcemap: false, // Disable source maps for production
    rollupOptions: {
      external: (id) => {
        // Exclude Node.js built-in modules
        if (['fs', 'path', 'os', 'crypto', 'util', 'stream', 'buffer', 'events', 'child_process', 'cluster', 'dgram', 'dns', 'domain', 'http', 'https', 'net', 'readline', 'repl', 'tls', 'tty', 'url', 'vm', 'zlib'].includes(id)) {
          return true;
        }
        return false;
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
    },
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
      // Node.js module polyfills
      'fs': false,
      'path': false,
      'os': false,
      'crypto': false,
      'util': false,
      'stream': false,
      'buffer': false,
      'events': false,
    },
  },
});
