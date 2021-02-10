

var COUNTDOWN_TIMER;

$(document).ready(function() {
    // lookups
    drawVersion();
    clearTimer();
    var modules = ["airline", "airport", "aircraft"];
    var mm = new ModuleManager(modules);
    mm.loadData();
    mm.clearDetails();
    mm.clearInputs();
    mm.initializeWindows();

    // timer
    $(".ip-small .button").on("click", function() {
        $(".ip-large").css("display", "block");
        $(".ip-small").css("display", "none");
        $("#desktop").css("margin-right", "550px")
    });
    $(".ip-large .button").on("click", function() {
        $(".ip-large").css("display", "none");
        $(".ip-small").css("display", "block");
        $("#desktop").css("margin-right", "70px")
    });

    vatSys();
});

function vatSys() {
    try {
        var urlParams = new URLSearchParams(window.location.search);
        var isVatSys = (urlParams.get("vatsys").toLowerCase() == "true");

        if (isVatSys) {
            console.log("Hiding footer and info-pane.");
            $(".ip-large").css("display", "none");
            $(".ip-small").css("display", "none");
            $(".footer").css("display", "none");
        }
    } catch { }
}

async function drawVersion() {
    versionDetails = await $.ajax({
        url: "version.json",
        type: "GET"
    });

    var existingFooter = $("#footer-text").html();
    var footer = existingFooter + " | Version: " + versionDetails["version"];
    $("#footer-text").html(footer)
}

function menuClicked(buttonIn) {
    var menuItem = $("#" + buttonIn.id);
    var toolId = menuItem.val().replaceAll(" ", "-").toLowerCase();
    var tool = $("#" + toolId)

    if (menuItem.hasClass("clicked")) {
        menuItem.removeClass("clicked");
        tool.css("display", "none");
    } else {
        menuItem.addClass("clicked");
        tool.css("display", "inline-block");
    }
}