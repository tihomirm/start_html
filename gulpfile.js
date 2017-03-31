var gulp           = require('gulp'),
    plumber        = require('gulp-plumber'),
    gutil          = require('gulp-util' ),
    concat         = require('gulp-concat'),
    pug            = require('gulp-pug'),
    fileinclude    = require('gulp-file-include'),
    sass           = require('gulp-sass'),
    autoprefixer   = require('gulp-autoprefixer'),
    gcmq           = require('gulp-group-css-media-queries'),
    cleanCSS       = require('gulp-clean-css'),
    uglify         = require('gulp-uglify'),
    rename         = require('gulp-rename'),
    cache          = require('gulp-cache'),
    notify         = require('gulp-notify'),
    imagemin       = require('gulp-imagemin'),
    pngquant       = require('imagemin-pngquant'),
    del            = require('del'),
    smartgrid      = require('smart-grid'),
    browserSync    = require('browser-sync');

var smartgridSettings = {
    "filename": '_smart-grid',
    outputStyle: 'sass', /* less || scss || sass || styl */
    columns: 12, /* number of grid columns */
    offset: "30px", /* gutter width px || % */
    container: {
        maxWidth: '1280px', /* max-width оn very large screen */
        fields: '30px' /* side fields */
    },
    breakPoints: {
        lg: {
            'width': '1170px',
            'fields': '30px'
        },
        md: {
            'width': '970px',
            'fields': '15px'
        },
        sm: {
            'width': '750px',
            'fields': '15px'
        },
        xs: {
            'width': '550px',
            'fields': '15px'
        }
    }
};

gulp.task('html', function() {
    return gulp.src('app/templates/**/*.html')
        .pipe(plumber())
        .pipe(fileinclude({
            prefix: '@@',
            basepath: '@file'
        }))
        .pipe(gulp.dest('app/'));
});

gulp.task('pug', function() {
    return gulp.src([
            'app/templates/**/*.pug',
            '!app/templates/**/_*.pug'
        ])
        .pipe(plumber())
        .pipe(pug({
            pretty: true
        }))
        .pipe(gulp.dest('app/'));
});

gulp.task('smartgrid', function() {
    smartgrid('app/sass', smartgridSettings);
});

gulp.task('sass', function() {
    gulp.src('app/sass/**/*.sass')
        .pipe(plumber())
        .pipe(sass({outputStyle: 'expand'}).on("error", notify.onError()))
        .pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
        .pipe(gcmq())
        .pipe(gulp.dest('app/css'));

    return gulp.src([
            'app/css/**/*.css',
            '!app/css/**/*.min.css'
        ])
        .pipe(plumber())
        .pipe(rename({suffix: '.min', prefix : ''}))
        .pipe(cleanCSS())
        .pipe(gulp.dest('app/css'))
        .pipe(browserSync.reload({stream: true}))
});

gulp.task('custom-js', function() {
    return gulp.src([
            'app/js/app.js'
        ])
        .pipe(concat('app.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('app/js'));
});

gulp.task('js', ['custom-js'], function() {
    return gulp.src([
            'app/libs/jquery/dist/jquery.min.js'
        ])
        .pipe(concat('libs.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('app/js'))
        .pipe(browserSync.reload({stream: true}));
});

gulp.task('browser-sync', function() {
    browserSync({
        server: {
            baseDir: 'app',
            directory: true
        },
        notify: false
    });
});

gulp.task('watch', ['html', 'pug', 'smartgrid', 'sass', 'js', 'browser-sync'], function() {
    gulp.watch(['app/templates/**/*.html', 'app/templates/**/*.htm'], ['html']);
    gulp.watch(['app/templates/**/*.pug'], ['pug']);
    gulp.watch('app/sass/**/*.sass', ['sass']);
    gulp.watch(['libs/**/*.js', 'app/js/app.js'], ['js']);
    gulp.watch('app/*.html', browserSync.reload);
});

gulp.task('build', ['removedist', 'html', 'pug', 'smartgrid', 'sass', 'js'], function() {

    var buildFiles = gulp.src([
            'app/**/*.html',
            '!app/templates/**/*.html',
            'app/.htaccess'
        ]).pipe(gulp.dest('dist'));

    var buildCss = gulp.src([
            'app/css/**/*.min.css'
        ]).pipe(gulp.dest('dist/css'));

    var buildJs = gulp.src([
            'app/js/libs.min.js',
            'app/js/app.min.js'
        ]).pipe(gulp.dest('dist/js'));

    var buildFonts = gulp.src([
            'app/fonts/**/*'
        ]).pipe(gulp.dest('dist/fonts'));

    var buildImages = gulp.src([
            'app/img/**/*'
        ])
        .pipe(cache(imagemin()))
        .pipe(gulp.dest('dist/img'));

});

gulp.task('removedist', function() { return del.sync('dist'); });
gulp.task('clearcache', function () { return cache.clearAll(); });

gulp.task('default', ['watch']);
