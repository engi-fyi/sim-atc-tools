const ADD_TIME = "Add Time";
const ADD_DIST = "Add Distance";
const CROSS_TIME = "Cross Time";
const SPECIFIC_HEAT_RATIO = 1.4;
const SPECIFIC_GAS_CONSTANT_FEET = 1718;


class SpeedValues {
    constructor(groundSpeed, machNumber, changedValue) {
        this.groundSpeed = Math.round(groundSpeed);
        this.machNumber = machNumber.toFixed(2);
        this.changedValue = Math.round(changedValue);
    }
}

class VectorValues {
    constructor(heading, time) {
        this.heading = Math.round(heading);
        this.time = time.toFixed(2);
    }
}

class Calculations {
    // https://www.grc.nasa.gov/www/k-12/airplane/sound.html
    // rgas = 286 ;                /* ft2/sec2 R */
    // gama = 1.4 ;
    // a0 = Math.sqrt(gama*rgas*temp) ;
    static speedOfSoundMiles(altitudeFeet) {
        let temp = -1

        if (altitudeFeet > 36152) {
            temp = 389.98;
        } else {
            temp = 518.6 - (3.56 * (altitudeFeet / 1000));
        }

        let speedFeet = Math.sqrt(SPECIFIC_HEAT_RATIO * SPECIFIC_GAS_CONSTANT_FEET * temp);
        let speedMiles = speedFeet * 60.0 / 88.0 ;
        return speedMiles;
    }

    static speedOfSound(altitudeFeet) {
        return Calculations.toKnots(Calculations.speedOfSoundMiles(altitudeFeet));
    }

    static machNumber(altitudeFeet, trueAirSpeed) {
        let machNumber = trueAirSpeed / Calculations.speedOfSound(altitudeFeet);
        return machNumber;
    }

    static trueAirSpeed(altitudeFeet, machNumber) {
        let tas = Calculations.speedOfSound(altitudeFeet) * machNumber;
        return tas;
    }

    static headwindComponent(groundSpeed, trueAirSpeed) {
        let headwind = trueAirSpeed - groundSpeed;
        return headwind;
    }

    static toKnots(milesPerHour) {
        return (milesPerHour * 0.868976);
    }

    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/tan
    static getTanFromDegrees(degrees) {
        return Math.tan(degrees * Math.PI / 180);
    }

    // This is an isoceles triangle with known side lengths.
	// https://www.mathsisfun.com/algebra/trig-solving-sss-triangles.html
    // https://owlcation.com/stem/Everything-About-Triangles-and-More-Isosceles-Equilateral-Scalene-Pythagoras-Sine-and-Cosine
    //
    // https://www.quora.com/How-do-I-calculate-the-angles-of-an-isosceles-triangle
	static vectorToFix(initialDistance, extraDistance, groundSpeed) {
        let totalDistance = extraDistance + initialDistance;
        let time = (totalDistance / (groundSpeed / 60)) / 2;
        let a = totalDistance / 2;
        let b = initialDistance / 2;
        let radians = Math.acos(b / a);
        let vector = radians * (180 / Math.PI);
        console.log(radians + " " + vector);

        return new VectorValues(vector, time);
    }

    // https://www.mathematics-monster.com/lessons/using_the_cosine_function_to_find_the_hypotenuse.html
    static vectorToTrack(initialDistance, extraDistance, groundSpeed, angle) {
        let radians = angle * (Math.PI / 180);
        let adjacent = (initialDistance + extraDistance) / 2;
        let cosine = Math.cos(radians);
        let hypotenuse = adjacent / cosine;
        let time = hypotenuse / (groundSpeed / 60);
        return new VectorValues(angle, time);
    }
}

class TimeAddition {
    constructor(groundSpeed, altitude, distanceToFix, delayRequired, reportedMach) {
        this.groundSpeed = groundSpeed;
        this.altitude = altitude;
        this.distanceToFix = distanceToFix;
        this.delayRequired = delayRequired;
        this.reportedMach = reportedMach;
    }

    applySpeed() {
        let existingRunTime = this.distanceToFix / (this.groundSpeed / 60);
        let trueAirSpeed = Calculations.trueAirSpeed(this.altitude, this.reportedMach);
        let newRunTime = this.delayRequired + existingRunTime;
        let newGroundSpeed = (this.distanceToFix / newRunTime) * 60;
        let newTrueAirSpeed = newGroundSpeed + Calculations.headwindComponent(this.groundSpeed, trueAirSpeed);
        let newMach = Calculations.machNumber(this.altitude, newTrueAirSpeed);
        let separationGained = (newRunTime - existingRunTime) * (newGroundSpeed / 60);
        return new SpeedValues(newGroundSpeed, newMach, separationGained);
    }

    vectorThenDirectFix() {
        let groundSpeedPerMinute = this.groundSpeed / 60;
        let extraDistance = this.delayRequired * groundSpeedPerMinute;
        return Calculations.vectorToFix(this.distanceToFix, extraDistance, this.groundSpeed);
    }

    vectorToTrack() {
        let groundSpeedPerMinute = this.groundSpeed / 60;
        let extraDistance = this.delayRequired * groundSpeedPerMinute;
        return [
            Calculations.vectorToTrack(this.distanceToFix, extraDistance, this.groundSpeed, 10),
            Calculations.vectorToTrack(this.distanceToFix, extraDistance, this.groundSpeed, 20),
            Calculations.vectorToTrack(this.distanceToFix, extraDistance, this.groundSpeed, 30),
            Calculations.vectorToTrack(this.distanceToFix, extraDistance, this.groundSpeed, 40),
        ]
    }
}

class DistanceAddition {
    constructor(groundSpeed, altitude, distanceToFix, extraDistance, reportedMach) {
        this.groundSpeed = groundSpeed;
        this.altitude = altitude;
        this.distanceToFix = distanceToFix;
        this.extraDistance = extraDistance;
        this.reportedMach = reportedMach;
    }

    applySpeed() {
        let existingRunTime = this.distanceToFix / (this.groundSpeed / 60);
        let trueAirSpeed = Calculations.trueAirSpeed(this.altitude, this.reportedMach);
        let newDistanceToFix = this.distanceToFix - this.extraDistance;
        let newGroundSpeed = (newDistanceToFix  / existingRunTime) * 60;
        let newTrueAirSpeed = newGroundSpeed + Calculations.headwindComponent(this.groundSpeed, trueAirSpeed);
        let newMach = Calculations.machNumber(this.altitude, newTrueAirSpeed);
        let separationGained = (this.extraDistance / newGroundSpeed) * 60;
        return new SpeedValues(newGroundSpeed, newMach, separationGained);
    }

    vectorThenDirectFix() {
        return Calculations.vectorToFix(this.distanceToFix, this.extraDistance, this.groundSpeed);
    }

    vectorToTrack() {
        return [
            Calculations.vectorToTrack(this.distanceToFix, this.extraDistance, this.groundSpeed, 10),
            Calculations.vectorToTrack(this.distanceToFix, this.extraDistance, this.groundSpeed, 20),
            Calculations.vectorToTrack(this.distanceToFix, this.extraDistance, this.groundSpeed, 30),
            Calculations.vectorToTrack(this.distanceToFix, this.extraDistance, this.groundSpeed, 40),
        ]
    }
}

class SpecifyCrossTime {
    constructor(groundSpeed, altitude, distanceToFix, newRunTime, reportedMach) {
        this.groundSpeed = groundSpeed;
        this.altitude = altitude;
        this.distanceToFix = distanceToFix;
        this.newRunTime = newRunTime;
        this.reportedMach = reportedMach;
    }

    applySpeed() {
        let existingRunTime = this.distanceToFix / (this.groundSpeed / 60);
        let trueAirSpeed = Calculations.trueAirSpeed(this.altitude, this.reportedMach);
        let newGroundSpeed = (this.distanceToFix / this.newRunTime) * 60;
        let newTrueAirSpeed = newGroundSpeed + Calculations.headwindComponent(this.groundSpeed, trueAirSpeed);
        let newMach = Calculations.machNumber(this.altitude, newTrueAirSpeed);
        let separationGained = (this.newRunTime - existingRunTime) * (newGroundSpeed / 60);
        return new SpeedValues(newGroundSpeed, newMach, separationGained);
    }

    vectorThenDirectFix() {
        let existingRunTime = this.distanceToFix / (this.groundSpeed / 60);
        let delayRequired = this.newRunTime - existingRunTime;
        let groundSpeedPerMinute = this.groundSpeed / 60;
        let extraDistance = delayRequired * groundSpeedPerMinute;
        console.log("Extra Distance: " + extraDistance);
        return Calculations.vectorToFix(this.distanceToFix, extraDistance, this.groundSpeed);
    }

    vectorToTrack() {
        let existingRunTime = this.distanceToFix / (this.groundSpeed / 60);
        let delayRequired = this.newRunTime - existingRunTime;
        let groundSpeedPerMinute = this.groundSpeed / 60;
        let extraDistance = delayRequired * groundSpeedPerMinute;
        return [
            Calculations.vectorToTrack(this.distanceToFix, extraDistance, this.groundSpeed, 10),
            Calculations.vectorToTrack(this.distanceToFix, extraDistance, this.groundSpeed, 20),
            Calculations.vectorToTrack(this.distanceToFix, extraDistance, this.groundSpeed, 30),
            Calculations.vectorToTrack(this.distanceToFix, extraDistance, this.groundSpeed, 40),
        ]
    }
}

try {
    module.exports.Calculations = Calculations;
    module.exports.TimeAddition = TimeAddition;
    module.exports.DistanceAddition = DistanceAddition;
    module.exports.SpecifyCrossTime = SpecifyCrossTime;
} catch {}

class EnrouteValues {
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
            this.distanceToFix >= 50 && (this.reportedMach < 5 || this.reportedMach === 0) & !isNaN(this.dataPoint)
        ) {
            return true;
        } else {
            return false;
        }
    }
}

class EnrouteUI {
     static calculate() {
        console.log("Current Mode: " + ENROUTE_VALUES.currentMode);
        if (ENROUTE_VALUES.currentMode === ADD_TIME) {
            return EnrouteUI.addTime();
        } else if (ENROUTE_VALUES.currentMode === ADD_DIST) {
            return EnrouteUI.addDistance();
        } else if (ENROUTE_VALUES.currentMode === CROSS_TIME) {
            return EnrouteUI.crossTime();
        } else {
            return -1;
        }
    }

    static addTime() {
        console.log("Calculating 'Add Time'.");
        let ta = new TimeAddition(
            ENROUTE_VALUES.groundSpeed, 
            ENROUTE_VALUES.flightLevel * 1000, 
            ENROUTE_VALUES.distanceToFix, 
            ENROUTE_VALUES.dataPoint, 
            ENROUTE_VALUES.reportedMach
        )
        let speedValues = ta.applySpeed();
        EnrouteUI.writeApplySpeed(speedValues);
        let vectorValues = ta.vectorThenDirectFix();
        EnrouteUI.writeVectorDirect(vectorValues);
        let allVectorValues = ta.vectorToTrack();
        EnrouteUI.writeVectorReturn(allVectorValues);
    }

    static addDistance() {
        console.log("Calculating 'Add Distance'.");
        let da = new DistanceAddition(
            ENROUTE_VALUES.groundSpeed, 
            ENROUTE_VALUES.flightLevel * 1000, 
            ENROUTE_VALUES.distanceToFix, 
            ENROUTE_VALUES.dataPoint, 
            ENROUTE_VALUES.reportedMach
        )
        let speedValues = da.applySpeed();
        EnrouteUI.writeApplySpeed(speedValues);
        let vectorValues = da.vectorThenDirectFix();
        EnrouteUI.writeVectorDirect(vectorValues);
        let allVectorValues = da.vectorToTrack();
        EnrouteUI.writeVectorReturn(allVectorValues);
    }

    static crossTime() {
        console.log("Calculating 'Cross Time'.");
        let ct = new SpecifyCrossTime(
            ENROUTE_VALUES.groundSpeed, 
            ENROUTE_VALUES.flightLevel * 1000, 
            ENROUTE_VALUES.distanceToFix, 
            ENROUTE_VALUES.dataPoint, 
            ENROUTE_VALUES.reportedMach
        )
        let speedValues = ct.applySpeed();
        EnrouteUI.writeApplySpeed(speedValues);
        let vectorValues = ct.vectorThenDirectFix();
        EnrouteUI.writeVectorDirect(vectorValues);
        let allVectorValues = ct.vectorToTrack();
        EnrouteUI.writeVectorReturn(allVectorValues);
    }

    static writeApplySpeed(speedValues) {
         $("#enr_out_mach_number").html(speedValues.machNumber);
         $("#enr_out_ground_speed").html(Math.round(speedValues.groundSpeed));
         $("#enr_out_data_point").html(Math.round(speedValues.changedValue));
    }

    static writeVectorDirect(vectorValues) {
         $("#enr_out_vector_fix_degrees").html(Math.round(vectorValues.heading) + "&#176;");
         $("#enr_label_out_vector_fix_time").html(Math.round(vectorValues.time) + " mins");
    }

    static writeVectorReturn(vectorValues) {
        $("#enr_out_vector_track_10_degrees").html(Math.round(vectorValues[0].time) + " mins");
        $("#enr_out_vector_track_20_degrees").html(Math.round(vectorValues[1].time) + " mins");
        $("#enr_out_vector_track_30_degrees").html(Math.round(vectorValues[2].time) + " mins");
        $("#enr_out_vector_track_40_degrees").html(Math.round(vectorValues[3].time) + " mins");
   }

    static fieldChange() {
        ENROUTE_VALUES.currentMode = $("#enr_current_mode").val();
        ENROUTE_VALUES.groundSpeed = parseInt($("#enr_in_groundspeed").val());
        ENROUTE_VALUES.flightLevel = parseInt($("#enr_in_flight_level").val());
        ENROUTE_VALUES.distanceToFix = parseInt($("#enr_in_dis_to_fix").val());
        ENROUTE_VALUES.dataPoint = parseInt($("#enr_in_data_point").val());
        let reportedMach = parseFloat($("#enr_in_reported_mach").val());

        if (isNaN(reportedMach)) {
            ENROUTE_VALUES.reportedMach = 0;
        } else {
            ENROUTE_VALUES.reportedMach = reportedMach;
        }

        if (ENROUTE_VALUES.groundSpeed > 0 && 
            ENROUTE_VALUES.flightLevel > 0 && 
            ENROUTE_VALUES.distanceToFix > 0 &&
            ENROUTE_VALUES.dataPoint > 0 &&
            ENROUTE_VALUES.reportedMach > 0) {
                EnrouteUI.calculate();
        } else {
            console.log("Not all values filled in, skipping calculation.")
        }
    }

    static activate(inButton) {
         let theButton = $("#" + inButton.id);
        $(".enroute-calculator-selector").removeClass("clicked");
        theButton.addClass("clicked");
        $("#enr_in_data_point").val("");
        $(".enr_out").html("&nbsp;-&nbsp;");

        if (theButton.val() === ADD_TIME) {
            $("#enr_label_data_point").html("Delay Required");
            $("#enr_current_mode").val(ADD_TIME);
            EnrouteUI.switchOutDataPointUnit("+Separation: ", "NM");
        } else if (theButton.val() === ADD_DIST) {
            $("#enr_label_data_point").html("Gap Required");
            $("#enr_current_mode").val(ADD_DIST);
            EnrouteUI.switchOutDataPointUnit("+Time: ", "mins");
        } else if  (theButton.val() === CROSS_TIME) {
            $("#enr_label_data_point").html("Time to Cross");
            $("#enr_current_mode").val(CROSS_TIME);
            EnrouteUI.switchOutDataPointUnit("+Separation: ", "NM");
        }
    }

    static switchOutDataPointUnit(label, unit) {
         $("#enr_label_out_data_point").html(label);
         $("#enr_label_out_data_point_unit").html(unit);
         $("#enr_out_data_point").html("&nbsp;-&nbsp;");
    }

    static resetAll() {
        EnrouteUI.resetInputs();
        EnrouteUI.resetOutputs();
    }

    static resetInputs() {
        $(".enr_in").val("");
    }

    static resetOutputs() {
         $(".enr_out").html("&nbsp;-&nbsp;");
         $("#enr_out_data_point").html("");
    }

    static resetVectorDirectOutputs() {
         $(".enr_out_vector_fix").html("&nbsp;-&nbsp;");
    }
}

function enrFieldChange() {
    EnrouteUI.fieldChange();
}

function activateCalculator(inButton) {
    EnrouteUI.activate(inButton);
}

function enrResetAll() {
    EnrouteUI.resetAll();
}