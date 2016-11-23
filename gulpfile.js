// Include gulp
var gulp = require('gulp');

// Include Our Plugins
var jshint = require('gulp-jshint'), 
	sass = require('gulp-sass'), 
	concat = require('gulp-concat'), 
	uglify = require('gulp-uglify'),
	rename = require('gulp-rename'),
	bowerFiles = require('main-bower-files'),
	inject = require('gulp-inject'),
	es = require('event-stream'),
	webserver = require('gulp-webserver'),
	wiredep = require('wiredep'),
	cleanCSS = require('gulp-clean-css');

var paths = {
  src: './src',
  dist: './public',
  tmp: '.tmp',
  index: './src/index.html',
  publicindex: './public/index.html',
  js: 'src/**/*.js',
  scss: 'src/**/*.scss'
};

// Lint Task
gulp.task('lint', function() {
    return gulp.src(paths.js)
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

gulp.task('bower', ['bower-js','bower-css']);

// Concatenate and Clean Vendor CSS
gulp.task('bower-css', function() {
	if(!wiredep().css) {
		return;
	}
	return gulp.src(wiredep().css)
				.pipe(concat('vendor.min.css'))
				.pipe(cleanCSS({compatibility: 'ie8'}))
				.pipe(gulp.dest(paths.dist+'/css'));
});

// Concatenate and Uglify Vendor JS
gulp.task('bower-js', function() {
	if(!wiredep().js) {
		return;
	}
	var js = gulp.src(wiredep().js);
	return js.pipe(concat('vendor.min.js')) 
		        .pipe(uglify())
		        .pipe(gulp.dest(paths.dist+'/js'));
});

// Concatenate and Uglify App JS
gulp.task('scripts',  function() {
    return gulp.src(paths.js)
		        .pipe(concat('app.min.js'))
		        .pipe(uglify())
		        .pipe(gulp.dest(paths.dist+'/js'));
});

// Compile, Concatenate and Clean App CSS
gulp.task('sass', function() {
    return gulp.src(paths.scss)
		        .pipe(sass())
		        .pipe(concat('styles.min.css'))
				.pipe(cleanCSS({compatibility: 'ie8'}))
		        .pipe(gulp.dest(paths.dist+'/css'));
});

// Inject Files for Production
gulp.task('inject',['bower', 'scripts', 'sass'] , function() {
    return gulp.src(paths.index)
		.pipe(inject(gulp.src(paths.dist+'/js/vendor.min.js'), {ignorePath: 'public', addRootSlash: false, name:'bower'}))
		.pipe(inject(gulp.src(paths.dist+'/js/app.min.js'), {ignorePath: 'public', addRootSlash: false, name:'app'}))
		.pipe(inject(gulp.src(paths.dist+'/css/vendor.min.css'), {ignorePath: 'public', addRootSlash: false, name:'bower'}))
		.pipe(inject(gulp.src(paths.dist+'/css/styles.min.css'), {ignorePath: 'public', addRootSlash: false, name:'app'}))
		.pipe(gulp.dest(paths.dist))
});

// Inject Files in a Development Environment
gulp.task('inject-dev', function() {
	var wiredepStream = require('wiredep').stream;
	return gulp.src(paths.index)
			.pipe(wiredepStream({}))
			.pipe(inject(gulp.src(paths.js).pipe(gulp.dest(paths.dist)),{ignorePath: 'public', addRootSlash: false, name:'app'}))
			.pipe(inject(gulp.src(paths.scss).pipe(sass()).pipe(gulp.dest(paths.dist)),{ignorePath: 'public', addRootSlash: false, name:'app'}))
	        .pipe(gulp.dest(paths.dist));
});

// Watch Files For Changes
gulp.task('watch', function() {
    gulp.watch('src/**/*.js', ['lint', 'scripts']);
    gulp.watch('scss/**/*.scss', ['sass']);
});

// Server
gulp.task('serve', function() {
  gulp.src('.')
    .pipe(webserver({
		port:'9090',
		livereload: true
    }));
});

// Default Task
gulp.task('default', ['lint', 'inject-dev', 'watch', 'serve']);
gulp.task('build', ['lint', 'inject', 'watch', 'serve']);
