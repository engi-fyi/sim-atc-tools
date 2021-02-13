let ENROUTE_CALCULATOR;
let COUNTDOWN_TIMER;

$(document).ready(function() {
    // lookups
    drawVersion()
    clearTimer();
    let modules = ["airline", "airport", "aircraft"];
    let mm = new ModuleManager(modules);
    mm.loadData();
    mm.clearDetails();
    mm.clearInputs();
    mm.initializeWindows();

    enrResetAll();
    vatSys();
    ENROUTE_CALCULATOR = new EnrouteCalculator();
    restoreUIState();
});

function vatSys() {
    try {
        let urlParams = new URLSearchParams(window.location.search);
        let isVatSys = (urlParams.get("vatsys").toLowerCase() == "true");

        if (isVatSys) {
            console.log("Hiding footer and info-pane.");
            $(".ip-large").css("display", "none");
            $(".ip-small").css("display", "none");
            $(".footer").css("display", "none");
            $("#desktop").css("margin-right", "0px")
        }
    } catch { }
}

function openInfoPane() {
    $(".ip-large").css("display", "block");
    $(".ip-small").css("display", "none");
    $("#desktop").css("margin-right", "550px")
    Cookies.set("ip", 1);
}

function closeInfoPane() {
    $(".ip-large").css("display", "none");
    $(".ip-small").css("display", "block");
    $("#desktop").css("margin-right", "70px")
    Cookies.set("ip", 0);
}

async function drawVersion() {
    let versionDetails = await $.ajax({
        url: "version.json",
        type: "GET"
    });

    let existingFooter = $("#footer-text").html();
    let footer = existingFooter + " | Version: " + versionDetails["version"] + " (" + versionDetails["data_version"] + ")";
    $("#footer-text").html(footer)
}

function menuClicked(buttonIn) {
    let menuItem = $("#" + buttonIn.id);
    let toolId = menuItem.val().replaceAll(" ", "-").toLowerCase();

    if (menuItem.hasClass("clicked")) {
        hideTool(buttonIn.id, toolId);
    } else {
        showTool(buttonIn.id, toolId);
    }
}

function hideTool(menuId, toolId) {
    let tool = $("#" + toolId);
    let menuItem = $("#" + menuId);
    menuItem.removeClass("clicked");
    tool.css("display", "none");
    Cookies.set("menu-" + menuId, 0);
}

function showTool(menuId, toolId) {
    let tool = $("#" + toolId);
    let menuItem = $("#" + menuId);
    menuItem.addClass("clicked");
    tool.css("display", "inline-block");
    Cookies.set("menu-" + menuId, 1);
}

function restoreUIState() {
    if (Cookies.get("ip") == 1) {
        openInfoPane();
    } else if (Cookies.get("ip") == 0) {
        closeInfoPane();
    }

    $(".page-menu").each(restoreToolState);
}

function restoreToolState(i, buttonIn) {
    let menuItem = $("#" + buttonIn.id);
    let toolId = menuItem.val().replaceAll(" ", "-").toLowerCase();

    if (Cookies.get("menu-" + buttonIn.id) == 0) {
        hideTool(buttonIn.id, toolId);
    } else if (Cookies.get("menu-" + buttonIn.id) == 1) {
        showTool(buttonIn.id, toolId)
    }
}