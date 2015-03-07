/* node:true */
'use strict';

var gulp = require('gulp');

var _ = require('lodash');
var jshint = require('gulp-jshint');
var karma = require('gulp-karma');
var mainBowerFiles = require('main-bower-files');
var ngDocs = require('gulp-ngdocs');

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

gulp.task('ngdocs', function() {
  return gulp.src(require('./bower.json').main)
             .pipe(ngDocs.process({}))
             .pipe(gulp.dest('./docs'));
});

gulp.task('default', ['lint', 'test']);
