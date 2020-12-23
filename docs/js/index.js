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
        $(".website").show(700);
        $("nav button").animate({
            opacity: 1
        }, 1500);

    } else {
        // If another filter is clicked, apply and save
        var category = currentFilter;
        var categoryWebsites = $(".website." + category);

        $(".website").not(categoryWebsites).hide(700);
        categoryWebsites.show(700);

        var clickedNavButton = $('nav button[value="' + currentFilter + '"]');

        clickedNavButton.animate({
            opacity: 1
        }, 1500);
        $("nav button").not(clickedNavButton).animate({
            opacity: 0.25
        }, 1500);

        lastFilter = currentFilter;
    }
}

Setup();