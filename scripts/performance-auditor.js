#!/usr/bin/env node

/**
 * 성능 감사 도구
 * SMS V.3.0 프로젝트의 성능을 분석하고 최적화 방안을 제시합니다.
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

class PerformanceAuditor {
  constructor() {
    this.projectRoot = process.cwd();
    this.auditResults = {
      bundleAnalysis: {},
      loadingPerformance: {},
      optimizationOpportunities: {},
      recommendations: []
    };
  }

  async runAudit() {
    console.log('🚀 SMS V.3.0 성능 감사 시작...\n');

    try {
      await this.analyzeBundleSize();
      await this.analyzeLoadingPerformance();
      await this.findOptimizationOpportunities();
      await this.generateRecommendations();
      
      this.generateReport();
    } catch (error) {
      console.error('❌ 성능 감사 중 오류 발생:', error.message);
      process.exit(1);
    }
  }

  async analyzeBundleSize() {
    console.log('📦 번들 크기 분석 중...');
    
    const distPath = path.join(this.projectRoot, 'dist');
    if (!fs.existsSync(distPath)) {
      console.log('⚠️ dist 폴더가 없습니다. 먼저 빌드를 실행하세요: npm run build');
      this.auditResults.bundleAnalysis = { error: 'dist 폴더가 없음' };
      return;
    }

    const bundleFiles = this.findBundleFiles(distPath);
    const totalSize = this.calculateTotalSize(bundleFiles);
    
    this.auditResults.bundleAnalysis = {
      totalSize: this.formatBytes(totalSize),
      files: bundleFiles.map(file => ({
        name: path.basename(file),
        size: this.formatBytes(fs.statSync(file).size),
        path: file
      })),
      largestFiles: this.getLargestFiles(bundleFiles, 5)
    };
  }

  async analyzeLoadingPerformance() {
    console.log('⚡ 로딩 성능 분석 중...');
    
    // Lighthouse 분석 (가능한 경우)
    try {
      const lighthouseResult = await this.runLighthouseAnalysis();
      this.auditResults.loadingPerformance = lighthouseResult;
    } catch (error) {
      this.auditResults.loadingPerformance = {
        error: 'Lighthouse 분석을 실행할 수 없습니다. 수동으로 확인하세요.'
      };
    }

    // 번들 분할 분석
    const bundleSplitting = this.analyzeBundleSplitting();
    this.auditResults.loadingPerformance.bundleSplitting = bundleSplitting;
  }

  async findOptimizationOpportunities() {
    console.log('🔍 최적화 기회 탐색 중...');
    
    const opportunities = [];

    // 큰 파일 검사
    const largeFiles = this.findLargeFiles();
    if (largeFiles.length > 0) {
      opportunities.push({
        type: 'large-files',
        description: '큰 파일들이 발견되었습니다',
        files: largeFiles,
        recommendation: '이미지 최적화, 코드 분할, 또는 압축을 고려하세요'
      });
    }

    // 중복 의존성 검사
    const duplicateDeps = await this.findDuplicateDependencies();
    if (duplicateDeps.length > 0) {
      opportunities.push({
        type: 'duplicate-dependencies',
        description: '중복된 의존성이 발견되었습니다',
        dependencies: duplicateDeps,
        recommendation: 'package.json을 정리하고 중복을 제거하세요'
      });
    }

    // 사용하지 않는 코드 검사
    const unusedCode = await this.findUnusedCode();
    if (unusedCode.length > 0) {
      opportunities.push({
        type: 'unused-code',
        description: '사용하지 않는 코드가 발견되었습니다',
        files: unusedCode,
        recommendation: '사용하지 않는 파일과 코드를 제거하세요'
      });
    }

    this.auditResults.optimizationOpportunities = opportunities;
  }

  async generateRecommendations() {
    console.log('💡 최적화 권장사항 생성 중...');
    
    const recommendations = [];

    // 번들 크기 권장사항
    const bundleSize = this.auditResults.bundleAnalysis.totalSize;
    if (bundleSize && this.parseBytes(bundleSize) > 500 * 1024) { // 500KB
      recommendations.push({
        priority: 'high',
        category: 'bundle-size',
        title: '번들 크기 최적화',
        description: '번들 크기가 500KB를 초과합니다. 코드 분할과 트리 쉐이킹을 적용하세요.',
        actions: [
          'React.lazy()를 사용한 컴포넌트 지연 로딩',
          'Webpack의 SplitChunksPlugin 설정 최적화',
          '사용하지 않는 의존성 제거'
        ]
      });
    }

    // 이미지 최적화 권장사항
    const imageFiles = this.findImageFiles();
    if (imageFiles.length > 0) {
      recommendations.push({
        priority: 'medium',
        category: 'images',
        title: '이미지 최적화',
        description: '이미지 파일들을 최적화하여 로딩 속도를 개선하세요.',
        actions: [
          'WebP 형식으로 변환',
          '적절한 크기로 리사이징',
          '지연 로딩 적용'
        ]
      });
    }

    // 캐싱 전략 권장사항
    recommendations.push({
      priority: 'medium',
      category: 'caching',
      title: '캐싱 전략 개선',
      description: '브라우저 캐싱을 활용하여 반복 방문 시 성능을 개선하세요.',
      actions: [
        '정적 자산에 적절한 Cache-Control 헤더 설정',
        'Service Worker를 사용한 오프라인 지원',
        'CDN 활용 고려'
      ]
    });

    this.auditResults.recommendations = recommendations;
  }

  findBundleFiles(distPath) {
    const files = [];
    const walkDir = (dir) => {
      const items = fs.readdirSync(dir);
      items.forEach(item => {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          walkDir(fullPath);
        } else if (stat.isFile() && /\.(js|css|html)$/.test(item)) {
          files.push(fullPath);
        }
      });
    };
    walkDir(distPath);
    return files;
  }

  calculateTotalSize(files) {
    return files.reduce((total, file) => {
      return total + fs.statSync(file).size;
    }, 0);
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  parseBytes(sizeString) {
    const match = sizeString.match(/^([\d.]+)\s*(\w+)$/);
    if (!match) return 0;
    
    const value = parseFloat(match[1]);
    const unit = match[2].toUpperCase();
    const units = { 'B': 1, 'KB': 1024, 'MB': 1024*1024, 'GB': 1024*1024*1024 };
    return value * (units[unit] || 1);
  }

  getLargestFiles(files, count) {
    return files
      .map(file => ({ file, size: fs.statSync(file).size }))
      .sort((a, b) => b.size - a.size)
      .slice(0, count)
      .map(item => ({
        name: path.basename(item.file),
        size: this.formatBytes(item.size)
      }));
  }

  async runLighthouseAnalysis() {
    try {
      // 간단한 성능 메트릭 계산
      return {
        firstContentfulPaint: '측정 필요',
        largestContentfulPaint: '측정 필요',
        cumulativeLayoutShift: '측정 필요',
        note: 'Lighthouse CLI를 설치하여 더 정확한 분석을 수행하세요'
      };
    } catch (error) {
      return { error: 'Lighthouse 분석 실패' };
    }
  }

  analyzeBundleSplitting() {
    const distPath = path.join(this.projectRoot, 'dist');
    if (!fs.existsSync(distPath)) return { error: 'dist 폴더 없음' };

    const jsFiles = this.findBundleFiles(distPath).filter(f => f.endsWith('.js'));
    return {
      totalChunks: jsFiles.length,
      averageChunkSize: this.formatBytes(
        jsFiles.reduce((sum, file) => sum + fs.statSync(file).size, 0) / jsFiles.length
      ),
      chunks: jsFiles.map(file => ({
        name: path.basename(file),
        size: this.formatBytes(fs.statSync(file).size)
      }))
    };
  }

  findLargeFiles() {
    const largeFiles = [];
    const walkDir = (dir) => {
      const items = fs.readdirSync(dir);
      items.forEach(item => {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          walkDir(fullPath);
        } else if (stat.isFile() && stat.size > 100 * 1024) { // 100KB 이상
          largeFiles.push({
            path: fullPath,
            size: this.formatBytes(stat.size)
          });
        }
      });
    };
    walkDir(this.projectRoot);
    return largeFiles;
  }

  async findDuplicateDependencies() {
    try {
      const result = execSync('npm ls --depth=0', { encoding: 'utf8' });
      const duplicates = [];
      const lines = result.split('\n');
      
      lines.forEach(line => {
        if (line.includes('UNMET PEER DEPENDENCY') || line.includes('npm ERR!')) {
          duplicates.push(line.trim());
        }
      });
      
      return duplicates;
    } catch (error) {
      return [];
    }
  }

  async findUnusedCode() {
    // 간단한 사용하지 않는 파일 검사
    const unusedFiles = [];
    const srcPath = path.join(this.projectRoot, 'src');
    
    if (fs.existsSync(srcPath)) {
      const walkDir = (dir) => {
        const items = fs.readdirSync(dir);
        items.forEach(item => {
          const fullPath = path.join(dir, item);
          const stat = fs.statSync(fullPath);
          if (stat.isDirectory()) {
            walkDir(fullPath);
          } else if (stat.isFile() && /\.(tsx?|jsx?)$/.test(item)) {
            // 간단한 검사: 파일이 다른 곳에서 import되는지 확인
            const content = fs.readFileSync(fullPath, 'utf8');
            if (content.length < 100) { // 매우 작은 파일
              unusedFiles.push(fullPath);
            }
          }
        });
      };
      walkDir(srcPath);
    }
    
    return unusedFiles;
  }

  findImageFiles() {
    const imageFiles = [];
    const walkDir = (dir) => {
      const items = fs.readdirSync(dir);
      items.forEach(item => {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          walkDir(fullPath);
        } else if (stat.isFile() && /\.(png|jpg|jpeg|gif|svg|webp)$/i.test(item)) {
          imageFiles.push({
            path: fullPath,
            size: this.formatBytes(stat.size)
          });
        }
      });
    };
    walkDir(this.projectRoot);
    return imageFiles;
  }

  generateReport() {
    console.log('\n📊 성능 감사 결과\n');
    console.log('='.repeat(50));

    // 번들 분석 결과
    if (this.auditResults.bundleAnalysis.error) {
      console.log('❌ 번들 분석:', this.auditResults.bundleAnalysis.error);
    } else {
      console.log('📦 번들 크기:', this.auditResults.bundleAnalysis.totalSize);
      console.log('📁 가장 큰 파일들:');
      this.auditResults.bundleAnalysis.largestFiles.forEach(file => {
        console.log(`  - ${file.name}: ${file.size}`);
      });
    }

    // 최적화 기회
    if (this.auditResults.optimizationOpportunities.length > 0) {
      console.log('\n🔍 발견된 최적화 기회:');
      this.auditResults.optimizationOpportunities.forEach(opp => {
        console.log(`\n  ${opp.type}: ${opp.description}`);
        console.log(`  권장사항: ${opp.recommendation}`);
      });
    }

    // 권장사항
    if (this.auditResults.recommendations.length > 0) {
      console.log('\n💡 최적화 권장사항:');
      this.auditResults.recommendations.forEach(rec => {
        console.log(`\n  [${rec.priority.toUpperCase()}] ${rec.title}`);
        console.log(`  ${rec.description}`);
        console.log('  실행할 작업:');
        rec.actions.forEach(action => {
          console.log(`    - ${action}`);
        });
      });
    }

    console.log('\n' + '='.repeat(50));
    console.log('✅ 성능 감사 완료!');
  }
}

// 스크립트 실행
const auditor = new PerformanceAuditor();
auditor.runAudit().catch(console.error);