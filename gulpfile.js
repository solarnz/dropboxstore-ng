/* node:true */
'use strict';

var gulp = require('gulp');

var _ = require('lodash');
var coveralls = require('gulp-coveralls');
var jshint = require('gulp-jshint');
var karma = require('gulp-karma');
var mainBowerFiles = require('main-bower-files');
var ngDocs = require('gulp-ngdocs');
var git = require('gulp-git');
var bump = require('gulp-bump');
var filter = require('gulp-filter');
var tag_version = require('gulp-tag-version');

gulp.task('lint', ['lint:js']);
gulp.task('lint:js', function() {
  return gulp.src([].concat('src/**/*.js'))
             .pipe(jshint())
             .pipe(jshint.reporter('jshint-stylish'))
             .pipe(jshint.reporter('fail'))
  ;
});

function runKarma(karmaOptions) {
  karmaOptions = _.assign({
    configFile: 'karma.conf.js',
    action: 'run',
    reporters: ['mocha', 'coverage']
  }, karmaOptions);

  var bower = require('./bower.json');

  var sources = [].concat(
    mainBowerFiles({includeDev: true}),
    bower.main,
    'src/**.spec.js'
  );

  return gulp.src(sources)
             .pipe(karma(karmaOptions))
  ;
}

gulp.task('test', function() {
  return runKarma({});
});

gulp.task('test:dev', function() {
  return runKarma({
    action: 'autowatch',
    reporters: ['mocha', 'coverage'],
    mochaReporter: {
      output: 'autowatch'
    }
  });
});

gulp.task('test:ci', function() {
  return runKarma({
    coverageReporter: {
      type: 'lcov',
      dir: 'coverage'
    }
  });
});

gulp.task('coveralls', ['test:ci'], function() {
  return gulp.src('coverate/**/lcov.info')
             .pipe(coveralls());
});

gulp.task('ngdocs', function() {
  return gulp.src(require('./bower.json').main)
             .pipe(ngDocs.process({}))
             .pipe(gulp.dest('./docs'));
});

function inc(importance) {
    // get all the files to bump version in
    return gulp.src(['./package.json', './bower.json'])
        // bump the version number in those files
        .pipe(bump({type: importance}))
        // save it back to filesystem
        .pipe(gulp.dest('./'))
        // commit the changed version number
        .pipe(git.commit('Bump vesion number'))

        // read only one file to get the version number
        .pipe(filter('package.json'))
        // **tag it in the repository**
        .pipe(tag_version());
}

gulp.task('patch', function() { return inc('patch'); });
gulp.task('feature', function() { return inc('minor'); });
gulp.task('release', function() { return inc('major'); });

gulp.task('default', ['lint', 'ngdocs', 'test']);

gulp.task('ci', ['lint', 'ngdocs', 'test:ci', 'coveralls']);
