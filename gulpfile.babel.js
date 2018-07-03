import gulp from 'gulp';
import sass from 'gulp-sass';
import concat from 'gulp-concat';
import sourcemaps from 'gulp-sourcemaps';
import { listen, changed } from 'gulp-livereload';
import nodemon from 'gulp-nodemon';
import bower from 'gulp-bower';
import babel from 'gulp-babel';
import shell from 'gulp-shell';
import karma from 'karma';
import path from 'path';

const { Server } = karma;

gulp.task('styles', () => {
  return sass('public/css/common.scss', { style: 'expanded' })
    .pipe(gulp.dest('public/css'));
});

gulp.task('nodemon', () => {
  nodemon({
    verbose: true,
    script: 'server.js',
    ignore: ['README.md', 'node_modules/', '.DS_Store'],
    ext: 'js html jade scss css',
    watch: ['app', 'config', 'public', 'server.js'],
    delayTime: 1,
    env: { PORT: 3000 },
    NODE_ENV: process.env.NODE_ENV
  });
});

gulp.task('watch', () => {
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

gulp.task('export', () => {
  gulp.src('public/lib/bootstrap/dist/css/*')
    .pipe(gulp.dest('public/lib/bootstrap/css'));
  gulp.src('public/lib/bootstrap/dist/js/*')
    .pipe(gulp.dest('public/lib/bootstrap/js'));
  gulp.src('public/lib/bootstrap/dist/fonts/*')
    .pipe(gulp.dest('public/lib/bootstrap/fonts'));
  gulp.src('public/lib/angular-ui-utils/modules/route/route.js')
    .pipe(gulp.dest('public/lib/angular-ui-utils/modules'));
});

// Default task(s).
gulp.task('default', ['nodemon', 'watch']);

// Backend Test task.
gulp.task('test:backend', shell.task([
  'NODE_ENV=test nyc mocha backend-test/**/*.js  --exit',
]));

// Frontend test task
gulp.task('test:frontend', (done) => {
  new Server({
    configFile: path.join(__dirname, '/karma.conf.js'),
    singleRun: true
  }, done).start();
});

// Babel task.
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

// Bower task.
gulp.task('install', () => {
  return bower({
    directory: './public/lib',
  });
});

// Test task
gulp.task('test', ['test:backend', 'test:frontend']);
