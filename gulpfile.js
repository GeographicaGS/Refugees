var browserify = require('browserify'),
  gulp = require('gulp'),
  babel = require('gulp-babel'),
  source = require('vinyl-source-stream'),
  buffer = require('vinyl-buffer'),
  less = require('gulp-less'),
  cleanCSS = require('gulp-clean-css'),
  uglify = require('gulp-uglify');

gulp.task('browserify-debug', function() {
  return browserify('./src/js/App.js', {debug:true, transform: ['node-underscorify']})
  // .transform("babelify", {presets: ['es2015'], plugins:['transform-object-assign',["transform-es2015-for-of", {"loose": true}]]})
  .bundle()
  .on('error', function(err){console.log(err);this.emit("end");})
  .pipe(source('main.js'))
  .pipe(gulp.dest('./public/js/'));
});

gulp.task('browserify-production', function() {
  return browserify('./src/js/App.js', {transform: ['node-underscorify']})
    .transform("babelify", {presets: ['es2015'], plugins:['transform-object-assign',["transform-es2015-for-of", {"loose": true}]]})
    .bundle()
    .on('error', function(err){console.log(err);this.emit("end");})
    .pipe(source('main.js'))
    .pipe(buffer())
    .pipe(uglify())
    .pipe(gulp.dest('./public/js/'));
});

gulp.task('less', function () {
  return gulp.src('./src/css/style.less')
  .pipe(less().on('error', function (err) {
    console.log(err);
    this.emit("end");
  }))
	.pipe(cleanCSS({compatibility: 'ie8'}))
  .pipe(gulp.dest('./public/css/'));
});


gulp.task('watch', function() {
  gulp.watch('src/**/*.*', ['browserify-debug', 'less']);
  return;
});

gulp.task('build',['browserify-production', 'less'])
