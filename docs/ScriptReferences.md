# Avery Scripts Reference

This document provides an exhaustive explanation of all npm scripts defined in Avery’s `package.json`. These scripts automate building, testing, linting, formatting, and other development tasks for the Avery UI framework.

---

## Table of Contents

- [Build Scripts](#build-scripts)
- [Development Scripts](#development-scripts)
- [Testing Scripts](#testing-scripts)
- [Linting and Formatting Scripts](#linting-and-formatting-scripts)
- [Nano-staged](#nano-staged)
- [Other Utilities](#other-utilities)
- [Script Workflow Examples](#script-workflow-examples)

---

## Build Scripts

### `prepare`
```json
"prepare": "husky && npm run test:install && run-s build"
```
- **Purpose:** Runs automatically after `npm install` and before publishing.
- **What it does:**
  1. Sets up [Husky](https://typicode.github.io/husky/) for git hooks.
  2. Installs Playwright browsers for testing.
  3. Runs the full build process (see `build`).
- **When to use:** Never run directly; it’s triggered by npm. Ensures your repo is ready for development and publishing.

---

### `build`
```json
"build": "npm-run-all --parallel 'build:*'"
```
- **Purpose:** Builds all distributable bundles for Avery and its submodules in parallel.
- **What it does:** Runs all scripts matching `build:*` (see below) at once.
- **When to use:** Before publishing, testing, or distributing your library.

#### Sub-build scripts:

- **`build:core`**  
  ```json
  "build:core": "microbundle build --raw --no-generateTypes -f cjs,esm,umd"
  ```
  - Builds the main Avery library in CommonJS, ESM, and UMD formats using [Microbundle](https://github.com/developit/microbundle).
  - `--raw`: Disables Babel transpilation for faster builds.
  - `--no-generateTypes`: Skips type generation (handled elsewhere).
  - `-f cjs,esm,umd`: Output formats.

- **`build:debug`**  
  ```json
  "build:debug": "microbundle build --raw --no-generateTypes -f cjs,esm,umd --cwd debug"
  ```
  - Builds the `debug` submodule.

- **`build:devtools`**  
  ```json
  "build:devtools": "microbundle build --raw --no-generateTypes -f cjs,esm,umd --cwd devtools"
  ```
  - Builds the `devtools` submodule.

- **`build:hooks`**  
  ```json
  "build:hooks": "microbundle build --raw --no-generateTypes -f cjs,esm,umd --cwd hooks"
  ```
  - Builds the `hooks` submodule.

- **`build:test-utils`**  
  ```json
  "build:test-utils": "microbundle build --raw --no-generateTypes -f cjs,esm,umd --cwd test-utils"
  ```
  - Builds the `test-utils` submodule.

- **`build:compat`**  
  ```json
  "build:compat": "microbundle build --raw --no-generateTypes -f cjs,esm,umd --cwd compat --globals 'avery/hooks=averyHooks'"
  ```
  - Builds the `compat` submodule for React/Avery compatibility.
  - `--globals` sets global variable names for UMD builds.

- **`build:jsx`**  
  ```json
  "build:jsx": "microbundle build --raw --no-generateTypes -f cjs,esm,umd --cwd jsx-runtime"
  ```
  - Builds the `jsx-runtime` submodule.

- **`postbuild`**  
  ```json
  "postbuild": "node ./config/compat-entries.js"
  ```
  - Runs after all builds.
  - Typically used to generate or fix up compatibility entry points for submodules.

---

## Development Scripts

### `dev`
```json
"dev": "microbundle watch --raw --no-generateTypes --format cjs"
```
- **Purpose:** Starts a development build process that watches for changes and rebuilds the main Avery library automatically.
- **When to use:** During active development of the core library.

### `dev:hooks`
```json
"dev:hooks": "microbundle watch --raw --no-generateTypes --format cjs --cwd hooks"
```
- **Purpose:** Watches and rebuilds the `hooks` submodule on changes.

### `dev:compat`
```json
"dev:compat": "microbundle watch --raw --no-generateTypes --format cjs --cwd compat --globals 'avery/hooks=averyHooks'"
```
- **Purpose:** Watches and rebuilds the `compat` submodule on changes.

---

## Testing Scripts

### `test`
```json
"test": "npm-run-all build lint test:unit"
```
- **Purpose:** Runs the full test suite, including building, linting, and unit tests.
- **When to use:** Before pushing, merging, or publishing.

### `test:install`
```json
"test:install": "playwright install chromium"
```
- **Purpose:** Installs the Chromium browser for Playwright-based tests.
- **When to use:** Automatically run by `prepare`, but can be run manually if Playwright is not set up.

### `test:unit`
```json
"test:unit": "run-p test:vitest:min test:ts"
```
- **Purpose:** Runs both minified unit tests and TypeScript type tests in parallel.

#### Sub-scripts:

- **`test:vitest`**  
  ```json
  "test:vitest": "cross-env COVERAGE=true vitest run"
  ```
  - Runs all unit tests with [Vitest](https://vitest.dev/) and collects coverage.

- **`test:vitest:min`**  
  ```json
  "test:vitest:min": "cross-env MINIFY=true vitest run"
  ```
  - Runs unit tests with minified builds to ensure minification does not break functionality.

- **`test:vitest:watch`**  
  ```json
  "test:vitest:watch": "vitest"
  ```
  - Starts Vitest in watch mode for interactive test-driven development.

- **`test:ts`**  
  ```json
  "test:ts": "run-p 'test:ts:*'"
  ```
  - Runs all TypeScript type-checking tests in parallel.

- **`test:ts:core`**  
  ```json
  "test:ts:core": "tsc -p test/ts/"
  ```
  - Type-checks the core library’s test TypeScript files.

- **`test:ts:compat`**  
  ```json
  "test:ts:compat": "tsc -p compat/test/ts/"
  ```
  - Type-checks the compatibility layer’s test TypeScript files.

---

## Linting and Formatting Scripts

### `lint`
```json
"lint": "run-s oxlint tsc"
```
- **Purpose:** Runs both code linting and TypeScript type checking in sequence.

- **`oxlint`**  
  ```json
  "oxlint": "oxlint -c oxlint.json src test/browser test/node test/shared debug compat hooks test-utils"
  ```
  - Runs [Oxlint](https://oxlint.com/) (a fast linter) on all relevant source and test directories.

- **`tsc`**  
  ```json
  "tsc": "tsc -p jsconfig-lint.json"
  ```
  - Runs TypeScript in type-checking mode using a special config for linting.

### `format`
```json
"format": "biome format --write ."
```
- **Purpose:** Formats all code in the repository using [Biome](https://biomejs.dev/).

### `format:check`
```json
"format:check": "biome format ."
```
- **Purpose:** Checks formatting without making changes (useful for CI).

---

## Nano-staged

### `nano-staged`
```json
"nano-staged": {
  "**/*.{js,jsx,mjs,cjs,ts,tsx,yml,json,html,md,css,scss}": [
    "biome format --write --no-errors-on-unmatched"
  ]
}
```
- **Purpose:** Ensures that any staged files (about to be committed) are automatically formatted with Biome.
- **When to use:** Runs automatically as a pre-commit hook (via Husky).

---

## Other Utilities

- **`postbuild`**  
  Runs a Node.js script to adjust or generate compatibility entries after building.

- **`prepare`**  
  (See above) Ensures Husky, Playwright, and builds are ready after install.

---

## Script Workflow Examples

### Typical Development Workflow

1. **Start development build:**  
   ```sh
   npm run dev
   ```
   (or `npm run dev:hooks`/`npm run dev:compat` for submodules)

2. **Run tests interactively:**  
   ```sh
   npm run test:vitest:watch
   ```

3. **Format code:**  
   ```sh
   npm run format
   ```

4. **Lint and type-check:**  
   ```sh
   npm run lint
   ```

---

### Full CI/Release Workflow

1. **Install dependencies:**  
   ```sh
   npm install
   ```

2. **Prepare the repo:**  
   (Runs automatically, but can be run manually)
   ```sh
   npm run prepare
   ```

3. **Build all bundles:**  
   ```sh
   npm run build
   ```

4. **Run all tests:**  
   ```sh
   npm test
   ```

5. **Publish to npm:**  
   ```sh
   npm publish
   ```

---

## Notes

- **Microbundle** is used for bundling, which simplifies building multiple formats.
- **Playwright** is used for browser-based testing.
- **Vitest** is the main unit test runner.
- **Biome** and **Oxlint** ensure code quality and consistency.
- **Nano-staged** and **Husky** automate formatting and linting on commit.

---

**Avery’s scripts are designed for a robust, automated, and high-quality development workflow. Use them to ensure your code is always production-ready!**