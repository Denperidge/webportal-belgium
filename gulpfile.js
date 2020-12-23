const fs = require("fs");
const { series, parallel, src, dest, watch } = require("gulp");
const pug = require("gulp-pug");
const flatten = require("gulp-flatten");

const browserSync = require("browser-sync").create();
function WatchForChanges() {
    watch(["src/**/*.pug", "src/**/*.json"], RenderViews);
}
function StartBrowserSync() {
    browserSync.init({
        server: "dist/",
        host: "localhost"
    });
    watch("dist/**").on("change", browserSync.reload);
}


function RenderViews() {
    var data = JSON.parse(fs.readFileSync("src/vars.json"));

    return src("src/**/index.pug")
        .pipe(pug({
            data: data
        }))
        .pipe(flatten())
        .pipe(dest("dist/"));
}

exports.build = parallel(RenderViews)
exports.default = series(exports.build, parallel(WatchForChanges, StartBrowserSync));