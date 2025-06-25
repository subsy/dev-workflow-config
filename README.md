# Dev Workflow Config

A reusable development workflow configuration package that sets up git hooks, linting, commit standards, and VSCode settings for any JavaScript/TypeScript project.

## What it configures

🪝 **Git Hooks (Husky)**
- Pre-commit: Runs lint-staged on changed files
- Pre-push: Runs tests and build verification  
- Commit-msg: Enforces conventional commit format

🔍 **Lint-staged**
- Only checks files you're actually committing
- Runs Biome check/format on JS/TS files
- Runs Biome format on JSON files

📝 **Commitizen & CommitLint**
- Interactive commit message creation
- Enforces conventional commit format
- Consistent changelog generation

🛠️ **VSCode Configuration**
- Optimized settings for TypeScript/JavaScript development
- Biome as default formatter
- Recommended extensions
- Monorepo-friendly search/file exclusions

📌 **Node.js Version**
- `.nvmrc` file for consistent Node.js version (20)

## Quick Setup

### Option 1: One-time install and run
```bash
npx @plgeek/dev-workflow-config
```

### Option 2: Install globally
```bash
npm install -g @plgeek/dev-workflow-config
setup-dev-workflow
```

### Option 3: Install as dev dependency
```bash
npm install --save-dev @plgeek/dev-workflow-config
npx setup-dev-workflow
```

## Prerequisites

- Git repository (`git init`)
- Node.js 18+ 
- `package.json` file (`npm init`)

## What gets created/modified

### Files created:
- `.husky/pre-commit` - Runs lint-staged
- `.husky/pre-push` - Runs tests and build
- `.husky/commit-msg` - Validates commit message format
- `.lintstagedrc.js` - Lint-staged configuration
- `commitlint.config.js` - CommitLint rules
- `.nvmrc` - Node.js version specification
- `.vscode/settings.json` - VSCode workspace settings
- `.vscode/extensions.json` - Recommended VSCode extensions

### Files modified:
- `package.json` - Adds scripts and commitizen config

### Dependencies installed:
- `husky` - Git hooks
- `lint-staged` - Run linters on staged files
- `@commitlint/cli` + `@commitlint/config-conventional` - Commit message linting
- `commitizen` + `cz-conventional-changelog` - Interactive commits

## Usage

### Making commits
```bash
# Use commitizen for guided commits
npm run commit
# or
pnpm commit

# Or use git normally (commit-msg hook will validate)
git commit -m "feat: add new feature"
```

### Commit message format
Follows [Conventional Commits](https://conventionalcommits.org/):

```
type(scope?): description

[optional body]

[optional footer(s)]
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`

### Examples
```bash
feat: add user authentication
fix: resolve memory leak in data processing
docs: update API documentation
chore: update dependencies
```

## Customization

### Lint-staged configuration
Edit `.lintstagedrc.js` to customize what runs on commit:

```javascript
export default {
  '*.{js,ts,tsx,jsx}': (filenames) => [
    `npx biome check --write ${filenames.join(' ')}`,
    `npm run test -- --findRelatedTests ${filenames.join(' ')}`, // Add tests
  ],
  '*.json': (filenames) => [
    `npx biome format --write ${filenames.join(' ')}`,
  ],
};
```

### CommitLint rules
Edit `commitlint.config.js` to customize commit message rules:

```javascript
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'header-max-length': [2, 'always', 100],
    'type-enum': [2, 'always', [
      'feat', 'fix', 'docs', 'style', 'refactor', 
      'perf', 'test', 'build', 'ci', 'chore', 'revert'
    ]],
  }
};
```

### VSCode settings
Edit `.vscode/settings.json` and `.vscode/extensions.json` for your preferences.

## Package manager support

Automatically detects and works with:
- **pnpm** (if `pnpm-lock.yaml` exists)
- **Yarn** (if `yarn.lock` exists)  
- **npm** (default)

## Troubleshooting

### "Not in a git repository"
```bash
git init
```

### "package.json not found"
```bash
npm init
```

### Hooks not running
```bash
npx husky init
```

### Want to skip hooks temporarily?
```bash
git commit --no-verify -m "message"
```

## Integration with different tools

### With Next.js
Works out of the box. The VSCode settings include Tailwind CSS support.

### With React/Vue
No additional configuration needed.

### With monorepos (Turborepo, Lerna, etc.)
The VSCode settings are optimized for monorepo development.

### With different linters
Edit `.lintstagedrc.js` to replace Biome with ESLint, Prettier, etc:

```javascript
export default {
  '*.{js,ts,tsx,jsx}': [
    'eslint --fix',
    'prettier --write',
  ],
};
```

## License

MIT