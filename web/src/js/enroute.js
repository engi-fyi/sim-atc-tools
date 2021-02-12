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
        this.dataPoint = 0;  // dt;
        this.reportedMach = 0;   // MIAS;
    }

    validateValues() {
        if (this.groundSpeed > 100 && this.flightLevel < 650 &&
            this.distanceToFix > 100 && this.dataPoint > 0 && this.reportedMach < 5
        ) {
            return true;
        } else {
            return false;
        }
    }

    calculate() {
        if (this.validateValues()) {
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
        let mach_to_meet = required_speed_with_time_delay(this.groundSpeed, this.distanceToFix, this.flightLevel, this.dataPoint);
        let ground_speed_to_meet = required_speed_with_time_delay(this.groundSpeed, this.distanceToFix, this.flightLevel, this.dataPoint, false);
        $("#enr_out_mach_number").html(mach_to_meet.toFixed(2));
        $("#enr_out_ground_speed").html(ground_speed_to_meet.toFixed(0));
        return true;
    }

    addDistance() {
        let mach_to_meet = required_speed_with_distance_gap(this.groundSpeed, this.distanceToFix, this.flightLevel, this.dataPoint);
        let ground_speed_to_meet = required_speed_with_distance_gap(this.groundSpeed, this.distanceToFix, this.flightLevel, this.dataPoint, false);
        $("#enr_out_mach_number").html(mach_to_meet.toFixed(2));
        $("#enr_out_ground_speed").html(ground_speed_to_meet.toFixed(0));
        return true;
    }

    crossTime() {
        let mach_to_meet = required_speed_to_cross_at_time(this.groundSpeed, this.distanceToFix, this.flightLevel, this.dataPoint);
        let ground_speed_to_meet = required_speed_to_cross_at_time(this.groundSpeed, this.distanceToFix, this.flightLevel, this.dataPoint, false);
        $("#enr_out_mach_number").html(mach_to_meet.toFixed(2));
        $("#enr_out_ground_speed").html(ground_speed_to_meet.toFixed(0));
        return true;
    }
}

function enrFieldChange() {
    ENROUTE_CALCULATOR.currentMode = $("#enr_current_mode").val();
    ENROUTE_CALCULATOR.groundSpeed = parseInt($("#enr_in_groundspeed").val());
    ENROUTE_CALCULATOR.flightLevel = parseInt($("#enr_in_flight_level").val());
    ENROUTE_CALCULATOR.distanceToFix = parseInt($("#enr_in_dis_to_fix").val());
    ENROUTE_CALCULATOR.dataPoint = parseInt($("#enr_in_data_point").val());
    ENROUTE_CALCULATOR.reportedMach = parseFloat($("#enr_in_reported_mach").val());
    ENROUTE_CALCULATOR.calculate();
}

function activateCalculator(inButton) {
    let theButton = $("#" + inButton.id);
    $(".enroute-calculator-selector").removeClass("clicked");
    theButton.addClass("clicked");
    $("#enr_in_data_point").val("");
    $(".enr_out").html("&nbsp;-&nbsp;");

    if (theButton.val() == ADD_TIME) {
        $("#enr_label_data_point").html("Delay Required");
        $("#enr_current_mode").val(ADD_TIME);
        $("#enr_label_out_data_point").html("+Distance: ");
    } else if (theButton.val() == ADD_DIST) {
        $("#enr_label_data_point").html("Gap Required");
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

// 15, 13, 11 2 deg per fl
// http://www.aerospaceweb.org/question/atmosphere/q0126.shtml
// https://studyflying.com/isa-temperature-deviation/
function speed_of_sound(flight_level, knots=true) {
    let altitude_feet =  flight_level * 100;
    let altitude_metres = altitude_feet / 3.28084;
    let isa_temp = (altitude_metres / 1000) * 2;
    let isa_kelvin = isa_temp + 273.15;
    let specific_heat_ratio = 1.4;
    let specific_gas_constant = 287;
    let speed_of_sound_metres = Math.sqrt(specific_heat_ratio * specific_gas_constant * isa_kelvin);
    let speed_of_sound_feet = speed_of_sound_metres * 1.94384;

    if (knots) {
        return speed_of_sound_feet;
    } else {
        return speed_of_sound_metres;
    }

    return speed_of_sound;
}

// ADD_TIME / Apply Speed
function required_speed_with_time_delay(ground_speed, distance_to_run, flight_level, time_delay, mach=true) {
    let time_to_reach = (distance_to_run / ground_speed) * 60;
    console.log(time_to_reach);
    let ground_speed_to_reach = (distance_to_run / (time_to_reach + time_delay)) * 60;

    if (mach) {
        return ground_speed_to_reach / speed_of_sound(flight_level);
    } else {
        return ground_speed_to_reach;
    }
}

// ADD_DISTANCE / Apply Speed
function required_speed_with_distance_gap(ground_speed, distance_to_run, flight_level, gap_required, mach=true) {
    // Example Scenario:
    //      same distance, same time, just gap behind
    //      60 minutes to travel 500 miles
    //      60 minutes to travel 450 miles
    let gapped_distance = distance_to_run - gap_required;
    let initial_estimate = (distance_to_run / ground_speed) * 60;  // time in mins to complete run;
    let revised_estimate = gapped_distance / initial_estimate;  // knots per minute for gapped run;
    let gapped_estimate = initial_estimate * revised_estimate;

    if (mach) {
        return gapped_estimate / speed_of_sound(flight_level);
    } else {
        return gapped_estimate
    }
}

// CROSS_TIME / Apply Speed
// Note, if this speed is higher than the current speed, vectors and +Distance will be blank.
// Otherwise, they will have a value.
// NOTE FOR UI IMPLEMENTATION
// This is input in minutes, but can input in time in the UI. Can allow either a UTC time or number of minutes.
// Basically, if less than 4 digits, count as minutes.
// If 4 digits count as a timestamp.
function required_speed_to_cross_at_time(distance_to_run, flight_level, cross_time, mach= true) {
    let required_speed = (distance_to_run / cross_time) * 60;

    if (mach) {
        return required_speed / speed_of_sound(flight_level);
    } else {
        return required_speed
    }
}

// negative number is tail wind, positive is head wind.
function prevailing_winds(ground_speed, reported_mach_number, flight_level) {
    let true_air_speed = reported_mach_number * speed_of_sound(flight_level);
    let winds = ground_speed - true_air_speed;
    return winds;
}