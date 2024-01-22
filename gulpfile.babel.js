
import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import browserSync from 'browser-sync';
import del from 'del';

const $ = gulpLoadPlugins();
const reload = browserSync.reload;


gulp.task('styles', () => {
  return gulp.src('sass/*.scss')
    .pipe($.plumber())
    .pipe($.sourcemaps.init())
    .pipe($.sass.sync({
      outputStyle: 'expanded',
      precision: 10,
      includePaths: ['.']
    }).on('error', $.sass.logError))
    .pipe($.autoprefixer({browsers: ['> 1%', 'last 2 versions', 'Firefox ESR']}))
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest('css'))
    .pipe($.cssnano())
    .pipe($.rename({                               
        suffix: ".min"                            
    }))
    .pipe(gulp.dest('css'))
    .on('end', reload);
});


gulp.task('scripts', () => {
  return gulp.src(['js/*.js', '!js/*.min.js'])
    .pipe($.plumber())
    .pipe($.uglify({preserveComments: 'license'}))
    .pipe($.rename({
        suffix: ".min"
    }))
    .pipe(gulp.dest('js'))
    .on('end', reload);
});

function lint(files, options) {
  return () => {
    return gulp.src(files)
      .pipe(reload({stream: true, once: true}))
      .pipe($.eslint(options))
      .pipe($.eslint.format())
      .pipe($.if(!browserSync.active, $.eslint.failAfterError()));
  };
}

gulp.task('lint', lint('js/*.js'));




gulp.task('images', () => {
  return gulp.src('images/**/*')
    .pipe($.cache($.imagemin({
      progressive: true,
      interlaced: true,
      
      svgoPlugins: [{cleanupIDs: false}]
    })))
    .pipe(gulp.dest('images-min'));
});

gulp.task('serve', ['styles', 'scripts'], () => {
  browserSync({
    notify: false,
    port: 9000,
    server: {
      baseDir: ['./']
    }
  });

  gulp.watch([
    '*.html',
    'images/**/*',
    'fonts/**/*'
  ]).on('change', reload);

  gulp.watch('sass/**/*.scss', ['styles']);
  gulp.watch('js/**/*.js', ['scripts']);
});

gulp.task('default', () => {
  gulp.start('serve');
});
