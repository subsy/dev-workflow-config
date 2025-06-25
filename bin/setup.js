#!/usr/bin/env node

// ABOUTME: Automated setup script for development workflow configuration
// Installs and configures git hooks, linting, commit standards, and VSCode settings

import fs from 'fs-extra';
import path from 'path';
import { execSync } from 'node:child_process';
import chalk from 'chalk';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class DevWorkflowSetup {
  constructor() {
    this.projectRoot = process.cwd();
    this.templatesDir = path.join(__dirname, '..', 'templates');
    this.packageJsonPath = path.join(this.projectRoot, 'package.json');
  }

  async run() {
    console.log(chalk.blue('🚀 Setting up development workflow configuration...\n'));

    try {
      await this.checkPrerequisites();
      await this.installDependencies();
      await this.initializeHusky();
      await this.copyConfigFiles();
      await this.updatePackageJson();
      await this.showSuccess();
    } catch (error) {
      console.error(chalk.red('❌ Setup failed:'), error.message);
      process.exit(1);
    }
  }

  async checkPrerequisites() {
    console.log(chalk.yellow('📋 Checking prerequisites...'));

    // Check if we're in a git repository
    try {
      execSync('git rev-parse --git-dir', { stdio: 'ignore' });
    } catch {
      throw new Error('Not in a git repository. Run "git init" first.');
    }

    // Check if package.json exists
    if (!await fs.pathExists(this.packageJsonPath)) {
      throw new Error('package.json not found. Run "npm init" first.');
    }

    console.log(chalk.green('✅ Prerequisites check passed\n'));
  }

  async installDependencies() {
    console.log(chalk.yellow('📦 Installing development dependencies...'));

    const deps = [
      'husky@^9.1.7',
      'lint-staged@^16.1.2',
      '@commitlint/cli@^19.8.1',
      '@commitlint/config-conventional@^19.8.1',
      'commitizen@^4.3.1',
      'cz-conventional-changelog@^3.3.0'
    ];

    try {
      // Try pnpm first, then npm
      const packageManager = this.detectPackageManager();
      const installCmd = packageManager === 'pnpm' 
        ? `pnpm add -D ${deps.join(' ')}`
        : `npm install --save-dev ${deps.join(' ')}`;

      execSync(installCmd, { stdio: 'inherit' });
      console.log(chalk.green('✅ Dependencies installed\n'));
    } catch (error) {
      throw new Error(`Failed to install dependencies: ${error.message}`);
    }
  }

  detectPackageManager() {
    if (fs.existsSync(path.join(this.projectRoot, 'pnpm-lock.yaml'))) {
      return 'pnpm';
    }
    if (fs.existsSync(path.join(this.projectRoot, 'yarn.lock'))) {
      return 'yarn';
    }
    return 'npm';
  }

  async copyConfigFiles() {
    console.log(chalk.yellow('📄 Copying configuration files...'));

    const filesToCopy = [
      { src: '.lintstagedrc.js', dest: '.lintstagedrc.js' },
      { src: 'commitlint.config.js', dest: 'commitlint.config.js' },
      { src: '.nvmrc', dest: '.nvmrc' },
      { src: '.vscode/settings.json', dest: '.vscode/settings.json' },
      { src: '.vscode/extensions.json', dest: '.vscode/extensions.json' },
      { src: '.husky/pre-commit', dest: '.husky/pre-commit' },
      { src: '.husky/pre-push', dest: '.husky/pre-push' },
      { src: '.husky/commit-msg', dest: '.husky/commit-msg' }
    ];

    for (const file of filesToCopy) {
      const srcPath = path.join(this.templatesDir, file.src);
      const destPath = path.join(this.projectRoot, file.dest);

      // Create directory if it doesn't exist
      await fs.ensureDir(path.dirname(destPath));

      // Copy file, overwrite husky hooks but not other config files
      const shouldOverwrite = file.dest.startsWith('.husky/');
      
      if (await fs.pathExists(destPath) && !shouldOverwrite) {
        console.log(chalk.yellow(`⚠️  ${file.dest} already exists, skipping...`));
      } else {
        await fs.copy(srcPath, destPath);
        
        // Make husky hooks executable
        if (file.dest.startsWith('.husky/')) {
          await fs.chmod(destPath, '755');
        }
        
        const action = shouldOverwrite && await fs.pathExists(destPath) ? 'Updated' : 'Created';
        console.log(chalk.green(`✅ ${action} ${file.dest}`));
      }
    }

    console.log(chalk.green('✅ Configuration files copied\n'));
  }

  async updatePackageJson() {
    console.log(chalk.yellow('⚙️  Updating package.json...'));

    const packageJson = await fs.readJson(this.packageJsonPath);

    // Add scripts
    if (!packageJson.scripts) packageJson.scripts = {};
    
    const scriptsToAdd = {
      prepare: 'husky',
      commit: 'cz'
    };

    let scriptsAdded = false;
    for (const [script, command] of Object.entries(scriptsToAdd)) {
      if (!packageJson.scripts[script]) {
        packageJson.scripts[script] = command;
        scriptsAdded = true;
        console.log(chalk.green(`✅ Added script: ${script}`));
      }
    }

    // Add commitizen config
    if (!packageJson.config) packageJson.config = {};
    if (!packageJson.config.commitizen) {
      packageJson.config.commitizen = {
        path: 'cz-conventional-changelog'
      };
      console.log(chalk.green('✅ Added commitizen configuration'));
    }

    // Add ES module support
    if (!packageJson.type) {
      packageJson.type = 'module';
      console.log(chalk.green('✅ Added ES module support'));
    }

    if (scriptsAdded || !packageJson.config.commitizen || !packageJson.type) {
      await fs.writeJson(this.packageJsonPath, packageJson, { spaces: 2 });
    }

    console.log(chalk.green('✅ package.json updated\n'));
  }

  async initializeHusky() {
    console.log(chalk.yellow('🪝 Initializing Husky...'));

    try {
      execSync('npx husky init', { stdio: 'inherit' });
      console.log(chalk.green('✅ Husky initialized\n'));
    } catch (error) {
      // Husky might already be initialized, that's okay
      console.log(chalk.yellow('⚠️  Husky may already be initialized\n'));
    }
  }

  showSuccess() {
    console.log(chalk.green.bold('🎉 Development workflow setup complete!\n'));
    
    console.log(chalk.blue('📋 What was configured:'));
    console.log('   • Git hooks (pre-commit, pre-push, commit-msg)');
    console.log('   • Lint-staged for fast linting');
    console.log('   • Commitizen for consistent commit messages');
    console.log('   • CommitLint for conventional commits');
    console.log('   • VSCode workspace settings');
    console.log('   • Node.js version consistency (.nvmrc)');
    
    console.log(chalk.blue('\n🚀 Usage:'));
    console.log(`   • Use ${chalk.cyan('npm run commit')} or ${chalk.cyan('pnpm commit')} for guided commits`);
    console.log('   • Git hooks will automatically run on commit/push');
    console.log('   • VSCode will use optimized settings for the project');
    
    console.log(chalk.blue('\n⚡ Next steps:'));
    console.log('   • Make your first commit to test the setup');
    console.log('   • Customize .lintstagedrc.js if needed');
    console.log('   • Adjust .vscode/settings.json for your preferences');
  }
}

// Run the setup if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const setup = new DevWorkflowSetup();
  setup.run();
}

export default DevWorkflowSetup;