// ABOUTME: Lint-staged configuration for pre-commit hooks
// Only runs linting and formatting on staged files, not entire codebase

export default {
  '*.{js,ts,tsx,jsx}': (filenames) => [
    `npx biome check --write ${filenames.join(' ')}`,
  ],
  '*.{json}': (filenames) => [
    `npx biome format --write ${filenames.join(' ')}`,
  ],
};
