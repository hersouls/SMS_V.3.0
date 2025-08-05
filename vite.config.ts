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
        // Firebase Functions 프록시 설정
        '/api': {
          target: 'http://localhost:5001',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      }
    },
    build: {
      outDir: 'dist',
      // 개발 환경에서는 소스맵 활성화, 프로덕션에서는 조건부 활성화
      sourcemap: isDevelopment ? true : (process.env.GENERATE_SOURCEMAP === 'true'),
      minify: isProduction ? 'esbuild' : false,
      
      // 성능 최적화 옵션
      target: 'esnext',
      reportCompressedSize: false, // 빌드 속도 개선
      chunkSizeWarningLimit: 1000, // 청크 크기 경고 한계값 증가
      
      // 빌드 옵션
      rollupOptions: {
        // 트리 쉐이킹 최적화
        treeshake: {
          moduleSideEffects: false,
          propertyReadSideEffects: false,
          tryCatchDeoptimization: false
        },
        output: {
          manualChunks: {
            // 핵심 React 라이브러리
            vendor: ['react', 'react-dom'],
            
            // 라우팅 관련
            router: ['react-router-dom'],
            
            // Firebase 관련 (더 세분화)
            firebase: [
              'firebase/app',
              'firebase/auth', 
              'firebase/firestore',
              'firebase/storage'
            ],
            
            // UI 컴포넌트 라이브러리
            ui: ['lucide-react'],
            
            // 유틸리티 라이브러리
            utils: ['sonner', 'date-fns'],
            
            // 차트 및 데이터 시각화 (있다면)
            charts: []
          },
          
          // 동적 청크 이름 생성
          chunkFileNames: (chunkInfo) => {
            const facadeModuleId = chunkInfo.facadeModuleId 
              ? chunkInfo.facadeModuleId.split('/').pop()?.replace('.tsx', '').replace('.ts', '') 
              : 'chunk';
            return `js/${facadeModuleId}-[hash].js`;
          },
          
          // 엔트리 파일 이름
          entryFileNames: 'js/[name]-[hash].js',
          
          // 에셋 파일 이름  
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name?.split('.') ?? [];
            const ext = info[info.length - 1];
            if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext ?? '')) {
              return `img/[name]-[hash][extname]`;
            } else if (/css/i.test(ext ?? '')) {
              return `css/[name]-[hash][extname]`;
            }
            return `assets/[name]-[hash][extname]`;
          }
        }
      }
    },
    define: {
      // 환경 변수 타입 정의 - 실제 환경 변수 사용
      'process.env': {
        NODE_ENV: JSON.stringify(mode),
        VITE_FIREBASE_API_KEY: JSON.stringify(process.env.VITE_FIREBASE_API_KEY),
        VITE_FIREBASE_AUTH_DOMAIN: JSON.stringify(process.env.VITE_FIREBASE_AUTH_DOMAIN),
        VITE_FIREBASE_PROJECT_ID: JSON.stringify(process.env.VITE_FIREBASE_PROJECT_ID),
        VITE_FIREBASE_STORAGE_BUCKET: JSON.stringify(process.env.VITE_FIREBASE_STORAGE_BUCKET),
        VITE_FIREBASE_MESSAGING_SENDER_ID: JSON.stringify(process.env.VITE_FIREBASE_MESSAGING_SENDER_ID),
        VITE_FIREBASE_APP_ID: JSON.stringify(process.env.VITE_FIREBASE_APP_ID),
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

  // Custom domain deployment (sub.moonwave.kr)
  // GitHub Pages with custom domain doesn't need base path
  if (command !== 'serve') {
    config.base = '/'
  }

  return config
}) 