const _ = require('lodash');
const bootstrap = require('bootstrap-styl');
const browserify = require('browserify');
const browserSync = require('browser-sync');
const chokidar = require('chokidar');
const gulp = require('gulp');
const notify = require('gulp-notify');
const plumber = require('gulp-plumber');
const pug = require('gulp-pug');
const rimraf = require('rimraf');
const source = require('vinyl-source-stream');
const sourcemaps = require('gulp-sourcemaps');
const stylus = require('gulp-stylus');

function onError() {
    var args = Array.prototype.slice.call(arguments);
    notify.onError({
        title: "Compile Error",
        message: "<%= error %>"
    }).apply(this, args);
    this.emit('end');
}

gulp.watch = function (glob, opt, task) {
    if (typeof opt === 'string' || typeof task === 'string' || Array.isArray(opt) || Array.isArray(task)) {
        throw new Error('watching ' + glob + ': watch task has to be a function (optionally generated by using gulp.parallel or gulp.series)');
    }
    if (typeof opt === 'function') {
        task = opt;
        opt = {};
    }
    opt = opt || {};
    var fn;
    if (typeof task === 'function' && !opt.noDebounce) {
        let isActive = false;
        fn = () => (isActive || this.parallel(task)(() => isActive = false), isActive = true);
    } else {
        fn = this.parallel(task);
    }
    if (opt.wait) {
        fn = _.debounce(fn, opt.wait);
    }
    if (opt.ignoreInitial == null) {
        opt.ignoreInitial = true;
    }
    var watcher = chokidar.watch(glob, opt);
    if (fn) {
        watcher.on('change', fn).on('unlink', fn).on('add', fn);
    }
    return watcher;
};


gulp.task('clean', (cb) => {
    rimraf('./dist', cb);
});

gulp.task('template', () => {
    return gulp.src('./src/*.pug')
        .pipe(pug())
        .pipe(gulp.dest('./dist/'));
});

gulp.task('style', () => {
    return gulp.src('./src/styles/main.styl')
        .pipe(plumber({
            errorHandler: notify.onError('<%= error.message %>')
        }))
        .pipe(sourcemaps.init())
        .pipe(stylus({
            use: bootstrap()
        }))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('./dist/assets/styles/'));
});

gulp.task('compile', (cb) => {
    browserify({ entries: './src/scripts/main.ts' })
        .plugin('tsify', {
            debug: true
        })
        .bundle()
        .on('error', onError)
        .pipe(source('main.js'))
        .pipe(gulp.dest(`./dist/assets/scripts/`))
        .on('end', cb)
});

gulp.task('watch', () => {
    const server = browserSync.create();
    server.init({
        server: {baseDir: 'dist'},
        reloadDelay: 1000
    }, () => {
        gulp.watch(['./dist/**/*.html', './dist/**/*.js'], {noDebounce: true}, () => server.reload());
        gulp.watch(`./dist/**/*.css`, {noDebounce: true}, () => server.reload('*.css'));
        gulp.watch('./src/*.pug', gulp.series('template'));
        gulp.watch('./src/styles/**/*.styl', gulp.series('style'));
        gulp.watch('./src/scripts/**/*.ts', gulp.series('compile'));
    });
    return server;
});

gulp.task('default', gulp.series('clean', gulp.parallel('template', 'style', 'compile'), 'watch'));

