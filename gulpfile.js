var paths = require('./gulp/config').paths;

var gulp = require('gulp');
var gulpSequence = require('gulp-sequence');
var del = require('del');
var bump = require('gulp-bump');
var rename = require('gulp-rename');
var wrap = require('gulp-wrap');
var KarmaServer = require('karma').Server;
var jsBuild = require('./gulp/jsBuild');

gulp.task('jsReleaseBuild', jsBuild.release);



// -- main tasks. use these to watch and build and release
gulp.task('build', ['jsReleaseBuild']);


gulp.task('test-karma', function (done) {
  new KarmaServer({
    configFile: __dirname + '/karma.conf.js',
    singleRun: true
  }, function (errorCode) {
    if (errorCode !== 0) {
      console.log('Karma exited with error code ' + errorCode);
      done();
      return process.exit(errorCode);
    }
    done();
  }).start();
});

gulp.task('test', gulpSequence('build', 'test-karma'));



gulp.task('major', function(){
  gulp.src(['./bower.json', './package.json'])
  .pipe(bump({type:'major'}))
  .pipe(gulp.dest('./'));
});

gulp.task('minor', function(){
  gulp.src(['./bower.json', './package.json'])
  .pipe(bump({type:'minor'}))
  .pipe(gulp.dest('./'));
});

gulp.task('patch', function(){
  gulp.src(['./bower.json', './package.json'])
  .pipe(bump({type:'patch'}))
  .pipe(gulp.dest('./'));
});

gulp.task('prerelease', function(){
  gulp.src(['./bower.json', './package.json'])
  .pipe(bump({type:'prerelease'}))
  .pipe(gulp.dest('./'));
});
