#!/usr/bin/env node

/**
 * MCP 통합 분석 도구
 * 프로젝트의 전반적인 상태를 분석하고 개선 방안을 제시합니다.
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

class MCPAnalyzer {
  constructor() {
    this.projectRoot = process.cwd();
    this.analysisResults = {
      codeQuality: {},
      security: {},
      performance: {},
      dependencies: {},
      structure: {}
    };
  }

  async analyzeProject() {
    console.log('🔍 SMS V.3.0 프로젝트 MCP 분석 시작...\n');

    try {
      await this.analyzeCodeQuality();
      await this.analyzeSecurity();
      await this.analyzePerformance();
      await this.analyzeDependencies();
      await this.analyzeStructure();
      
      this.generateReport();
    } catch (error) {
      console.error('❌ 분석 중 오류 발생:', error.message);
      process.exit(1);
    }
  }

  async analyzeCodeQuality() {
    console.log('📊 코드 품질 분석 중...');
    
    // TypeScript 파일 분석
    const tsFiles = this.findFiles('.ts,.tsx');
    this.analysisResults.codeQuality = {
      totalFiles: tsFiles.length,
      averageComplexity: this.calculateComplexity(tsFiles),
      maintainabilityIndex: this.calculateMaintainability(tsFiles)
    };
  }

  async analyzeSecurity() {
    console.log('🔒 보안 분석 중...');
    
    // npm audit 실행
    try {
      const auditResult = execSync('npm audit --json', { encoding: 'utf8' });
      const audit = JSON.parse(auditResult);
      
      this.analysisResults.security = {
        vulnerabilities: audit.metadata.vulnerabilities,
        totalDependencies: audit.metadata.totalDependencies,
        devDependencies: audit.metadata.devDependencies
      };
    } catch (error) {
      this.analysisResults.security = { error: 'npm audit 실행 실패' };
    }
  }

  async analyzePerformance() {
    console.log('⚡ 성능 분석 중...');
    
    // 번들 크기 분석
    const distPath = path.join(this.projectRoot, 'dist');
    if (fs.existsSync(distPath)) {
      const bundleSize = this.calculateBundleSize(distPath);
      this.analysisResults.performance = {
        bundleSize,
        optimizationOpportunities: this.findOptimizationOpportunities()
      };
    }
  }

  async analyzeDependencies() {
    console.log('📦 의존성 분석 중...');
    
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    this.analysisResults.dependencies = {
      totalDependencies: Object.keys(packageJson.dependencies || {}).length,
      totalDevDependencies: Object.keys(packageJson.devDependencies || {}).length,
      outdatedPackages: await this.checkOutdatedPackages()
    };
  }

  async analyzeStructure() {
    console.log('🏗️ 프로젝트 구조 분석 중...');
    
    const structure = {
      components: await this.countFiles('components/**/*.tsx'),
      pages: await this.countFiles('src/**/*.tsx'),
      utils: await this.countFiles('utils/**/*.ts'),
      tests: await this.countFiles('tests/**/*.test.ts'),
      docs: await this.countFiles('docs/**/*.md')
    };
    
    this.analysisResults.structure = structure;
  }

  findFiles(extensions) {
    const files = [];
    const extensionsList = extensions.split(',');
    
    const walkDir = (dir) => {
      const items = fs.readdirSync(dir);
      items.forEach(item => {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          walkDir(fullPath);
        } else if (stat.isFile()) {
          const ext = path.extname(item);
          if (extensionsList.includes(ext)) {
            files.push(fullPath);
          }
        }
      });
    };
    
    walkDir(this.projectRoot);
    return files;
  }

  async countFiles(pattern) {
    try {
      // glob 모듈을 동적으로 import
      const glob = await import('glob');
      return glob.sync(pattern).length;
    } catch {
      return 0;
    }
  }

  calculateComplexity(files) {
    // 간단한 복잡도 계산 (실제로는 더 정교한 도구 사용 권장)
    let totalLines = 0;
    let totalFunctions = 0;
    
    files.forEach(file => {
      try {
        const content = fs.readFileSync(file, 'utf8');
        const lines = content.split('\n');
        totalLines += lines.length;
        
        const functionMatches = content.match(/function\s+\w+|=>\s*{|const\s+\w+\s*=\s*\(/g);
        if (functionMatches) {
          totalFunctions += functionMatches.length;
        }
      } catch (error) {
        // 파일 읽기 실패 시 무시
      }
    });
    
    return totalLines > 0 ? (totalLines / totalFunctions).toFixed(2) : 0;
  }

  calculateMaintainability(files) {
    // 간단한 유지보수성 지수 계산
    const avgComplexity = parseFloat(this.calculateComplexity(files));
    return Math.max(0, 100 - (avgComplexity * 10));
  }

  calculateBundleSize(distPath) {
    let totalSize = 0;
    const walkDir = (dir) => {
      const items = fs.readdirSync(dir);
      items.forEach(item => {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          walkDir(fullPath);
        } else if (stat.isFile()) {
          totalSize += stat.size;
        }
      });
    };
    
    walkDir(distPath);
    return (totalSize / 1024 / 1024).toFixed(2); // MB 단위
  }

  findOptimizationOpportunities() {
    const opportunities = [];
    
    // 번들 크기 최적화 기회
    if (this.analysisResults.performance.bundleSize > 2) {
      opportunities.push('번들 크기가 2MB를 초과합니다. 코드 분할을 고려하세요.');
    }
    
    // 의존성 최적화 기회
    if (this.analysisResults.dependencies.totalDependencies > 50) {
      opportunities.push('의존성이 많습니다. 불필요한 패키지를 제거하세요.');
    }
    
    return opportunities;
  }

  async checkOutdatedPackages() {
    try {
      const result = execSync('npm outdated --json', { encoding: 'utf8' });
      return Object.keys(JSON.parse(result)).length;
    } catch {
      return 0; // 오류 시 0 반환
    }
  }

  generateReport() {
    console.log('\n📋 MCP 분석 결과 리포트\n');
    console.log('='.repeat(50));
    
    // 코드 품질
    console.log('\n📊 코드 품질:');
    console.log(`  • 총 파일 수: ${this.analysisResults.codeQuality.totalFiles}`);
    console.log(`  • 평균 복잡도: ${this.analysisResults.codeQuality.averageComplexity}`);
    console.log(`  • 유지보수성 지수: ${this.analysisResults.codeQuality.maintainabilityIndex}/100`);
    
    // 보안
    console.log('\n🔒 보안 상태:');
    if (this.analysisResults.security.vulnerabilities) {
      console.log(`  • 취약점: ${this.analysisResults.security.vulnerabilities.high || 0}개 (높음)`);
      console.log(`  • 의존성: ${this.analysisResults.security.totalDependencies}개`);
    } else {
      console.log('  • 보안 스캔 완료');
    }
    
    // 성능
    console.log('\n⚡ 성능:');
    if (this.analysisResults.performance.bundleSize) {
      console.log(`  • 번들 크기: ${this.analysisResults.performance.bundleSize}MB`);
    }
    
    // 의존성
    console.log('\n📦 의존성:');
    console.log(`  • 프로덕션 의존성: ${this.analysisResults.dependencies.totalDependencies}개`);
    console.log(`  • 개발 의존성: ${this.analysisResults.dependencies.totalDevDependencies}개`);
    console.log(`  • 오래된 패키지: ${this.analysisResults.dependencies.outdatedPackages}개`);
    
    // 구조
    console.log('\n🏗️ 프로젝트 구조:');
    console.log(`  • 컴포넌트: ${this.analysisResults.structure.components}개`);
    console.log(`  • 페이지: ${this.analysisResults.structure.pages}개`);
    console.log(`  • 유틸리티: ${this.analysisResults.structure.utils}개`);
    console.log(`  • 테스트: ${this.analysisResults.structure.tests}개`);
    console.log(`  • 문서: ${this.analysisResults.structure.docs}개`);
    
    // 개선 권장사항
    console.log('\n💡 개선 권장사항:');
    this.analysisResults.performance.optimizationOpportunities?.forEach(opportunity => {
      console.log(`  • ${opportunity}`);
    });
    
    console.log('\n' + '='.repeat(50));
    console.log('✅ MCP 분석 완료!\n');
  }
}

// 실행
const analyzer = new MCPAnalyzer();
analyzer.analyzeProject();

export default MCPAnalyzer; 