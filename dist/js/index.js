

// Run init code in Setup as to not use global variables
function Setup() {
    $("nav a").click(Filter);

    Filter();
}

function Filter() {
    if (window.location.hash == "") return;
    var category = window.location.hash.substring(1);
    $(".website").hide();
    $(".website." + category).show();
}

Setup();