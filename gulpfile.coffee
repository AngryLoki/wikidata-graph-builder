gulp = require('gulp')
gutil = require('gulp-util')
stylus = require('gulp-stylus')
inline = require('rework-inline')
csso = require('gulp-csso')
uglify = require('gulp-uglify')
jade = require('gulp-jade')
coffee = require('gulp-coffee')
concat = require('gulp-concat')
livereload = require('gulp-livereload')
express = require('express')
app = express()
path = require('path')
es = require('event-stream')
flatten = require('gulp-flatten')

# Build tasks
gulp.task 'bower-css', ->
  gulp.src([
    'bower_components/**/*.min.css'
    '!bower_components/**/docs/**/*.min.css'
  ]).pipe(flatten())
    .pipe gulp.dest('dist/assets/css/')

gulp.task 'bower-js', ->
  gulp.src([
    'bower_components/**/*.min.js'
    'bower_components/**/bundled/html5/jquery.history.js'
    '!bower_components/**/docs/**/*.min.js'
    '!bower_components/**/additional-methods.min.js'
    '!bower_components/**/select2.full.min.js'
  ]).pipe(flatten())
    .pipe gulp.dest('dist/assets/js/')

gulp.task 'bower-fonts', ->
  gulp.src([
    'bower_components/**/dist/fonts/*.eot'
    'bower_components/**/dist/fonts/*.svg'
    'bower_components/**/dist/fonts/*.ttf'
    'bower_components/**/dist/fonts/*.woff'
    'bower_components/**/dist/fonts/*.woff2'
  ]).pipe(flatten())
    .pipe gulp.dest('dist/assets/fonts/')

gulp.task 'bower-all', ['bower-css', 'bower-js', 'bower-fonts']

gulp.task 'css', ->
  gulp.src('src/assets/stylesheets/*.styl')
      .pipe(stylus())
      .pipe(csso())
      .pipe(gulp.dest('dist/assets/css/'))
      .pipe livereload()

gulp.task 'js', ->
  es.merge(gulp.src('src/assets/scripts/*.coffee')
    .pipe(coffee()), gulp.src('src/assets/scripts/*.js'))
    .pipe(uglify())
    .pipe(concat('all.min.js'))
    .pipe(gulp.dest('dist/assets/js/'))
    .pipe livereload()

gulp.task 'templates', ->
  gulp.src('src/*.jade')
      .pipe(jade(pretty: true))
      .pipe(gulp.dest('dist/'))
      .pipe livereload()

gulp.task 'express', ->
  app.use express.static(path.resolve('./dist'))
  app.listen 1337
  gutil.log 'Listening on port: 1337'
  return

gulp.task 'watch', ->
  livereload.listen()
  gulp.watch 'src/assets/stylesheets/*.styl', [ 'css' ]
  gulp.watch 'src/assets/scripts/*.js', [ 'js' ]
  gulp.watch 'src/assets/scripts/*.coffee', [ 'js' ]
  gulp.watch 'src/*.jade', [ 'templates' ]
  return

# User tasks
gulp.task 'build', ['bower-all', 'js', 'css', 'templates']
gulp.task 'serve', ['express', 'watch']
gulp.task 'default', ['build', 'serve']
