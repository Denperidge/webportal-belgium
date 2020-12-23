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


function RenderViews() {
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

    
    var promises = [];
    languageCodes.forEach((language) => {
        // Generate website for each langauge
        // Make a copy of data, since otherwise language assignment
        // will go by reference and it gets all weird 
        var dataCopy = data;
        dataCopy["language"] = language;
        console.log(dataCopy)
        console.log(dataCopy.language);
        promises.push(
            src("src/**/index.pug")
            .pipe(pug({
                data: dataCopy
            }))
            .pipe(flatten())
            .pipe(dest("dist/" + language + "/")));
    });
    return Promise.all(promises);
}

exports.build = parallel(RenderViews)
exports.default = series(exports.build, parallel(WatchForChanges, StartBrowserSync));