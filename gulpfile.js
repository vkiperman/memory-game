(function(){
	//'use strict';

	const gulp		= require('gulp'),
		sass		= require('gulp-sass'),
		browserSync = require('browser-sync').create(),
		useref 		= require('gulp-useref'),
		uglify 		= require('gulp-uglify'), 	// minify JS
		cssnano 	= require('gulp-cssnano'),	// minify CSS
		gulpIf 		= require('gulp-if'),
		imagemin 	= require('gulp-imagemin'),	// optimize images
		cache 		= require('gulp-cache'),
		del 		= require('del'),			// clean-up
		runSequence = require('run-sequence'),
		uncss 		= require('gulp-uncss'),
		sourcemaps	= require('gulp-sourcemaps'),
		source 		= require('vinyl-source-stream'),
		glob 		= require('glob')
		sprity		= require('sprity');
	// A few CONSTANTS...
	const SCSS_SRC 	= 'app/scss/**/*.scss',
		HTML_SRC 	= 'app/**/*.html',
		JS_SRC		= 'app/js/**/*.js',
		IMG_SRC  	= 'app/images/**/*.+(png|jpg|jpeg|gif|svg)',
		FONTS_SRC 	= 'app/fonts/**/*',
		DIST		= 'dist';

	var sassOpts = {
		includePaths: 	['./node_modules/bootstrap-sass/assets/stylesheets'],
		outputStyle: 	'compressed',
		indentedSyntax: true
	};

	gulp.task('sass', function(){
		return gulp.src(SCSS_SRC)
			.pipe(sourcemaps.init())
			.pipe( sass(sassOpts)
				.on('error', sass.logError)
			)
			.pipe( uncss({
				html: [HTML_SRC]
				})
			)
			.pipe( sourcemaps.write('') )
			.pipe( gulp.dest('app/css') )
			.pipe( browserSync.reload({
				stream: true
			}));
	});

	gulp.task('browserSync', function() {
		return browserSync.init({
			server: {
				baseDir: DIST
			},
		})
	});

	gulp.task('useref', function(){
		return gulp.src(HTML_SRC)
			.pipe(useref())
			.pipe(gulpIf('*.js', uglify()))
			.pipe(gulpIf('*.css', cssnano()))
			.pipe(gulp.dest(DIST));
	});

	gulp.task('images', function(){
		return gulp.src(IMG_SRC)
			.pipe( cache( imagemin({
				interlaced: true
			})))
			.pipe( gulp.dest('dist/images') );
	});

	gulp.task('fonts', function() {
		return gulp.src(FONTS_SRC)
			.pipe(gulp.dest('dist/fonts'));
	});

	gulp.task('sprite', function(){
		return sprity.src({
			src: 	IMG_SRC,
			out: 	'app/images/sprites',
			dimensions: [{
				ratio: 1, dpi: 72
			}, {
				ratio: 2, dpi: 192
			}], 
		});
	});
	
	gulp.task('clean:dist', function() {
		return del.sync(DIST);
	});

	gulp.task('cache:clear', function (callback) {
		return cache.clearAll(callback)
	});

	gulp.task('build', function(callback){
		runSequence('clean:dist', ['sass', 'useref', 'images', 'fonts'], callback);
	});

	gulp.task('default', function (callback) {
		runSequence(['sass', 'browserSync', 'watch'], callback);
	});

	/* ======= WATCH ======= */ 
	gulp.task('watch', ['sass', 'browserSync', 'useref', 'images', 'fonts'], function(){
		//gulp.watch(SCSS_SRC, 			['sass']);
		//gulp.watch('app/css/**/*.css', 	browserSync.reload);
		//gulp.watch(IMG_SRC, 			browserSync.reload);
		//gulp.watch(FONTS_SRC, 			['fonts', browserSync.reload]);
		//gulp.watch(HTML_SRC, 			browserSync.reload);
		//gulp.watch(JS_SRC,				browserSync.reload);
		gulp.watch('app/**/*',			['useref', browserSync.reload]);
	});

})();