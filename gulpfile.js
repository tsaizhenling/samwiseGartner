/*jslint node: true */
/*global */

(function () {
	'use strict';
	
	var gulp = require('gulp'),
		del = require('del'),
		connect = require('gulp-connect'),
		open = require('gulp-open'),
		NWBuilder = require('nw-builder'),
		deploy = require('gulp-gh-pages'),
		
		paths = {
			libraries: {
				scripts: [
					'node_modules/framework7/dist/js/framework7.js',
					'node_modules/framework7/dist/js/framework7.js.map',
					'node_modules/moment/moment.js'
				],
				styles: [
					'node_modules/framework7/dist/css/framework7.ios.css',
					'node_modules/framework7/dist/css/framework7.ios.colors.css'
				]
			},
			source: {
				root: 'src',
				templates: 'src/**/*.html',
				scripts: 'src/**/*.js',
				styles: 'src/**/*.css',
				images: 'src/img/**/*',
				csv:'src/*.csv',
				json:'src/*.json'
			},
			dist: {
				root: 'html',
				libraries: 'html/lib',
				images: 'html/img'
			}
		};
	
	gulp.task('clean', function (cb) {
		del([paths.dist.root, 'build', 'cache', 'node_modules', '.publish' ], cb);
	});
	
	gulp.task('libraries', function () {
		return gulp.src(paths.libraries.scripts.concat(paths.libraries.styles))
			.pipe(gulp.dest(paths.dist.libraries));
	});
	
	gulp.task('templates', function () {
		gulp.src(paths.source.templates)
			.pipe(gulp.dest(paths.dist.root));
		gulp.src('package.json').pipe(gulp.dest(paths.dist.root));
	});
	
	gulp.task('scripts', function () {
		return gulp.src(paths.source.scripts)
			.pipe(gulp.dest(paths.dist.root));
	});
	
	gulp.task('styles', function () {
		return gulp.src(paths.source.styles)
			.pipe(gulp.dest(paths.dist.root));
	});

	gulp.task('csv', function () {
		return gulp.src(paths.source.csv)
			.pipe(gulp.dest(paths.dist.root));
	});
	
	gulp.task('json', function () {
		return gulp.src(paths.source.json)
			.pipe(gulp.dest(paths.dist.root));
	});

	gulp.task('images', function () {
		gulp.src(paths.source.root + '/apple-touch-icon.png').pipe(gulp.dest(paths.dist.root));
		return gulp.src(paths.source.images)
			.pipe(gulp.dest(paths.dist.images));
	});
	
	gulp.task('dist', [ 'libraries', 'templates', 'scripts', 'styles', 'images' , 'csv' , 'json' ]);
	
	gulp.task('watch', function () {
		gulp.watch(paths.libraries.scripts.concat(paths.libraries.styles), [ 'libraries' ]);
		gulp.watch(paths.source.templates, [ 'templates' ]);
		gulp.watch(paths.source.scripts, [ 'scripts' ]);
		gulp.watch(paths.source.styles, [ 'styles' ]);
		gulp.watch(paths.source.images, [ 'images' ]);
	});
	
	gulp.task('server', [ 'dist' ], function () {
		return connect.server({
			root: [ paths.dist.root ],
			livereload: true
		});
	});
	
	gulp.task('open', function () {
		return gulp.src(paths.dist.root + '/index.html').pipe(open('', { url: 'http://localhost:8080' }));
	});
	
	gulp.task('build', [ 'dist' ], function () {
		var nw = new NWBuilder({
			files: paths.dist.root + '/**',
			macIcns: paths.dist.root + '/img/nw.icns',
			platforms: [ 'osx64' ]
		});
		
		return nw.build();
	});
	
	gulp.task('deploy', ['dist'], function () {
        return gulp.src(paths.dist.root + '/**/*')
            .pipe(deploy());
    });
	
	gulp.task('default', [ 'watch', 'server', 'open' ]);
	
}());