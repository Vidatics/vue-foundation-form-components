
const mode = process.env.NODE_ENV;

module.exports = {
	chainWebpack: config => {
		if (mode === 'production') {
			config.externals({
				'jquery': {
					commonjs: 'jquery',
					commonjs2: 'jquery',
					amd: 'jquery',
					root: 'jquery',
				},
				'foundation-sites': {
					commonjs: 'foundation-sites',
					commonjs2: 'foundation-sites',
					amd: 'foundation-sites',
					root: 'Foundation'
				},
				'rxjs': {
					commonjs: 'rxjs',
					commonjs2: 'rxjs',
					amd: 'rxjs',
				}
			});
		}

		config.resolve.alias
			// fixing typing library name difference
			.set('typeahead', 'typeahead.js');

		config.module
			.rule('ts')
			.use('ts-loader')
			.loader('ts-loader')
			.tap(opts => {
				opts.transpileOnly = false;
				opts.happyPackMode = false;
				return opts;
			});
	},

	parallel: false
}