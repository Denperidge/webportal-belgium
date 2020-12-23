const fs = require("fs");
const { series, parallel, src, dest, watch } = require("gulp");
const pug = require("gulp-pug");
const sass = require("gulp-sass");
const flatten = require("gulp-flatten");

sass.compiler = require("node-sass");

const browserSync = require("browser-sync").create();
function WatchForChanges() {
    watch("src/**/*{.pug,.json,.scss,.js}", RenderAllViews);
    watch("src/**/*.scss", RenderCSS);
}
function StartBrowserSync() {
    browserSync.init({
        server: "dist/",
        host: "localhost",
        startPath: "nl/"
    });
    watch("dist/**").on("change", browserSync.reload);
}

function RecursiveLanguageLookup(object, language) {
    var objectKeys = Object.keys(object);
    for (var i=0; i < objectKeys.length; i++) {
        var objectKey = objectKeys[i];
        var objectValue = object[objectKey];


        // If language value found, set it
        if (objectKey.toLowerCase().trim() == language.toLowerCase().trim()) {
            object = objectValue;
        }
        else if (typeof(objectValue) == "object") {
            object[objectKey] = RecursiveLanguageLookup(object[objectKey], language);
        } else {
            
        }
    }

    return object;
}

function LoadJsonFile(filename) {
    return JSON.parse(fs.readFileSync(filename));

}

function LoadJsonDir(dirname) {
    var jsonDir = fs.readdirSync(dirname)
    var jsonArray = [];
    jsonDir.forEach((jsonFilename) => {
        var json = LoadJsonFile(dirname + jsonFilename);
        jsonArray.push(json);
    });
    return jsonArray;
}

function RenderViews(language) {
    // Load in consistent vars
    var data = LoadJsonFile("src/config/vars.json");

    data.language = language;

    // Load in tags info
    data.tags = LoadJsonFile("src/config/tags.json");

    // Load in website info
    data.websites = LoadJsonDir("src/links/");

    // Set all variables to language value to simplify code
    // Instead of title[language], title can just be used
    data = RecursiveLanguageLookup(data, language);
    

    // Expand on the leftover data
    data.websites.forEach((website, websiteIndex) => {
        data.websites[websiteIndex].tags.forEach((tag, tagIndex) => {
            data.websites[websiteIndex].tags.push(data.tags[tag]);
        });
    });


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

function RenderCSS() {
    return src("src/**/*.scss")
        .pipe(sass().on("error", sass.logError))
        .pipe(dest("dist"));
}

exports.build = parallel(RenderAllViews)
exports.default = series(exports.build, parallel(WatchForChanges, StartBrowserSync));