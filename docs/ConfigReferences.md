# Avery Configuration Reference

This document explains all configuration files and settings used in the Avery UI framework project. Avery is a modern, lightweight UI framework based on a fork of Avery, featuring seamless integration with the OmniTurbo state engine for fast, scalable, and intuitive global state management.

---

## Table of Contents

1. [package.json](#packagejson)
2. [tsconfig.json](#tsconfigjson)
3. [jsconfig.json](#jsconfigjson)
4. [vite.config.ts](#viteconfigts)
5. [vitest.config.mjs](#vitestconfigmjs)
6. [biome.json](#biomejson)
7. [mangle.json](#manglejson)
8. [Other Notable Files](#other-notable-files)

---

## package.json

The `package.json` file is the heart of any npm-based project. It defines your package’s metadata, entry points, scripts, dependencies, and more.

### Key Fields

- **name**: The npm package name (`avery`). This is how users will import your library.
- **amdName**: Name used for AMD builds.
- **version**: The current version of your library. Follows [semver](https://semver.org/).
- **private**: If `false`, the package can be published to npm.
- **description**: A short summary of what Avery is and does.
- **main**: The CommonJS entry point for Node.js consumers (`dist/avery.js`).
- **module**: The ES Module entry point for modern bundlers (`dist/avery.mjs`).
- **umd:main**: The UMD build entry point for direct browser usage (`dist/avery.umd.js`).
- **source**: The main source file for the library (`src/index.js`).
- **types**: The TypeScript type definitions entry point (`src/index.d.ts`).
- **exports**: A map of all public entry points and their respective module, UMD, and type files. This allows consumers to import submodules directly (e.g., `avery/hooks`).
- **license**: The license under which Avery is distributed (MIT).
- **funding**: Information for users who want to support the project.
- **repository**: Where the source code lives (GitHub).
- **bugs**: Where to report issues.
- **homepage**: Project website.
- **keywords**: Search terms for npm and GitHub.
- **authors**: List of contributors.
- **scripts**: CLI commands for building, testing, linting, formatting, and more.
- **nano-staged**: Configuration for running formatting on staged files.
- **files**: List of files and folders to include in the npm package (everything else is ignored).
- **devDependencies**: Packages needed for development, testing, and building.
- **volta**: Node.js version pinning for consistent development environments.

### Example: Exports Field

```json
"exports": {
  ".": {
    "types": "./src/index.d.ts",
    "module": "./dist/avery.mjs",
    "umd": "./dist/avery.umd.js",
    "import": "./dist/avery.mjs",
    "require": "./dist/avery.js"
  },
  "./hooks": {
    "types": "./hooks/src/index.d.ts",
    "module": "./hooks/dist/hooks.mjs",
    "umd": "./hooks/dist/hooks.umd.js",
    "import": "./hooks/dist/hooks.mjs",
    "require": "./hooks/dist/hooks.js"
  }
  // ...other submodules
}
```
This allows consumers to do:
```js
import { useOmni } from "avery/hooks";
```
and get the correct file for their environment.

---

## tsconfig.json

This file configures the TypeScript compiler for your project.

### Key Fields

- **target**: The JavaScript version to compile to (`ESNext` for modern JS).
- **module**: The module system to use (`ESNext` for ESM).
- **moduleResolution**: How modules are resolved (`Node` for Node.js-style).
- **jsx**: Enables JSX/TSX support (`react-jsx` for the new JSX transform).
- **jsxImportSource**: Tells TypeScript to use Avery’s JSX runtime instead of React or Avery.
- **strict**: Enables all strict type-checking options.
- **esModuleInterop**: Allows default imports from CommonJS modules.
- **skipLibCheck**: Skips type checking of declaration files for faster builds.
- **forceConsistentCasingInFileNames**: Ensures file name casing matches across the project.
- **include**: Specifies which files to include in the project (usually `src`).

---

## jsconfig.json

This file is used by editors (like VS Code) to provide IntelliSense and navigation for JavaScript projects. In a TypeScript project, it’s optional but can help with JS/TS interop.

### Key Fields

- **baseUrl**: The base directory for resolving non-relative module names.
- **checkJs**: Enables type checking for JavaScript files.
- **jsx**: Enables JSX support for JS files.
- **jsxImportSource**: Uses Avery’s JSX runtime for JS files.
- **lib**: List of library files to include in the compilation.
- **moduleResolution**: Module resolution strategy.
- **resolveJsonModule**: Allows importing `.json` files.
- **paths**: Aliases for module imports (e.g., `"avery": ["src"]`).
- **target**: JavaScript version for IntelliSense.
- **noEmit**: Prevents emitting output files.
- **skipLibCheck**: Skips type checking of declaration files.
- **exclude**: Folders to ignore (e.g., `node_modules`, `dist`, `coverage`, `demo`).

---

## vite.config.ts

This file configures [Vite](https://vitejs.dev/), a fast build tool and dev server.

### Key Fields

- **esbuild.jsx**: Set to `"automatic"` to use the new JSX transform.
- **esbuild.jsxImportSource**: Set to `"avery"` so that JSX/TSX files use Avery’s JSX runtime.

```ts
import { defineConfig } from 'vite';

export default defineConfig({
  esbuild: {
    jsx: 'automatic',
    jsxImportSource: 'avery'
  }
});
```

---

## vitest.config.mjs

This file configures [Vitest](https://vitest.dev/), a fast unit test runner.

### Key Sections

- **Aliases**: Maps module names (like `avery`, `avery/hooks`, etc.) to local source or build files for testing.
- **MINIFY/COVERAGE**: Environment variables to control minification and coverage during tests.
- **dedupe**: Ensures only one copy of Avery is used in tests.
- **optimizeDeps.exclude**: Prevents Vite from pre-bundling certain dependencies.
- **esbuild.jsxImportSource**: Ensures JSX in tests uses Avery’s runtime.

---

## biome.json

This file configures [Biome](https://biomejs.dev/), an all-in-one code formatter and linter.

### Key Sections

- **formatter**: Controls code formatting (indentation, line width, line endings, etc.).
- **ignore**: List of files/folders to ignore during formatting/linting.
- **organizeImports**: Enables automatic import sorting.
- **linter**: Enables linting and recommended rules.
- **javascript.formatter**: Fine-tunes JS/TS/JSX formatting (quotes, semicolons, spacing, etc.).
- **overrides**: Allows different formatting for specific file types (e.g., JSON).

Biome ensures your codebase is consistently formatted and linted, similar to Prettier + ESLint but faster.

---

## mangle.json

This file configures property name mangling for minified builds.

### Key Sections

- **help**: Documentation for what the file does.
- **minify.mangle.properties.regex**: Regex for which properties to mangle (e.g., all starting with `_`).
- **minify.mangle.properties.reserved**: List of property names that should never be mangled (for devtools, interop, etc.).
- **minify.compress**: Compression options for the minifier.
- **props**: Maps original property names to their mangled (short) names for consistent minification.

**Why?**  
Mangling reduces bundle size and ensures consistent property names across builds, which is important for hydration, debugging, and devtools.

---

## Other Notable Files

- **.gitignore**: Specifies files/folders to ignore in git (e.g., `node_modules`, `dist`, `coverage`).
- **README.md**: Project documentation.
- **src/**: Your main source code.
- **dist/**: Build output (should be gitignored, but included in npm via the `files` field).
- **test/**: Unit and integration tests.
- **demo/**: (Optional) Example/demo app using Avery.

---

## Workflow Summary

1. **Develop** in `src/` using TypeScript and JSX/TSX.
2. **Format and lint** code with Biome (`npm run format`, `npm run lint`).
3. **Build** distributable bundles with Microbundle (`npm run build`).
4. **Test** with Vitest (`npm run test`).
5. **Publish** to npm (`npm publish`).
6. **Demo** your library in a separate `demo/` folder if desired.

---

## FAQ

**Q: Why so many entry points in `exports`?**  
A: To allow consumers to import only what they need (e.g., `avery/hooks`), improving tree-shaking and bundle size.

**Q: Why use `"jsxImportSource": "avery"`?**  
A: So TypeScript and Vite use Avery’s JSX runtime instead of React or Avery.

**Q: What if I add new submodules?**  
A: Add them to the `exports` and `files` fields in `package.json`.

**Q: How do I add new private properties for mangling?**  
A: Add them to the `"props"` section in `mangle.json`.

---

## Resources

- [Avery Documentation](https://averyjs.com)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Documentation](https://vitejs.dev/)
- [Vitest Documentation](https://vitest.dev/)
- [Biome Documentation](https://biomejs.dev/)
- [Microbundle Documentation](https://github.com/developit/microbundle)

---

**Avery = Avery + OmniTurbo + built-in productivity features, designed for modern, scalable, and enjoyable UI development.**
