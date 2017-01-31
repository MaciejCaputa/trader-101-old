const
  gulp          = require('gulp'),
  jade          = require('gulp-jade'),
  sass          = require('gulp-sass'),
  prefix        = require('gulp-autoprefixer'),
  cssmin        = require('gulp-cssmin'),
  babel         = require('gulp-babel'),
  uglify        = require('gulp-uglify'),
  concat        = require('gulp-concat'),
  rename        = require("gulp-rename"),
  browserSync   = require('browser-sync'),
  bourbon       = require('bourbon').includePaths;



var Server = require('karma').Server;

/**
 * Run test once and exit
 */
gulp.task('test', function (done) {
  new Server({
    configFile: __dirname + '/karma.conf.js',
    singleRun: true
  }, done).start();
});


gulp.task('jadefiles', function() {
    return gulp.src(['./**/*.jade'])
    .pipe(jade({pretty: true}))
    .pipe(gulp.dest('_site/'));
});

gulp.task('stylesheets', function() {
  return gulp.src(['./app/stylesheets/main.sass'])
  .pipe(sass({
      includePaths: [bourbon]//,
  }))
  // .pipe(cssmin())
  .pipe(rename({suffix: '.min'}))
  .pipe(prefix(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
  .pipe(gulp.dest('./_site/assets/stylesheets'));
});

gulp.task('javascripts', function() {
  return gulp.src([
      './app/libs/angular.min.js',
      './app/libs/angular-ui-router.min.js',
      './app/libs/angular-mocks.min.js',
      './app/libs/jquery.min.js',
      './app/libs/d3.min.js',
      './app/libs/firebase-app.min.js',
      './app/libs/firebase-auth.min.js',
      './app/libs/firebase-database.min.js',

      './app/javascripts/graph.js',
      './app/javascripts/config.js',
      './app/javascripts/app.routes.js',
      './app/javascripts/app.factories.js',
      './app/javascripts/app.modules.js',
      './app/components/**/component.js'

    ])
    // .pipe(babel({
    //       presets: ['es2015']
    //   }))
    .pipe(concat('app.min.js'))
    // .pipe(gulp.dest('./_site/assets/javascripts'))
    // .pipe(uglify())
    // .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('./_site/assets/javascripts'));
});


gulp.task('webmanifest', function() {
  return gulp.src(['./manifest.webmanifest']).pipe(gulp.dest('./_site'));
});

gulp.task('htaccess', function() {
  return gulp.src(['./.htaccess']).pipe(gulp.dest('./_site'));
});

gulp.task('jadefiles-watch',      ['jadefiles'],      browserSync.reload);
gulp.task('stylesheets-watch',    ['stylesheets'],    browserSync.reload);
gulp.task('javascripts-watch',    ['javascripts'],    browserSync.reload);
gulp.task('webmanifest-watch',    ['webmanifest'],    browserSync.reload);
gulp.task('htaccess-watch',       ['htaccess'],       browserSync.reload);


gulp.task('build', ['jadefiles', 'stylesheets', 'javascripts', 'webmanifest', 'htaccess'], function() {
  console.log('Building...');
});

gulp.task('default', ['build'], function() {
  browserSync({
    server: {
      baseDir: './_site'
    }
  });

  gulp.watch( ['**/*.jade'],                      ['jadefiles-watch'] );
  gulp.watch( ['app/**/*.sass'],                  ['stylesheets-watch'] );
  gulp.watch( ['app/**/*.js'],                    ['javascripts-watch'] );
  gulp.watch( ['manifest.webmanifest'],           ['webmanifest-watch'] );
  gulp.watch( ['.htaccess'],                      ['htaccess-watch'] );
});
