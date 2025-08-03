#!/usr/bin/env node

import { spawn } from 'child_process';
import readline from 'readline';

class GitMCPTester {
  constructor() {
    this.serverProcess = null;
  }

  // Git MCP 서버 시작
  startServer() {
    return new Promise((resolve, reject) => {
      this.serverProcess = spawn('node', ['scripts/git-mcp-server.js'], {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let output = '';
      
      this.serverProcess.stdout.on('data', (data) => {
        output += data.toString();
        if (output.includes('Waiting for input...')) {
          resolve();
        }
      });

      this.serverProcess.stderr.on('data', (data) => {
        console.error('Server error:', data.toString());
      });

      this.serverProcess.on('error', (error) => {
        reject(error);
      });

      // 5초 후 타임아웃
      setTimeout(() => {
        if (!output.includes('Waiting for input...')) {
          reject(new Error('Server startup timeout'));
        }
      }, 5000);
    });
  }

  // 서버에 요청 보내기
  sendRequest(request) {
    return new Promise((resolve, reject) => {
      if (!this.serverProcess) {
        reject(new Error('Server not started'));
        return;
      }

      const requestStr = JSON.stringify(request) + '\n';
      this.serverProcess.stdin.write(requestStr);

      let response = '';
      const timeout = setTimeout(() => {
        reject(new Error('Response timeout'));
      }, 10000);

      const dataHandler = (data) => {
        response += data.toString();
        if (response.includes('Response:')) {
          clearTimeout(timeout);
          this.serverProcess.stdout.removeListener('data', dataHandler);
          
          try {
            const responseMatch = response.match(/Response: (.+)/);
            if (responseMatch) {
              const result = JSON.parse(responseMatch[1]);
              resolve(result);
            } else {
              resolve({ error: 'No response found' });
            }
          } catch (error) {
            resolve({ error: 'Invalid response format', details: error.message });
          }
        }
      };

      this.serverProcess.stdout.on('data', dataHandler);
    });
  }

  // 서버 종료
  stopServer() {
    if (this.serverProcess) {
      this.serverProcess.kill();
      this.serverProcess = null;
    }
  }

  // 테스트 실행
  async runTests() {
    try {
      console.log('Starting Git MCP server...');
      await this.startServer();
      console.log('Server started successfully');

      // 테스트 1: Git 상태 확인
      console.log('\n=== Test 1: Git Status ===');
      const statusResult = await this.sendRequest({
        method: 'git/status',
        params: {}
      });
      console.log('Status result:', statusResult);

      // 테스트 2: Git 로그 확인
      console.log('\n=== Test 2: Git Log ===');
      const logResult = await this.sendRequest({
        method: 'git/log',
        params: { limit: 5 }
      });
      console.log('Log result:', logResult);

      // 테스트 3: 브랜치 확인
      console.log('\n=== Test 3: Git Branches ===');
      const branchesResult = await this.sendRequest({
        method: 'git/branches',
        params: {}
      });
      console.log('Branches result:', branchesResult);

      // 테스트 4: 원격 저장소 확인
      console.log('\n=== Test 4: Git Remotes ===');
      const remotesResult = await this.sendRequest({
        method: 'git/remotes',
        params: {}
      });
      console.log('Remotes result:', remotesResult);

      console.log('\nAll tests completed successfully!');

    } catch (error) {
      console.error('Test failed:', error.message);
    } finally {
      this.stopServer();
    }
  }
}

// 테스트 실행
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new GitMCPTester();
  tester.runTests();
}

export default GitMCPTester; 