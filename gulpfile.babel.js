import gulp from 'gulp';
import sass from 'gulp-sass';
import concat from 'gulp-concat';
import sourcemaps from 'gulp-sourcemaps';
import { listen, changed } from 'gulp-livereload';
import nodemon from 'gulp-nodemon';
import shell from 'gulp-shell';
import bower from 'gulp-bower';
import babel from 'gulp-babel';
import karma from 'karma';
import dotenv from 'dotenv';
import path from 'path';
import shell from 'gulp-shell';

dotenv.config();
const { Server } = karma;

gulp.task('styles', () => sass('public/css/common.scss', { style: 'expanded' })
  .pipe(gulp.dest('public/css')));

gulp.task('develop', () => {
  nodemon({
    exec: 'gulp compile && gulp export && node dist/server.js',
    ignore: ['README.md', 'node_modules/**', 'dist/**', 'public/lib/**', '.DS_Store'],
    ext: 'js html jade scss css',
    watch: ['app', 'config', 'public', 'server.js'],
    delayTime: 1,
    env: { PORT: 3000 },
    NODE_ENV: process.env.NODE_ENV,
  });
});

gulp.task('compile', () => {
  const stream = gulp.src(['./**/*.js', '!node_modules/**', '!dist/**/*', '!public/lib/**/*.js', '!test/angular/**/*.js'])
    .pipe(babel({
      presets: ['env'],
      plugins: [
        'transform-class-properties',
        'transform-decorators',
        'transform-object-rest-spread'
      ]
    }))
    .pipe(gulp.dest('dist'));
  return stream;
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
  gulp.src('public/lib/materialize/dist/css/*')
    .pipe(gulp.dest('public/lib/materialize/css'));
  gulp.src('public/lib/materialize/dist/js/*')
    .pipe(gulp.dest('public/lib/materialize/js'));
  gulp.src('public/lib/angular-ui-utils/modules/route/route.js')
    .pipe(gulp.dest('dist/public/lib/angular-ui-utils/modules'));
  // adding this to let gulp pipe the jade files to the dist folder
  gulp.src('app/views/**/*.jade')
    .pipe(gulp.dest('dist/app/views'));
  gulp.src('public/**/*')
    .pipe(gulp.dest('dist/public'));
});

// Default task(s).
gulp.task('default', ['develop']);

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
gulp.task('install', () => bower({ directory: './public/lib' }));

// Test task
gulp.task('test', ['test:frontend', 'test:backend']);
