gulp = require 'gulp'
gulpLoadPlugins = require 'gulp-load-plugins'
browserSync = require('browser-sync').create()
es = require 'event-stream'
$ = gulpLoadPlugins()

production = !!$.util.env.production

gulp.task 'browser-sync', ->
    browserSync.init server: baseDir: './dist'
    return

gulp.task 'serve', ->
    browserSync.init server: './dist'
    gulp.watch 'src/assets/stylesheets/*.styl', [ 'css' ]
    gulp.watch 'src/assets/scripts/*.js', [ 'js' ]
    gulp.watch 'src/assets/scripts/*.coffee', [ 'js' ]
    gulp.watch 'src/*.jade', [ 'templates' ]
    return

# Build tasks
gulp.task 'bower-css', ->
    gulp.src([
        'bower_components/**/*.min.css'
        '!bower_components/angular-material/modules/**/*.min.css'
        '!bower_components/angular-material/layouts/**/*.min.css'
        '!bower_components/angular-material/core/**/*.min.css'
    ])
    .pipe $.flatten()
    .pipe gulp.dest 'dist/assets/css/'

gulp.task 'bower-js', ->
    gulp.src([
        'bower_components/**/*.min.js'
        'bower_components/**/color-hash.js'
        '!bower_components/angular-material/modules/**/*.min.js'
    ])
    .pipe $.flatten()
    .pipe gulp.dest 'dist/assets/js/'

gulp.task 'bower-fonts', ->
    gulp.src([
        'bower_components/**/dist/fonts/*.eot'
        'bower_components/**/dist/fonts/*.svg'
        'bower_components/**/dist/fonts/*.ttf'
        'bower_components/**/dist/fonts/*.woff'
        'bower_components/**/dist/fonts/*.woff2'
    ])
    .pipe $.flatten()
    .pipe gulp.dest 'dist/assets/fonts/'

gulp.task 'bower-all', ['bower-css', 'bower-js', 'bower-fonts']

gulp.task 'css', ->
    gulp.src 'src/assets/stylesheets/*.styl'
    .pipe $.stylus()
    .pipe $.autoprefixer()
    .pipe if production then $.csso() else $.util.noop()
    .pipe gulp.dest 'dist/assets/css/'
    .pipe browserSync.stream()

gulp.task 'js', ->
    es.merge(gulp.src('src/assets/scripts/*.coffee')
    .pipe($.coffee()), gulp.src('src/assets/scripts/*.js'))
    .pipe if production then $.uglify() else $.util.noop()
    .pipe $.concat 'all.min.js'
    .pipe gulp.dest 'dist/assets/js/'
    .pipe browserSync.stream()

gulp.task 'templates', ->
    gulp.src 'src/*.jade'
        .pipe $.jade pretty: true
        .pipe if production then $.htmlmin(collapseWhitespace: true) else $.util.noop()
        .pipe gulp.dest 'dist/'
        .pipe browserSync.stream()

gulp.task 'bower', -> $.bower()

gulp.task 'deploy', ->
    ghToken = process.env.GH_TOKEN
    ghRef = process.env.GH_REF
    conf = remoteUrl: "https://#{ghToken}@#{ghRef}" if ghToken and ghRef
    gulp.src './dist/**/*'
    .pipe $.ghPages conf


# User tasks
gulp.task 'build', ['bower-all', 'js', 'css', 'templates']
gulp.task 'default', ['build', 'serve']
