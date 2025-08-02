import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
    cors: true,
    hmr: {
      port: 3000,
      host: 'localhost'
    },
    proxy: {
      // Supabase Edge Functions 프록시 설정
      '/functions/v1': {
        target: 'https://bfurhjgnnjgfcafdrotk.supabase.co',
        changeOrigin: true,
        secure: true,
        headers: {
          'X-Client-Info': 'sms-v2.0'
        }
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false, // 프로덕션에서는 소스맵 비활성화
    minify: 'terser', // 더 강력한 압축
    rollupOptions: {
      output: {
        manualChunks: {
          // 핵심 라이브러리
          vendor: ['react', 'react-dom'],
          
          // 라우팅
          router: ['react-router-dom'],
          
          // UI 라이브러리
          radix: [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toast',
            '@radix-ui/react-accordion',
            '@radix-ui/react-alert-dialog',
            '@radix-ui/react-aspect-ratio',
            '@radix-ui/react-avatar',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-collapsible',
            '@radix-ui/react-context-menu',
            '@radix-ui/react-hover-card',
            '@radix-ui/react-label',
            '@radix-ui/react-menubar',
            '@radix-ui/react-navigation-menu',
            '@radix-ui/react-popover',
            '@radix-ui/react-progress',
            '@radix-ui/react-radio-group',
            '@radix-ui/react-scroll-area',
            '@radix-ui/react-separator',
            '@radix-ui/react-slider',
            '@radix-ui/react-slot',
            '@radix-ui/react-switch',
            '@radix-ui/react-toggle',
            '@radix-ui/react-toggle-group',
            '@radix-ui/react-tooltip'
          ],
          
          // 아이콘 라이브러리
          icons: ['lucide-react'],
          
          // 차트 라이브러리
          charts: ['@nivo/bar', '@nivo/pie', '@nivo/line', '@nivo/core', '@nivo/circle-packing', '@nivo/heatmap', '@nivo/radar', '@nivo/stream'],
          
          // 유틸리티 라이브러리
          utils: ['date-fns', 'clsx', 'class-variance-authority', 'tailwind-merge'],
          
          // 폼 관련
          forms: ['react-hook-form'],
          
          // 기타 라이브러리
          others: ['sonner', 'vaul', 'embla-carousel-react', 'cmdk', 'input-otp', 'react-resizable-panels', 'next-themes']
        }
      }
    },
    // Terser 옵션 추가
    terserOptions: {
      compress: {
        drop_console: true, // 콘솔 로그 제거
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
        passes: 2
      },
      mangle: {
        toplevel: true
      }
    }
  },
  define: {
    // 환경 변수 타입 정의
    'process.env': {}
  },
  // 정적 파일 처리 개선
  publicDir: 'public',
  assetsInclude: ['**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif', '**/*.svg', '**/*.ico', '**/*.webp'],
  // CSS 최적화
  css: {
    devSourcemap: false
  }
}) 