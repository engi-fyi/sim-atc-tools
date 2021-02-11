var ADD_TIME = "Add Time";
var ADD_DIST = "Add Distance";
var CROSS_TIME = "Cross Time";

/**
 *
    dT  = delta time - the delay in minutes
    dNm = separation distance gained
    t   = target time
    DTR = distance to run
 *
 */

class EnrouteCalculator {
    constructor(mode = 0) {
        this.currentMode = mode;
        this.groundSpeed = 0;    // GS
        this.flightLevel = 0;    // FL
        this.distanceToFix = 0;  // DTR;
        this.delayRequired = 0;  // dt;
        this.reportedMach = 0;   // MIAS;
    }

    validateValues() {
        if (this.groundSpeed > 100 && this.flightLevel < 50 && this.flightLevel < 650 &&
            this.distanceToFix > 100 && this.delayRequired > 0
        ) {
            return true;
        } else {
            return false;
        }
    }

    calculate() {
        if (this.validateValues) {
            if (this.currentMode == ADD_TIME) {
                return this.addTime();
            } else if (this.currentMode == ADD_DIST) {
                return this.addDistance();
            } else if (this.currentMode == CROSS_TIME) {
                return this.crossTime();
            } else {
                return -1;
            }
        }
    }

    addTime() {
        return true;
    }

    addDistance() {
        return true;
    }

    crossTime() {
        return true;
    }
}

function activateCalculator(inButton) {
    let theButton = $("#" + inButton.id);
    $(".enroute-calculator-selector").removeClass("clicked");
    theButton.addClass("clicked");
    $("#enr_in_data_point").val("");

    if (theButton.val() == ADD_TIME) {
        $("#enr_label_data_point").html("Delay Required");
        $("#enr_current_mode").val(ADD_TIME);
        $("#enr_label_out_data_point").html("+Distance: ");
    } else if (theButton.val() == ADD_DIST) {
        $("#enr_label_data_point").html("Distance Required");
        $("#enr_current_mode").val(ADD_DIST);
        $("#enr_label_out_data_point").html("+Time: ");
    } else if  (theButton.val() == CROSS_TIME) {
        $("#enr_label_data_point").html("Time to Cross");
        $("#enr_current_mode").val(CROSS_TIME);
        $("#enr_label_out_data_point").html("+Distance: ");
    }
}

function enrResetAll() {
    $(".enr_in").val("");
    $(".enr_out").html("&nbsp;-&nbsp;");
}