#!/usr/bin/env node

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { spawn } = require('child_process');
const path = require('path');

class GitHubRepoManager {
  constructor() {
    this.ghPath = process.env.GITHUB_CLI_PATH || 'gh';
    this.server = new Server(
      {
        name: 'github-repo-manager',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
  }

  setupToolHandlers() {
    // 리포지토리 목록 조회
    this.server.setRequestHandler('tools/call', async (request) => {
      const { name, arguments: args } = request.params;

      switch (name) {
        case 'list_repositories':
          return await this.listRepositories();
        case 'get_repository_info':
          return await this.getRepositoryInfo(args.repo);
        case 'create_repository':
          return await this.createRepository(args.name, args.description, args.private);
        case 'delete_repository':
          return await this.deleteRepository(args.repo);
        case 'clone_repository':
          return await this.cloneRepository(args.repo, args.path);
        case 'list_issues':
          return await this.listIssues(args.repo);
        case 'create_issue':
          return await this.createIssue(args.repo, args.title, args.body);
        case 'list_pull_requests':
          return await this.listPullRequests(args.repo);
        case 'create_pull_request':
          return await this.createPullRequest(args.repo, args.title, args.body, args.head, args.base);
        case 'list_branches':
          return await this.listBranches(args.repo);
        case 'create_branch':
          return await this.createBranch(args.repo, args.branch, args.base);
        case 'list_releases':
          return await this.listReleases(args.repo);
        case 'create_release':
          return await this.createRelease(args.repo, args.tag, args.title, args.body);
        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    });
  }

  async executeGhCommand(args) {
    return new Promise((resolve, reject) => {
      const child = spawn(this.ghPath, args, {
        stdio: ['pipe', 'pipe', 'pipe'],
        shell: true
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve(stdout.trim());
        } else {
          reject(new Error(`GitHub CLI command failed: ${stderr}`));
        }
      });

      child.on('error', (error) => {
        reject(error);
      });
    });
  }

  async listRepositories() {
    try {
      const result = await this.executeGhCommand(['repo', 'list', '--json', 'name,description,private,url,updatedAt']);
      return {
        content: [
          {
            type: 'text',
            text: `리포지토리 목록:\n${result}`
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `리포지토리 목록 조회 실패: ${error.message}`
          }
        ]
      };
    }
  }

  async getRepositoryInfo(repo) {
    try {
      const result = await this.executeGhCommand(['repo', 'view', repo, '--json', 'name,description,private,url,updatedAt,defaultBranchRef']);
      return {
        content: [
          {
            type: 'text',
            text: `리포지토리 정보:\n${result}`
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `리포지토리 정보 조회 실패: ${error.message}`
          }
        ]
      };
    }
  }

  async createRepository(name, description = '', isPrivate = false) {
    try {
      const args = ['repo', 'create', name];
      if (description) args.push('--description', description);
      if (isPrivate) args.push('--private');
      else args.push('--public');

      const result = await this.executeGhCommand(args);
      return {
        content: [
          {
            type: 'text',
            text: `리포지토리 생성 완료:\n${result}`
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `리포지토리 생성 실패: ${error.message}`
          }
        ]
      };
    }
  }

  async deleteRepository(repo) {
    try {
      const result = await this.executeGhCommand(['repo', 'delete', repo, '--yes']);
      return {
        content: [
          {
            type: 'text',
            text: `리포지토리 삭제 완료: ${repo}`
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `리포지토리 삭제 실패: ${error.message}`
          }
        ]
      };
    }
  }

  async cloneRepository(repo, path = '.') {
    try {
      const result = await this.executeGhCommand(['repo', 'clone', repo, path]);
      return {
        content: [
          {
            type: 'text',
            text: `리포지토리 클론 완료: ${repo} -> ${path}`
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `리포지토리 클론 실패: ${error.message}`
          }
        ]
      };
    }
  }

  async listIssues(repo) {
    try {
      const result = await this.executeGhCommand(['issue', 'list', '--repo', repo, '--json', 'number,title,state,author,createdAt']);
      return {
        content: [
          {
            type: 'text',
            text: `이슈 목록:\n${result}`
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `이슈 목록 조회 실패: ${error.message}`
          }
        ]
      };
    }
  }

  async createIssue(repo, title, body = '') {
    try {
      const args = ['issue', 'create', '--repo', repo, '--title', title];
      if (body) args.push('--body', body);

      const result = await this.executeGhCommand(args);
      return {
        content: [
          {
            type: 'text',
            text: `이슈 생성 완료:\n${result}`
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `이슈 생성 실패: ${error.message}`
          }
        ]
      };
    }
  }

  async listPullRequests(repo) {
    try {
      const result = await this.executeGhCommand(['pr', 'list', '--repo', repo, '--json', 'number,title,state,author,createdAt']);
      return {
        content: [
          {
            type: 'text',
            text: `Pull Request 목록:\n${result}`
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Pull Request 목록 조회 실패: ${error.message}`
          }
        ]
      };
    }
  }

  async createPullRequest(repo, title, body = '', head = '', base = 'main') {
    try {
      const args = ['pr', 'create', '--repo', repo, '--title', title, '--base', base];
      if (body) args.push('--body', body);
      if (head) args.push('--head', head);

      const result = await this.executeGhCommand(args);
      return {
        content: [
          {
            type: 'text',
            text: `Pull Request 생성 완료:\n${result}`
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Pull Request 생성 실패: ${error.message}`
          }
        ]
      };
    }
  }

  async listBranches(repo) {
    try {
      const result = await this.executeGhCommand(['repo', 'view', repo, '--json', 'defaultBranchRef,refs']);
      return {
        content: [
          {
            type: 'text',
            text: `브랜치 목록:\n${result}`
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `브랜치 목록 조회 실패: ${error.message}`
          }
        ]
      };
    }
  }

  async createBranch(repo, branch, base = 'main') {
    try {
      const result = await this.executeGhCommand(['api', 'repos/:owner/:repo/git/refs', '--method', 'POST', '--field', `ref=refs/heads/${branch}`, '--field', `sha=${base}`]);
      return {
        content: [
          {
            type: 'text',
            text: `브랜치 생성 완료: ${branch}`
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `브랜치 생성 실패: ${error.message}`
          }
        ]
      };
    }
  }

  async listReleases(repo) {
    try {
      const result = await this.executeGhCommand(['release', 'list', '--repo', repo, '--json', 'tagName,name,publishedAt,url']);
      return {
        content: [
          {
            type: 'text',
            text: `릴리스 목록:\n${result}`
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `릴리스 목록 조회 실패: ${error.message}`
          }
        ]
      };
    }
  }

  async createRelease(repo, tag, title, body = '') {
    try {
      const args = ['release', 'create', tag, '--repo', repo, '--title', title];
      if (body) args.push('--notes', body);

      const result = await this.executeGhCommand(args);
      return {
        content: [
          {
            type: 'text',
            text: `릴리스 생성 완료:\n${result}`
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `릴리스 생성 실패: ${error.message}`
          }
        ]
      };
    }
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('GitHub Repository Manager MCP 서버가 시작되었습니다.');
  }
}

// 서버 실행
const server = new GitHubRepoManager();
server.run().catch(console.error); 