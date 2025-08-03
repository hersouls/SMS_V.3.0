#!/usr/bin/env node

import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class TailwindMCP {
  constructor() {
    this.configPath = path.join(process.cwd(), 'tailwind-mcp-config.json');
    this.tailwindConfigPath = path.join(process.cwd(), 'tailwind.config.js');
    this.outputPath = path.join(process.cwd(), 'dist/output.css');
    this.inputPath = path.join(process.cwd(), 'styles/globals.css');
  }

  async init() {
    console.log('🚀 Tailwind CSS MCP 서버를 시작합니다...');
    
    // 설정 파일 확인
    if (!fs.existsSync(this.configPath)) {
      console.error('❌ tailwind-mcp-config.json 파일을 찾을 수 없습니다.');
      return;
    }

    // Tailwind 설정 파일 확인
    if (!fs.existsSync(this.tailwindConfigPath)) {
      console.error('❌ tailwind.config.js 파일을 찾을 수 없습니다.');
      return;
    }

    // 입력 CSS 파일 확인
    if (!fs.existsSync(this.inputPath)) {
      console.error('❌ styles/globals.css 파일을 찾을 수 없습니다.');
      return;
    }

    // dist 디렉토리 생성
    const distDir = path.dirname(this.outputPath);
    if (!fs.existsSync(distDir)) {
      fs.mkdirSync(distDir, { recursive: true });
    }

    console.log('✅ 모든 설정 파일이 확인되었습니다.');
    this.startWatchMode();
  }

  startWatchMode() {
    console.log('👀 Tailwind CSS 감시 모드를 시작합니다...');
    
    const args = [
      'tailwindcss',
      '-i', this.inputPath,
      '-o', this.outputPath,
      '--watch'
    ];

    const tailwindProcess = spawn('npx', args, {
      stdio: 'inherit',
      shell: true
    });

    tailwindProcess.on('error', (error) => {
      console.error('❌ Tailwind CSS 프로세스 오류:', error);
    });

    tailwindProcess.on('close', (code) => {
      console.log(`📦 Tailwind CSS 프로세스가 종료되었습니다. (코드: ${code})`);
    });

    // 프로세스 종료 처리
    process.on('SIGINT', () => {
      console.log('\n🛑 Tailwind CSS MCP 서버를 종료합니다...');
      tailwindProcess.kill('SIGINT');
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      console.log('\n🛑 Tailwind CSS MCP 서버를 종료합니다...');
      tailwindProcess.kill('SIGTERM');
      process.exit(0);
    });
  }

  async analyze() {
    console.log('📊 Tailwind CSS 분석을 시작합니다...');
    
    const args = [
      'tailwindcss',
      '-i', this.inputPath,
      '--analyze'
    ];

    const analyzeProcess = spawn('npx', args, {
      stdio: 'inherit',
      shell: true
    });

    analyzeProcess.on('error', (error) => {
      console.error('❌ Tailwind CSS 분석 오류:', error);
    });

    analyzeProcess.on('close', (code) => {
      console.log(`📊 Tailwind CSS 분석이 완료되었습니다. (코드: ${code})`);
    });
  }

  async build() {
    console.log('🔨 Tailwind CSS 빌드를 시작합니다...');
    
    const args = [
      'tailwindcss',
      '-i', this.inputPath,
      '-o', this.outputPath,
      '--minify'
    ];

    const buildProcess = spawn('npx', args, {
      stdio: 'inherit',
      shell: true
    });

    buildProcess.on('error', (error) => {
      console.error('❌ Tailwind CSS 빌드 오류:', error);
    });

    buildProcess.on('close', (code) => {
      console.log(`🔨 Tailwind CSS 빌드가 완료되었습니다. (코드: ${code})`);
    });
  }
}

// CLI 명령어 처리
const command = process.argv[2];

const tailwindMCP = new TailwindMCP();

switch (command) {
  case 'watch':
  case 'dev':
    tailwindMCP.init();
    break;
  case 'analyze':
    tailwindMCP.analyze();
    break;
  case 'build':
    tailwindMCP.build();
    break;
  default:
    console.log(`
🎨 Tailwind CSS MCP 서버

사용법:
  node scripts/tailwind-mcp.js [명령어]

명령어:
  watch, dev    - 감시 모드로 Tailwind CSS 컴파일
  analyze       - Tailwind CSS 사용량 분석
  build         - 프로덕션용 Tailwind CSS 빌드

예시:
  node scripts/tailwind-mcp.js watch
  node scripts/tailwind-mcp.js analyze
  node scripts/tailwind-mcp.js build
    `);
    break;
} 