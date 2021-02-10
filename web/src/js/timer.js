function timerButtonClicked(buttonIn) {
    className = buttonIn.id.split("_")[0];
    var theButton = $("#" + buttonIn.id);
    var theClass = $("." + className);
    $("#" + className).val(theButton.val().toLowerCase())

    theButton.addClass("clicked");
    theClass.prop("disabled", true);
    theClass.addClass("not-clicked");
    theButton.removeClass("not-clicked");

    checkTrigger();
}

function checkTrigger() {
    var departing = $("#departing").val()
    var waiting = $("#waiting").val()

    if (departing != "" && waiting != "") {
        separationRequirement = determineSeparationRequirement(departing, waiting);
        secondsToCountdown = secondsToMinutes(separationRequirement)
        $("#timer-details").html(secondsToCountdown);
        $("#timer-current").val(separationRequirement);
        COUNTDOWN_TIMER = setInterval(countdownTimer, 1000);
    }
}

function clearTimer() {
    $("#departing").val("");
    $("#waiting").val("");
    $(".departing").removeClass(["clicked", "not-clicked"]).prop("disabled", false);
    $(".waiting").removeClass(["clicked", "not-clicked"]).prop("disabled", false);
    $("#timer-current").val("0");
    clearInterval(COUNTDOWN_TIMER);
    $("#timer-details").html("00:00");
}

function determineSeparationRequirement(departing, waiting) {
    if (departing == "light") {
        return 60;
    } else if (departing == "medium") {
        if (waiting == "light") {
            return 120;
        } else {
            return 60;
        }
    } else if (departing == "heavy") {
        if (waiting == "light" || waiting == "medium") {
            return 120;
        } else {
            return 60;
        }
    } else if (departing == "super") {
        if (waiting == "light" || waiting == "medium") {
            return 180;
        } else if (waiting == "heavy") {
            return 120;
        } else {
            return 60;
        }
    } else {
        return 60;
    }
}

function secondsToMinutes(seconds) {
    var minutes = parseInt(seconds / 60);
    var seconds = seconds - (minutes * 60);

    var minuteString = minutes.toString();
    var secondString = seconds.toString();

    if (minutes < 10) {
        minuteString = "0" + minutes;
    }

    if (seconds < 10) {
        secondString = "0" + seconds;
    }

    return minuteString + ":" + secondString;
}

function countdownTimer() {
    var secondsLeft = parseInt($("#timer-current").val());
    var afterTick = secondsLeft - 1;
    var secondsLeftString = secondsToMinutes(afterTick);

    if (afterTick == 0) {
        clearInterval(COUNTDOWN_TIMER);

        $("#timer-details").html("00:00");

        setTimeout(function() {
            $("#timer-details").html("&nbsp;");
            beep();
        }, 500);
        setTimeout(function() {
            $("#timer-details").html("00:00");
        }, 1000);
        setTimeout(function() {
            $("#timer-details").html("&nbsp;");
            beep();
        }, 1500);
        setTimeout(function() {
            $("#timer-details").html("00:00");
            clearTimer();
        }, 2000);
    } else {
        $("#timer-details").html(secondsLeftString);
        $("#timer-current").val(afterTick);
    }
}

// https://stackoverflow.com/questions/879152/how-do-i-make-javascript-beep
// This solution is the simplest and probably the most backwards-compatible now.
function beep() {
    var snd = new  Audio("data:audio/wav;base64,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" +
    "rFRb//////////////////////////////////////////////////////////////////////////////////////////////////////////////" +
    "//////////////////////////////////////////////////////////////////////////////////////////////////////////////////" +
    "//////////////////////////////////////////////////////////////////////////////////////////////////////////////////" +
    "///////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" +
    "AAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291b" +
    "mRib3kuZGUAAAAAAAAAACU=");
    snd.play();
}