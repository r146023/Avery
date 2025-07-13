import { defineConfig } from 'vite';
import path from 'node:path';

const root = path.join(__dirname, '..');
const resolvePkg = (...parts) => path.join(root, ...parts, 'src', 'index.js');

// https://vitejs.dev/config/
/** @type {import('vite').UserConfig} */
export default defineConfig({
	optimizeDeps: {
		exclude: [
			'avery',
			'avery/compat',
			'avery/debug',
			'avery/hooks',
			'avery/devtools',
			'avery/jsx-runtime',
			'avery/jsx-dev-runtime',
			'avery-router',
			'react',
			'react-dom'
		]
	},
	resolve: {
		alias: {
			'avery/debug/src/debug': path.join(root, 'debug', 'src', 'debug'),
			'avery/devtools/src/devtools': path.join(
				root,
				'devtools',
				'src',
				'devtools'
			),
			//'avery/debug': resolvePkg('debug'),
			'avery/devtools': resolvePkg('devtools'),
			'avery/hooks': resolvePkg('hooks'),
			'avery/jsx-runtime': resolvePkg('jsx-runtime'),
			'avery/jsx-dev-runtime': resolvePkg('jsx-runtime'),
			avery: resolvePkg(''),
			'react-dom': resolvePkg('compat'),
			react: resolvePkg('compat')
		}
	},
	esbuild: {
		jsx: 'automatic',
		jsxImportSource: 'avery'
	}
});
