#!/usr/bin/env node

/**
 * MCP 통합 대시보드
 * 모든 MCP 서버의 상태를 모니터링하고 관리합니다.
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

class MCPDashboard {
  constructor() {
    this.projectRoot = process.cwd();
    this.mcpServers = {
      filesystem: { status: 'stopped', process: null },
      git: { status: 'stopped', process: null },
      database: { status: 'stopped', process: null },
      testing: { status: 'stopped', process: null },
      tailwind: { status: 'stopped', process: null }
    };
    this.dashboardData = {
      uptime: 0,
      requests: 0,
      errors: 0,
      lastUpdate: new Date()
    };
  }

  async start() {
    console.log('🚀 MCP 통합 대시보드 시작...\n');
    
    this.displayHeader();
    await this.loadConfiguration();
    await this.startServers();
    this.startMonitoring();
    this.displayMenu();
  }

  displayHeader() {
    console.log('╔══════════════════════════════════════════════════════════════╗');
    console.log('║                    SMS V.3.0 MCP 대시보드                    ║');
    console.log('╠══════════════════════════════════════════════════════════════╣');
    console.log('║  📊 파일시스템 분석  🔒 보안 검사  ⚡ 성능 모니터링         ║');
    console.log('║  🧪 테스트 자동화  📦 의존성 관리  🎨 UI/UX 최적화         ║');
    console.log('╚══════════════════════════════════════════════════════════════╝\n');
  }

  async loadConfiguration() {
    try {
      const configPath = path.join(this.projectRoot, 'mcp-config.json');
      if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        console.log('✅ MCP 설정 파일 로드 완료');
        return config;
      } else {
        console.log('⚠️  MCP 설정 파일을 찾을 수 없습니다');
        return null;
      }
    } catch (error) {
      console.log('❌ 설정 파일 로드 실패:', error.message);
      return null;
    }
  }

  async startServers() {
    console.log('\n🔄 MCP 서버 시작 중...\n');
    
    // Filesystem MCP
    await this.startServer('filesystem', 'npm run mcp:filesystem');
    
    // Tailwind MCP
    await this.startServer('tailwind', 'npm run tailwind:mcp:watch');
    
    console.log('✅ 모든 MCP 서버가 시작되었습니다\n');
  }

  async startServer(name, command) {
    return new Promise((resolve) => {
      console.log(`🔄 ${name} 서버 시작 중...`);
      
      const [cmd, ...args] = command.split(' ');
      const process = spawn(cmd, args, {
        stdio: 'pipe',
        shell: true
      });
      
      this.mcpServers[name].process = process;
      this.mcpServers[name].status = 'running';
      
      process.stdout.on('data', (data) => {
        console.log(`[${name}] ${data.toString().trim()}`);
      });
      
      process.stderr.on('data', (data) => {
        console.log(`[${name}] ERROR: ${data.toString().trim()}`);
        this.dashboardData.errors++;
      });
      
      process.on('close', (code) => {
        console.log(`[${name}] 서버 종료 (코드: ${code})`);
        this.mcpServers[name].status = 'stopped';
      });
      
      // 서버 시작 대기
      setTimeout(() => {
        console.log(`✅ ${name} 서버 시작 완료`);
        resolve();
      }, 2000);
    });
  }

  startMonitoring() {
    setInterval(() => {
      this.dashboardData.uptime++;
      this.dashboardData.lastUpdate = new Date();
      this.updateDashboard();
    }, 1000);
  }

  updateDashboard() {
    // 터미널 클리어 (Windows)
    if (process.platform === 'win32') {
      process.stdout.write('\x1Bc');
    } else {
      process.stdout.write('\x1B[2J\x1B[0f');
    }
    
    this.displayHeader();
    this.displayServerStatus();
    this.displayMetrics();
    this.displayMenu();
  }

  displayServerStatus() {
    console.log('📡 MCP 서버 상태:');
    console.log('┌─────────────────┬──────────┬─────────────────┐');
    console.log('│ 서버명          │ 상태     │ 실행 시간       │');
    console.log('├─────────────────┼──────────┼─────────────────┤');
    
    Object.entries(this.mcpServers).forEach(([name, server]) => {
      const status = server.status === 'running' ? '🟢 실행중' : '🔴 중지됨';
      const uptime = server.status === 'running' ? `${this.dashboardData.uptime}s` : '-';
      console.log(`│ ${name.padEnd(15)} │ ${status.padEnd(8)} │ ${uptime.padEnd(15)} │`);
    });
    
    console.log('└─────────────────┴──────────┴─────────────────┘\n');
  }

  displayMetrics() {
    console.log('📊 실시간 메트릭:');
    console.log(`  • 업타임: ${this.dashboardData.uptime}초`);
    console.log(`  • 요청 수: ${this.dashboardData.requests}`);
    console.log(`  • 오류 수: ${this.dashboardData.errors}`);
    console.log(`  • 마지막 업데이트: ${this.dashboardData.lastUpdate.toLocaleTimeString()}`);
    console.log('');
  }

  displayMenu() {
    console.log('🎛️  대시보드 메뉴:');
    console.log('  1. 프로젝트 분석 실행');
    console.log('  2. 보안 스캔 실행');
    console.log('  3. 성능 감사 실행');
    console.log('  4. 서버 상태 새로고침');
    console.log('  5. 모든 서버 재시작');
    console.log('  6. 대시보드 종료');
    console.log('');
    console.log('명령어를 입력하세요 (1-6): ');
  }

  async handleCommand(command) {
    switch (command.trim()) {
      case '1':
        await this.runProjectAnalysis();
        break;
      case '2':
        await this.runSecurityScan();
        break;
      case '3':
        await this.runPerformanceAudit();
        break;
      case '4':
        this.refreshServerStatus();
        break;
      case '5':
        await this.restartAllServers();
        break;
      case '6':
        await this.shutdown();
        break;
      default:
        console.log('❌ 잘못된 명령어입니다.');
    }
  }

  async runProjectAnalysis() {
    console.log('\n🔍 프로젝트 분석 실행 중...');
    try {
      const { execSync } = require('child_process');
      execSync('npm run mcp:analyze', { stdio: 'inherit' });
    } catch (error) {
      console.log('❌ 분석 실행 실패:', error.message);
    }
  }

  async runSecurityScan() {
    console.log('\n🔒 보안 스캔 실행 중...');
    try {
      const { execSync } = require('child_process');
      execSync('npm run mcp:security-scan', { stdio: 'inherit' });
    } catch (error) {
      console.log('❌ 보안 스캔 실패:', error.message);
    }
  }

  async runPerformanceAudit() {
    console.log('\n⚡ 성능 감사 실행 중...');
    try {
      const { execSync } = require('child_process');
      execSync('npm run mcp:performance-audit', { stdio: 'inherit' });
    } catch (error) {
      console.log('❌ 성능 감사 실패:', error.message);
    }
  }

  refreshServerStatus() {
    console.log('\n🔄 서버 상태 새로고침 중...');
    Object.keys(this.mcpServers).forEach(name => {
      const server = this.mcpServers[name];
      if (server.process && !server.process.killed) {
        server.status = 'running';
      } else {
        server.status = 'stopped';
      }
    });
    console.log('✅ 서버 상태 업데이트 완료');
  }

  async restartAllServers() {
    console.log('\n🔄 모든 서버 재시작 중...');
    
    // 기존 서버 종료
    Object.values(this.mcpServers).forEach(server => {
      if (server.process && !server.process.killed) {
        server.process.kill();
      }
    });
    
    // 서버 재시작
    await this.startServers();
  }

  async shutdown() {
    console.log('\n🛑 대시보드 종료 중...');
    
    // 모든 서버 종료
    Object.values(this.mcpServers).forEach(server => {
      if (server.process && !server.process.killed) {
        server.process.kill();
      }
    });
    
    console.log('✅ 모든 MCP 서버가 종료되었습니다.');
    process.exit(0);
  }
}

// 실행
if (require.main === module) {
  const dashboard = new MCPDashboard();
  
  // 사용자 입력 처리
  process.stdin.on('data', (data) => {
    dashboard.handleCommand(data.toString());
  });
  
  dashboard.start();
}

module.exports = MCPDashboard; 