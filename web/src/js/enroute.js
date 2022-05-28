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

    // This is an isoceles triangle.
	// https://www.mathsisfun.com/algebra/trig-solving-sss-triangles.html
    // https://owlcation.com/stem/Everything-About-Triangles-and-More-Isosceles-Equilateral-Scalene-Pythagoras-Sine-and-Cosine
	static vectorToFix(initialDistance, extraDistance, groundSpeed) {
        let totalDistance = extraDistance + initialDistance;
        let time = (totalDistance / (groundSpeed / 60)) / 2;
        let a = (totalDistance) / 2;
        let b = a;
        let c = initialDistance;

        let cosB = ((c * c) + (a * a) - (b * b)) / (2 * c * a);
        let radiansB = Math.acos(cosB);
        let vector = radiansB * (180 / Math.PI);

        return new VectorValues(vector, time);
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
}

try {
    module.exports.Calculations = Calculations;
    module.exports.TimeAddition = TimeAddition;
} catch {}

// const AddDistance = {
//     "apply_speed": function(distanceToFix, groundSpeed, delayRequired, flightLevel, currentMach) {
//         let timeToReach = (distanceToFix / groundSpeed) * 60;
//         console.log("Time to Reach: " + timeToReach);
//         let trueAirSpeed = Calculations["true_air_speed"](flightLevel * 1000, currentMach);
//         console.log("True Air Speed: " + trueAirSpeed);
//         let headwind = Calculations["headwind_component"](groundSpeed, trueAirSpeed);
//         console.log("Headwind: " + headwind);
//         let newTimeToFix = timeToReach + delayRequired;
//         let newGroundSpeed = distanceToFix / newTimeToFix;
//         let newTrueAirSpeed = newGroundSpeed - headwind;
//         let newMachSpeed = Calculations["mach_number"](flightLevel * 1000, newTrueAirSpeed)
//         let separationGained = this.delayRequired * (this.newGroundSpeed / 60);

//         return new SpeedValues(newGroundSpeed, newMachSpeed, separationGained);
//     },
//     "vector_then_direct": function() {
        
//     },
//     "vector_then_return": function() {
        
//     }
// }

// const AddCrossTime = {
//     "apply_speed": function() {
        
//     },
//     "vector_then_direct": function() {
        
//     },
//     "vector_then_return": function() {
        
//     }
// }


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
        if (ENROUTE_VALUES.validateValues()) {
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
    }

    static addTime() {
        let ta = new TimeAddition(
            ENROUTE_VALUES.groundSpeed, 
            ENROUTE_VALUES.flightLevel * 1000, 
            ENROUTE_VALUES.distanceToFix, 
            ENROUTE_VALUES.changedValue, 
            ENROUTE_VALUES.reportedMach
        )
        let speedValues = ta.applySpeed();
        EnrouteUI.writeApplySpeed(speedValues);
        let vectorValues = ta.vectorThenDirectFix();
        EnrouteUI.writeVectorDirect(vectorValues);

        if (speedValues.changedValue > 0) {
            let vectorValues = ENROUTE_CALCULATOR.vectorToFixAddTime();
            EnrouteUI.writeVectorDirect(vectorValues);
        } else {
            EnrouteUI.resetVectorDirectOutputs();
        }
    }

    static addDistance() {
        let speedValues = ENROUTE_CALCULATOR.applySpeedDistance();
        EnrouteUI.writeApplySpeed(speedValues);
        let vectorValues = ENROUTE_CALCULATOR.vectorToFixAddDistance();
        EnrouteUI.writeVectorDirect(vectorValues);
    }

    static crossTime() {
        let speedValues = ENROUTE_CALCULATOR.applySpeedCrossTime();
        EnrouteUI.writeApplySpeed(speedValues);

        if (speedValues.changedValue > 0) {
            let vectorValues = ENROUTE_CALCULATOR.vectorToFixCrossTime();
            EnrouteUI.writeVectorDirect(vectorValues);
        } else {
            EnrouteUI.resetVectorDirectOutputs();
        }
    }

    static writeApplySpeed(speedValues) {
         $("#enr_out_mach_number").html(speedValues.machNumber.toFixed(2));
         $("#enr_out_ground_speed").html(Math.round(speedValues.groundSpeed));
         $("#enr_out_data_point").html(Math.round(speedValues.changedValue));
    }

    static writeVectorDirect(vectorValues) {
         $("#enr_out_vector_fix_degrees").html(Math.round(vectorValues.heading) + "&#176;");
         $("#enr_label_out_vector_fix_time").html(Math.round(vectorValues.time) + " mins");
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

        EnrouteUI.calculate();
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