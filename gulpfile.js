const fs = require("fs");
const { series, parallel, src, dest, watch } = require("gulp");
const pug = require("gulp-pug");
const sass = require("gulp-sass");
const flatten = require("gulp-flatten");
const header = require("gulp-header");

sass.compiler = require("node-sass");

const browserSync = require("browser-sync").create();
function WatchForChanges() {
    watch("src/**/*{.pug,.json,.scss,.js}", RenderAllViews);
    watch("src/**/*.scss", RenderCSS);
    watch("src/**/*.js", RenderJS);
}
function StartBrowserSync() {
    browserSync.init({
        server: "docs/",
        host: "localhost",
        startPath: "nl/"
    });
    watch("docs/**").on("change", browserSync.reload);
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

function LoadJsonDirToArray(dirname) {
    var jsonDir = fs.readdirSync(dirname);
    var jsonArray = [];
    jsonDir.forEach((jsonFilename) => {
        var json = LoadJsonFile(dirname + jsonFilename);
        jsonArray.push(json);
    });
    return jsonArray;
}

function LoadJsonDirToObject(dirname) {
    var jsonDir = fs.readdirSync(dirname);
    var jsonObject = {};
    jsonDir.forEach((jsonFilename) => {
        var json = LoadJsonFile(dirname + jsonFilename);
        var name = jsonFilename.substring(0, jsonFilename.lastIndexOf("."));
        jsonObject[name] = json;
    });
    return jsonObject;
}

function RenderUpperIndex() {
    return src("src/index.pug")
        .pipe(pug({}))
        .pipe(dest("docs/"))
}

function RenderViews(language) {
    // Load in consistent vars
    var data = LoadJsonFile("src/config/vars.json");

    data.language = language;

    // Load in tags info
    data.tags = LoadJsonFile("src/config/tags.json");

    // Load in website info
    data.websites = LoadJsonDirToArray("src/links/");
    // Only keep websites available in the selected language
    data.websites = data.websites.filter((website) => {
        return website.langs.includes(language);
    });

    data.txt = LoadJsonDirToObject("src/txt/");



    // Set all variables to language value to simplify code
    // Instead of title[language], title can just be used
    data = RecursiveLanguageLookup(data, language);


    // Expand on the leftover data
    data.websites.map((website) => {
        website.fullTags = [];
        website.tags.map((tag) => {
            try {
                website.fullTags = website.fullTags.concat(data.tags[tag].synonyms);
            } catch (TypeError) {
                console.error(`[${language}] Tag '${tag}' has no synonyms`);
            }
        });
    });


    return src(["src/**/index.pug", "!src/index.pug"])
        .pipe(pug({
            data: data
        }))
        .pipe(flatten())
        .pipe(dest("docs/" + language + "/"));

}

function RenderAllViews() {
    return Promise.all([
        RenderViews("nl"),
        RenderViews("fr"),
        RenderViews("en")
    ]);
}

function RenderCSS() {
    var tagsAndColours = "$tags: (";
    var tags = Object.entries(LoadJsonFile("src/config/tags.json"));
    for (var [key, value] of tags) {
        var colour = value.colour;
        tagsAndColours += `"${key}": ${colour}, `;
    }
    tagsAndColours = tagsAndColours.trim(", ") + ");\n"

    return src("src/**/*.scss")
        .pipe(header(tagsAndColours))
        .pipe(sass().on("error", sass.logError))
        .pipe(dest("docs"));
}

function RenderJS() {
    return src("src/**/*.js")
        .pipe(dest("docs/"));
}

exports.build = parallel(RenderUpperIndex, RenderAllViews, RenderCSS, RenderJS)
exports.default = series(exports.build, parallel(WatchForChanges, StartBrowserSync));