import fs from 'fs';
import memory from 'rollup-plugin-memory';
import babel from 'rollup-plugin-babel';
import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

let pkg = JSON.parse(fs.readFileSync('./package.json'));

let external = Object.keys(pkg.peerDependencies || {}).concat(Object.keys(pkg.dependencies || {}));

let format = process.env.FORMAT==='es' ? 'es' : 'umd';

export default {
	entry: 'src/compat/index.js',
	sourceMap: true,
	moduleName: 'preactCompat',
	exports: format==='es' ? null : 'default',
	dest: format==='es' ? pkg['compat:module'] : pkg['compat:main'],
	format,
	external,
	useStrict: false,
	globals: {
		'preact': 'preact',
		'prop-types': 'PropTypes'
	},
	plugins: [
		format==='umd' && memory({
			path: 'src/compat/index.js',
			contents: "export { default } from './index';"
		}),
		babel({
			sourceMap: true,
			exclude: 'node_modules/**',
			babelrc: false,
			presets: [
				['env', {
					modules: false,
					loose: true,
					exclude: ['transform-es2015-typeof-symbol'],
					targets: {
						browsers: ['last 2 versions', 'IE >= 9']
					}
				}]
			]
		}),
		nodeResolve({
			jsnext: true,
			main: true,
			// skip: external
		}),
		commonjs({
			include: 'node_modules/**',
			exclude: '**/*.css'
		})
	].filter(Boolean)
};
