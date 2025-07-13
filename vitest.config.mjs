import { defineConfig } from 'vitest/config';
import { transformAsync } from '@babel/core';
import fs from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const MINIFY = process.env.MINIFY === 'true';
const COVERAGE = process.env.COVERAGE === 'true';

const root = path.resolve(__dirname);
const alias = {
	'^react$': path.join(
		root,
		MINIFY ? 'compat/dist/compat.mjs' : 'compat/src/index.js'
	),
	'^react-dom$': path.join(
		root,
		MINIFY ? 'compat/dist/compat.mjs' : 'compat/src/index.js'
	),
	'^avery$': path.join(root, MINIFY ? 'dist/avery.mjs' : 'src/index.js'),
	'^avery/compat$': path.join(
		root,
		MINIFY ? 'compat/dist/compat.mjs' : 'compat/src/index.js'
	),
	'^avery/jsx-runtime$': path.join(
		root,
		MINIFY ? 'jsx-runtime/dist/jsxRuntime.mjs' : 'jsx-runtime/src/index.js'
	),
	'^avery/jsx-runtime/src$': path.join(
		root,
		MINIFY ? 'jsx-runtime/dist/jsxRuntime.mjs' : 'jsx-runtime/src'
	),
	'^avery/jsx-dev-runtime$': path.join(
		root,
		MINIFY
			? 'jsx-dev-runtime/dist/jsx-dev-runtime.js'
			: 'jsx-dev-runtime/src/index.js'
	),
	'^avery/debug$': path.join(
		root,
		MINIFY ? 'debug/dist/debug.mjs' : 'debug/src/index.js'
	),
	'^avery/devtools$': path.join(
		root,
		MINIFY ? 'devtools/dist/devtools.js' : 'devtools/src/index.js'
	),
	'^avery/hooks$': path.join(
		root,
		MINIFY ? 'hooks/dist/hooks.mjs' : 'hooks/src/index.js'
	),
	'^avery/test-utils$': path.join(
		root,
		MINIFY ? 'test-utils/dist/testUtils.mjs' : 'test-utils/src/index.js'
	)
};

const rollupAlias = [
	{
		find: /^react$/,
		replacement: MINIFY
			? path.join(root, 'compat/dist/compat.mjs')
			: path.join(root, 'compat/src/index.js')
	},
	{
		find: /^react-dom$/,
		replacement: MINIFY
			? path.join(root, 'compat/dist/compat.mjs')
			: path.join(root, 'compat/src/index.js')
	},
	{ find: /^avery$/, replacement: path.join(root, 'src/index.js') },
	{
		find: /^avery\/compat$/,
		replacement: MINIFY
			? path.join(root, 'compat/dist/compat.mjs')
			: path.join(root, 'compat/src/index.js')
	},
	{
		find: /^avery\/jsx-runtime$/,
		replacement: MINIFY
			? path.join(root, 'jsx-runtime/dist/jsxRuntime.mjs')
			: path.join(root, 'jsx-runtime/src/index.js')
	},
	{
		find: /^avery\/jsx-runtime\/src$/,
		replacement: MINIFY
			? path.join(root, 'jsx-runtime/dist/jsxRuntime.mjs')
			: path.join(root, 'jsx-runtime/src')
	},
	{
		find: /^avery\/jsx-dev-runtime$/,
		replacement: MINIFY
			? path.join(root, 'jsx-runtime/dist/jsxRuntime.mjs')
			: path.join(root, 'jsx-runtime/src/index.js')
	},
	{
		find: /^avery\/debug$/,
		replacement: MINIFY
			? path.join(root, 'debug/dist/debug.mjs')
			: path.join(root, 'debug/src/index.js')
	},
	{
		find: /^avery\/devtools$/,
		replacement: MINIFY
			? path.join(root, 'devtools/dist/devtools.mjs')
			: path.join(root, 'devtools/src/index.js')
	},
	{
		find: /^avery\/hooks$/,
		replacement: MINIFY
			? path.join(root, 'hooks/dist/hooks.mjs')
			: path.join(root, 'hooks/src/index.js')
	},
	{
		find: /^avery\/test-utils$/,
		replacement: MINIFY
			? path.join(root, 'test-utils/dist/testUtils.mjs')
			: path.join(root, 'test-utils/src/index.js')
	}
];

const rename = {};
const mangle = readFileSync('./mangle.json', 'utf8');
const mangleJson = JSON.parse(mangle);
for (let prop in mangleJson.props.props) {
	let name = prop;
	if (name[0] === '$') {
		name = name.slice(1);
	}

	rename[name] = mangleJson.props.props[prop];
}

export default defineConfig({
	resolve: {
		alias: rollupAlias,
		dedupe: ['avery']
	},
	esbuild: {
		loader: 'jsx',
		include: /.*\.js$/,
		exclude: ['node_nodules'],
		jsx: 'transform',
		jsxImportSource: 'avery',
		jsxDev: true
	},
	plugins: [
		{
			name: 'rename-mangle-properties',
			async transform(code, id) {
				if (id.includes('node_modules')) {
					return null;
				}

				const shouldTransform = id.includes('src') || id.includes('test');
				if (!shouldTransform) {
					return null;
				}

				const transformed = await transformAsync(code, {
					filename: id,
					configFile: false,
					plugins: [
						[
							'babel-plugin-transform-rename-properties',
							{
								rename
							}
						]
					],
					include: ['**/src/**/*.js', '**/test/**/*.js']
				});

				return {
					code: transformed.code,
					map: transformed.map
				};
			}
		}
	],
	optimizeDeps: {
		exclude: [
			'avery',
			'avery/compat',
			'avery/test-utils',
			'avery/debug',
			'avery/hooks',
			'avery/devtools',
			'avery/jsx-runtime',
			'avery/jsx-dev-runtime',
			'avery-router',
			'react',
			'react-dom'
		],
		esbuildOptions: {
			alias,
			plugins: [
				{
					name: 'load-js-files-as-jsx',
					setup(build) {
						build.onLoad({ filter: /.*\.js$/ }, async args => {
							return {
								loader: 'jsx',
								contents: await fs.readFile(args.path, 'utf8')
							};
						});
					}
				}
			]
		}
	},
	test: {
		cache: false,
		globals: true,
		coverage: {
			enabled: COVERAGE,
			include: MINIFY
				? [
						'dist/avery.mjs',
						'compat/dist/compat.mjs',
						'devtools/dist/devtools.mjs',
						'jsx-runtime/dist/jsxRuntime.mjs',
						'debug/dist/debug.mjs',
						'hooks/dist/hooks.mjs',
						'test-utils/dist/testUtils.mjs'
					]
				: [
						'src/**/*',
						'debug/src/**/*',
						'devtools/src/**/*',
						'hooks/src/**/*',
						'compeat/src/**/*',
						'jsx-runtime/src/**/*',
						'test-utils/src/**/*'
					],
			extension: ['.js', '.mjs'],
			provider: 'v8',
			reporter: ['html', 'lcovonly', 'text-summary'],
			reportsDirectory: './coverage'
		},
		projects: [
			{
				extends: true,
				test: {
					include: ['./test/{shared,node,ts}/**/*.test.js']
				}
			},
			{
				extends: true,
				test: {
					include: [
						'{debug,devtools,hooks,compat,test-utils,jsx-runtime}/test/{browser,shared}/**/*.test.js',
						'./test/{browser,shared}/**/*.test.js'
					],
					setupFiles: ['./vitest.setup.js'],
					// dangerouslyIgnoreUnhandledErrors: true,
					browser: {
						// TODO: isolate doesn't work it leaks across all pages
						// isolate: false,
						provider: 'playwright',
						enabled: true,
						screenshotFailures: false,
						headless: true,
						instances: [{ browser: 'chromium' }]
					}
				}
			}
		]
	}
});
