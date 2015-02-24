var gulp = require('gulp');
var sass = require('gulp-ruby-sass');
// var minifyCSS = require('gulp-minify-css');
// var uglify = require('gulp-uglifyjs');
// var copy = require('gulp-copy');
// var scp = require('gulp-scp2');
// var rename = require('gulp-rename');

gulp.task('sass', function () {
    return gulp.src('public/scss/*.scss')
        .pipe(sass())
        .pipe(gulp.dest('public/css/'));
});

// gulp.task('minify-css', function() {
//     gulp.src('./app/css/*.css')
//         .pipe(minifyCSS())
//         .pipe(gulp.dest('./dist/styles/'));
// });

// gulp.task('copyhtmls', function (){
//     gulp.src('./app/partials/*.html')
//         .pipe(copy('dist', {
//             prefix : 1
//         }));
// });

// gulp.task('copyjslib', function () {
//     gulp.src([

//         ])
//         .pipe(copy('dist/scripts', {
//             prefix : 3
//         }));
// });

// gulp.task('uglify', function() {
//     gulp.src([

//         ])
//         .pipe(uglify())
//         .pipe(gulp.dest('dist/scripts/'));
// });

// gulp.task('copyhtml', function () {
//     gulp.src('./app/pack.html')
//         .pipe(rename('index.html'))
//         .pipe(gulp.dest('./dist'));
// });



gulp.task('default', function () {
    gulp.watch('public/scss/*.scss', ['sass']);
});


// gulp.task('build', ['minify-css', 'copyhtmls', 'copyhtml', 'copyjslib', 'uglify']);
