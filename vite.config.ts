import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
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
    },
  },
});
