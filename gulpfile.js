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



gulp.task('jadefiles', function() {
    return gulp.src(['./**/*.jade'])
    .pipe(jade())
    .pipe(gulp.dest('_site/'));
});

gulp.task('stylesheets', function() {
  return gulp.src(['./app/stylesheets/main.sass'])
  .pipe(sass({
      includePaths: [bourbon]//,
      // onError: browserSync.notify
  }))
  .pipe(cssmin())
  .pipe(rename({suffix: '.min'}))
  .pipe(prefix(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
  .pipe(gulp.dest('./_site/assets/stylesheets'));
});

gulp.task('javascripts', function() {
  return gulp.src([
      './app/javascripts/graph.js',
      './app/javascripts/config.js',
      './app/javascripts/app.routes.js',
      './app/javascripts/app.factories.js',
      './app/javascripts/app.modules.js',
      './app/components/**/*.js'
    ])
    .pipe(babel({
          presets: ['es2015']
      }))
    .pipe(concat('app.min.js'))
    .pipe(gulp.dest('./_site/assets/javascripts'))
    // .pipe(uglify())
    .pipe(rename({suffix: '.min'}))
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
