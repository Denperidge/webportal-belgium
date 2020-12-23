var lastFilter;

// Run init code in Setup as to not use global variables
function Setup() {
    $("nav button").click(Filter);

    Filter();
}

function Filter(e) {
    // If not called from Setup, ensure that the target has is placed
    if (e != undefined) {
        window.location.hash = e.currentTarget.value;
    } else if (window.location.hash == "") return;
    var currentFilter = window.location.hash.substring(1);

    // If the same filter is clicked twice, disable filter
    if (currentFilter == lastFilter) {
        window.location.hash = "";
        lastFilter = "";
        $(".website").show();
        
    } else {
        // If another filter is clicked, apply and save
        var category = currentFilter;
        $(".website").hide();
        $(".website." + category).show();
        lastFilter = currentFilter;
    }
}

Setup();