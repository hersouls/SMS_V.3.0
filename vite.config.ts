import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const isDevelopment = mode === 'development'
  const isProduction = mode === 'production'
  
  const config = {
    plugins: [react()],
    base: '/',
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "@/components": path.resolve(__dirname, "./components"),
        "@/utils": path.resolve(__dirname, "./utils"),
        "@/styles": path.resolve(__dirname, "./styles"),
        "@/public": path.resolve(__dirname, "./public"),
      },
    },
    server: {
      port: 3000,
      // 개발 환경에서만 모든 인터페이스 허용, 프로덕션에서는 localhost만
      host: isDevelopment ? 'localhost' : 'localhost',
      cors: true,
      hmr: {
        port: 3000,
        host: 'localhost'
      },
      proxy: {
        // Supabase Edge Functions 프록시 설정
        '/functions/v1': {
          target: process.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co',
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
      // 개발 환경에서는 소스맵 활성화, 프로덕션에서는 조건부 활성화
      sourcemap: isDevelopment ? true : (process.env.GENERATE_SOURCEMAP === 'true'),
      minify: 'esbuild',
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            router: ['react-router-dom'],
            ui: ['lucide-react', '@supabase/supabase-js']
          }
        }
      }
    },
    define: {
      // 환경 변수 타입 정의 - 실제 환경 변수 사용
      'process.env': {
        NODE_ENV: JSON.stringify(mode),
        VITE_SUPABASE_URL: JSON.stringify(process.env.VITE_SUPABASE_URL),
        VITE_SUPABASE_ANON_KEY: JSON.stringify(process.env.VITE_SUPABASE_ANON_KEY),
        VITE_GOOGLE_CLIENT_ID: JSON.stringify(process.env.VITE_GOOGLE_CLIENT_ID),
        VITE_GOOGLE_CLIENT_SECRET: JSON.stringify(process.env.VITE_GOOGLE_CLIENT_SECRET),
      }
    },
    // 정적 파일 처리 개선
    publicDir: 'public',
    assetsInclude: ['**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif', '**/*.svg', '**/*.ico', '**/*.webp'],
    // CSS 최적화
    css: {
      devSourcemap: isDevelopment
    }
  }

  // GitHub Pages deployment
  // For custom domain (sub.moonwave.kr), base should be '/'
  if (command !== 'serve') {
    config.base = '/'
  }

  return config
}) 