#!/usr/bin/env node

import { spawn } from 'child_process';
import readline from 'readline';

class GitMCPServer {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  // Git 명령어 실행
  async executeGitCommand(args) {
    return new Promise((resolve, reject) => {
      const gitProcess = spawn('git', args, {
        cwd: process.cwd(),
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let stdout = '';
      let stderr = '';

      gitProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      gitProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      gitProcess.on('close', (code) => {
        if (code === 0) {
          resolve({ success: true, output: stdout.trim() });
        } else {
          reject({ success: false, error: stderr.trim(), code });
        }
      });
    });
  }

  // Git 상태 확인
  async getStatus() {
    try {
      const result = await this.executeGitCommand(['status', '--porcelain']);
      return {
        method: 'git/status',
        params: {},
        result: result.output
      };
    } catch (error) {
      return {
        method: 'git/status',
        params: {},
        error: error.error
      };
    }
  }

  // Git 로그 확인
  async getLog(limit = 10) {
    try {
      const result = await this.executeGitCommand(['log', '--oneline', `-${limit}`]);
      return {
        method: 'git/log',
        params: { limit },
        result: result.output
      };
    } catch (error) {
      return {
        method: 'git/log',
        params: { limit },
        error: error.error
      };
    }
  }

  // Git 브랜치 확인
  async getBranches() {
    try {
      const result = await this.executeGitCommand(['branch', '-a']);
      return {
        method: 'git/branches',
        params: {},
        result: result.output
      };
    } catch (error) {
      return {
        method: 'git/branches',
        params: {},
        error: error.error
      };
    }
  }

  // Git 커밋
  async commit(message) {
    try {
      await this.executeGitCommand(['add', '.']);
      const result = await this.executeGitCommand(['commit', '-m', message]);
      return {
        method: 'git/commit',
        params: { message },
        result: result.output
      };
    } catch (error) {
      return {
        method: 'git/commit',
        params: { message },
        error: error.error
      };
    }
  }

  // Git 푸시
  async push(branch = 'main') {
    try {
      const result = await this.executeGitCommand(['push', 'origin', branch]);
      return {
        method: 'git/push',
        params: { branch },
        result: result.output
      };
    } catch (error) {
      return {
        method: 'git/push',
        params: { branch },
        error: error.error
      };
    }
  }

  // Git 풀
  async pull(branch = 'main') {
    try {
      const result = await this.executeGitCommand(['pull', 'origin', branch]);
      return {
        method: 'git/pull',
        params: { branch },
        result: result.output
      };
    } catch (error) {
      return {
        method: 'git/pull',
        params: { branch },
        error: error.error
      };
    }
  }

  // Git 체크아웃
  async checkout(branch) {
    try {
      const result = await this.executeGitCommand(['checkout', branch]);
      return {
        method: 'git/checkout',
        params: { branch },
        result: result.output
      };
    } catch (error) {
      return {
        method: 'git/checkout',
        params: { branch },
        error: error.error
      };
    }
  }

  // Git 브랜치 생성
  async createBranch(branchName) {
    try {
      const result = await this.executeGitCommand(['checkout', '-b', branchName]);
      return {
        method: 'git/createBranch',
        params: { branchName },
        result: result.output
      };
    } catch (error) {
      return {
        method: 'git/createBranch',
        params: { branchName },
        error: error.error
      };
    }
  }

  // Git 원격 저장소 정보
  async getRemotes() {
    try {
      const result = await this.executeGitCommand(['remote', '-v']);
      return {
        method: 'git/remotes',
        params: {},
        result: result.output
      };
    } catch (error) {
      return {
        method: 'git/remotes',
        params: {},
        error: error.error
      };
    }
  }

  // 요청 처리
  async handleRequest(request) {
    const { method, params } = request;

    switch (method) {
      case 'git/status':
        return await this.getStatus();
      case 'git/log':
        return await this.getLog(params?.limit);
      case 'git/branches':
        return await this.getBranches();
      case 'git/commit':
        return await this.commit(params?.message);
      case 'git/push':
        return await this.push(params?.branch);
      case 'git/pull':
        return await this.pull(params?.branch);
      case 'git/checkout':
        return await this.checkout(params?.branch);
      case 'git/createBranch':
        return await this.createBranch(params?.branchName);
      case 'git/remotes':
        return await this.getRemotes();
      default:
        return {
          method,
          params,
          error: `Unknown method: ${method}`
        };
    }
  }

  // 서버 시작
  start() {
    console.log('Git MCP Server started');
    console.log('Available methods:');
    console.log('- git/status: Get current git status');
    console.log('- git/log: Get git log');
    console.log('- git/branches: Get all branches');
    console.log('- git/commit: Commit changes');
    console.log('- git/push: Push to remote');
    console.log('- git/pull: Pull from remote');
    console.log('- git/checkout: Checkout branch');
    console.log('- git/createBranch: Create new branch');
    console.log('- git/remotes: Get remote repositories');
    console.log('');
    console.log('Waiting for input...');

    this.rl.on('line', async (input) => {
      try {
        console.log('Received input:', input);
        const request = JSON.parse(input);
        const response = await this.handleRequest(request);
        console.log('Response:', JSON.stringify(response));
      } catch (error) {
        console.log('Error:', JSON.stringify({
          error: 'Invalid JSON input',
          details: error.message
        }));
      }
    });

    this.rl.on('close', () => {
      console.log('Server stopped');
    });
  }
}

// 서버 시작
if (import.meta.url === `file://${process.argv[1]}`) {
  const server = new GitMCPServer();
  server.start();
}

export default GitMCPServer; 