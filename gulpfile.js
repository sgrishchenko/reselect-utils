const gulp = require('gulp');
const babel = require('gulp-babel');

gulp.task('cjs', () =>
  gulp.src([
    'src/**/*.{ts,tsx}',
    '!src/__data__/**',
    '!src/__tests__/**',
    '!src/__stories__/**',
  ])
    .pipe(babel())
    .pipe(gulp.dest('lib'))
);

gulp.task('es', () =>
  gulp.src([
    'src/**/*.{ts,tsx}',
    '!src/__data__/**',
    '!src/__tests__/**',
    '!src/__stories__/**',
  ])
    .pipe(babel({
      presets: [
        ["@babel/preset-env", {modules: false}]
      ]
    }))
    .pipe(gulp.dest('es'))
);

exports.default = gulp.parallel('cjs', 'es')
