import gulp from 'gulp';
import jshint, { reporter as _reporter } from 'gulp-jshint';
import sass from 'gulp-sass';
import concat from 'gulp-concat';
import mocha from 'gulp-mocha';
import sourcemaps from 'gulp-sourcemaps';
import { listen, changed } from 'gulp-livereload';
import nodemon from 'gulp-nodemon';
import bower from 'gulp-bower';
import babel from 'gulp-babel';
import cover from 'gulp-coverage';

gulp.task('jshint', () => {
  return gulp.src(['public/js/**/*.js', 'test/**/*.js', 'app/**/*.js'])
    .pipe(jshint())
    .pipe(_reporter('default'));
});

gulp.task('styles', () => {
  return sass('public/css/common.scss', { style: 'expanded' })
    .pipe(gulp.dest('public/css'));
});

gulp.task('nodemon', () => {
  nodemon({
    verbose: true,
    script: 'server.js',
    tasks: ['jshint'],
    ignore: ['README.md', 'node_modules/**', 'public/lib/**', '.DS_Store'],
    ext: 'js html jade scss css',
    watch: ['app', 'config', 'public', 'server.js'],
    delayTime: 1,
    env: { PORT: 3000 },
    NODE_ENV: process.env.NODE_ENV
  });
});

gulp.task('watch', () => {
  gulp.watch(['public/js/**', 'app/**/*.js'], ['jshint']);
  gulp.watch(['public/css/**'], ['styles']);
  gulp.watch(['public/css/common.scss, public/css/views/articles.scss'], ['styles']);
  listen();
  gulp.watch([
    'public/views/**',
    'public/css/**',
    'public/js/**',
    'app/**/**'
  ]).on('change', changed);
});

gulp.task('default', ['nodemon', 'watch']);

gulp.task('test', () => {
  return gulp.src(['test/**/*.js', '!test/angular/**/*.js'])
    .pipe(cover.instrument({
      pattern: ['**/test*'],
      debugDirectory: 'debug'
    }))
    .pipe(mocha({
      reporter: 'spec',
      exit: true,
      globals: {
        should: require('should')
      },
      compilers: 'babel-register'
    }))
    .pipe(cover.gather())
    .pipe(cover.format())
    .pipe(gulp.dest('reports'));
});

gulp.task('build', () => gulp.src([
  './**/*.js',
  '!node_modules/**',
  '!public/lib/**',
  '!gulpfile.babel.js',
  '!bower_components/**/*'
])
  .pipe(sourcemaps.init())
  .pipe(babel())
  .pipe(concat('all.js'))
  .pipe(sourcemaps.write('.'))
  .pipe(gulp.dest('./dist')));

gulp.task('install', () => {
  return bower({
    directory: './public/lib',
    verbosity: 2,
    cmd: 'install'
  });
});
