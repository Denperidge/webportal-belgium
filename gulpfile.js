const fs = require("fs");
const { series, parallel, src, dest, watch } = require("gulp");
const pug = require("gulp-pug");
const flatten = require("gulp-flatten");


var languageCodes = ["nl", "fr", "en"];


const browserSync = require("browser-sync").create();
function WatchForChanges() {
    watch(["src/**/*.pug", "src/**/*.json"], RenderViews);
}
function StartBrowserSync() {
    browserSync.init({
        server: "dist/",
        host: "localhost",
        startPath: "nl/"
    });
    watch("dist/**").on("change", browserSync.reload);
}


function RenderViews(language) {
    // Load in consistent vars
    var data = JSON.parse(fs.readFileSync("src/vars.json"));

    // Load in website info
    var websitesDir = fs.readdirSync("src/links/")
    var websites = [];
    websitesDir.forEach((websiteFile) => {
        var website = JSON.parse(fs.readFileSync("src/links/" + websiteFile));

        websites.push(website);
    });
    data.websites = websites;

    data.language = language;

    return src("src/**/index.pug")
        .pipe(pug({
            data: data
        }))
        .pipe(flatten())
        .pipe(dest("dist/" + language + "/"));

}

function RenderAllViews() {
    return Promise.all([
        RenderViews("nl"),
        RenderViews("fr"),
        RenderViews("en")
    ]);
}

exports.build = parallel(RenderAllViews)
exports.default = series(exports.build, parallel(WatchForChanges, StartBrowserSync));