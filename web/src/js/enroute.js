const ADD_TIME = "Add Time";
const ADD_DIST = "Add Distance";
const CROSS_TIME = "Cross Time";
const STANDARD_MSL_TEMPERATURE = 15;
const SPECIFIC_HEAT_RATIO = 1.4;
const SPECIFIC_GAS_CONSTANT = 287;


class SpeedValues {
    constructor(groundSpeed, machNumber, changedValue) {
        this.groundSpeed = groundSpeed;
        this.machNumber = machNumber;
        this.changedValue = changedValue;
    }
}

class VectorValues {
    constructor(heading, time) {
        this.heading = heading;
        this.time = time
    }
}


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
            this.distanceToFix >= 50 && (this.reportedMach < 5 || this.reportedMach === 0) & !isNaN(this.dataPoint)
        ) {
            return true;
        } else {
            return false;
        }
    }

    static calculateISATemperature(flightLevel) {
        if (flightLevel < 656) {
            let altitudeFeet =  flightLevel * 100;
            let altitudeMetres = altitudeFeet / 3.28084;
            return STANDARD_MSL_TEMPERATURE +  ((altitudeMetres / 1000) * 2);
        } else {
            return -65.5;
        }
    }

    // 15, 13, 11 2 deg per fl
    // http://www.aerospaceweb.org/question/atmosphere/q0126.shtml
    // https://studyflying.com/isa-temperature-deviation/
    // https://www.universalweather.com/blog/international-standard-atmosphere-how-it-affects-flight-understanding-the-basics/
    static calculateSpeedOfSound(flightLevel, knots = true) {
        let isaCentigrade = EnrouteCalculator.calculateISATemperature(flightLevel);
        let isaKelvin = isaCentigrade + 273.15;
        let speedOfSoundMetres = Math.sqrt(SPECIFIC_HEAT_RATIO * SPECIFIC_GAS_CONSTANT * isaKelvin);
        let speedOfSoundFeet = speedOfSoundMetres * 1.94384;

        if (knots) {
            return speedOfSoundFeet;
        } else {
            return speedOfSoundMetres;
        }
    }

    // ADD_DISTANCE / Apply Speed
    // Example Scenario:
    //      same distance, same time, just gap behind
    //      60 minutes to travel 500 miles
    //      60 minutes to travel 450 miles
    applySpeedDistance(mach=true) {
        let gappedDistance = this.distanceToFix - this.dataPoint;
        let initialTime = (this.distanceToFix / this.groundSpeed) * 60;  // time in mins to complete run;
        let gappedSpeed = (gappedDistance / initialTime) * 60;  // knots per minute for gapped run;
        let gappedTime = (this.distanceToFix / gappedSpeed) * 60;
        let extraTime = gappedTime - initialTime;
        let machSpeed = gappedSpeed / EnrouteCalculator.calculateSpeedOfSound(this.flightLevel);

        return new SpeedValues(gappedSpeed, machSpeed, extraTime);
    }

    // ADD_TIME / Apply Speed
    applySpeedTime(mach=true) {
        let timeToReach = (this.distanceToFix / this.groundSpeed) * 60;
        let groundSpeed = (this.distanceToFix / (timeToReach + this.dataPoint)) * 60;
        let machSpeed = groundSpeed / EnrouteCalculator.calculateSpeedOfSound(this.flightLevel);
        let separationGained = this.dataPoint * (this.groundSpeed / 60);

        return new SpeedValues(groundSpeed, machSpeed, separationGained);
    }

    // CROSS_TIME / Apply Speed
    // Note, if this speed is higher than the current speed, vectors and +Distance will be blank.
    // Otherwise, they will have a value.
    // NOTE FOR UI IMPLEMENTATION
    // This is input in minutes, but can input in time in the UI. Can allow either a UTC time or number of minutes.
    // Basically, if less than 4 digits, count as minutes.
    // If 4 digits count as a timestamp.
    applySpeedCrossTime(mach= true) {
        let groundSpeed = (this.distanceToFix / this.dataPoint) * 60;
        let machSpeed = groundSpeed / EnrouteCalculator.calculateSpeedOfSound(this.flightLevel);
        let initialTime = (this.distanceToFix / this.groundSpeed) * 60;
        let separationGained = (this.dataPoint - initialTime) * (this.groundSpeed / 60);

        return new SpeedValues(groundSpeed, machSpeed, separationGained);
    }

    prevailingWinds() {
        let trueAirSpeed = this.reportedMach * EnrouteCalculator.calculateSpeedOfSound(this.flightLevel);
        return this.groundSpeed - trueAirSpeed;
    }

    // Vector to Fix (Time);
    // Total Distance = Initial Distance + (Extra Time * (Ground Speed / 60));
    // Vector to Fix (Distance);
    // Total Distance = Initial Distance + Extra Distance;
    // Vector to Fix (Cross Time, If > Original)
    // Same as VTF (Time);
    vectorToFixAddTime() {
        let groundSpeedPerMinute = this.groundSpeed / 60;
        let extraDistance = this.dataPoint * groundSpeedPerMinute;
        return EnrouteCalculator.vectorToFix(this.distanceToFix, extraDistance, this.groundSpeed);
	}

	vectorToFixAddDistance() {
        return EnrouteCalculator.vectorToFix(this.distanceToFix, this.dataPoint, this.groundSpeed);
	}

	vectorToFixCrossTime() {
        let initialTimeToCross = (this.distanceToFix / this.groundSpeed) * 60;
        let groundSpeedPerMinute = this.groundSpeed / 60;
        let extraDistance = (this.dataPoint - initialTimeToCross) * groundSpeedPerMinute;
        return EnrouteCalculator.vectorToFix(this.distanceToFix, extraDistance, this.groundSpeed);
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
        //let roundedVector = vector - (vector % 10);

        //if ((vector % 10) > 5) {
        //    roundedVector += 10;
        //}

        return new VectorValues(vector, time);
    }

    vectorToReturnAddTime() {
        let results = [];
        let totalDistance = this.distanceToFix + (this.dataPoint * this.groundSpeed);
        [10, 20, 30, 40].forEach(function (x) {
            results.push(EnrouteCalculator.vectorToReturn(x, totalDistance));
        });

        return results;
	}

	vectorToReturnAddDistance() {
        let results = [];
        let totalDistance = this.distanceToFix + this.dataPoint;
        [10, 20, 30, 40].forEach(function (x) {
            results.push(EnrouteCalculator.vectorToReturn(x, totalDistance));
        });

        return results;
	}

	vectorToReturnCrossTime() {
        let results = [];
        let initialTimeToCross = (this.distanceToFix / this.groundSpeed) * 60;
        let groundSpeedPerMinute = this.groundSpeed / 60;
        let extraDistance = (this.dataPoint - initialTimeToCross) * groundSpeedPerMinute;
        [10, 20, 30, 40].forEach(function (x) {
            if (this.dataPoint < initialTimeToCross) {
                return [-1, -1, -1, -1];
            } else {
                EnrouteCalculator.vectorToReturn(x, extraDistance);
            }
        });

        return results;
	}

	static vectorToReturn(headingDegree, extraDistance) {

    }
}

class EnrouteUI {
     static calculate() {
        if (ENROUTE_CALCULATOR.validateValues()) {
            if (ENROUTE_CALCULATOR.currentMode === ADD_TIME) {
                return EnrouteUI.addTime();
            } else if (ENROUTE_CALCULATOR.currentMode === ADD_DIST) {
                return EnrouteUI.addDistance();
            } else if (ENROUTE_CALCULATOR.currentMode === CROSS_TIME) {
                return EnrouteUI.crossTime();
            } else {
                return -1;
            }
        }
    }

    static addTime() {
        let speedValues = ENROUTE_CALCULATOR.applySpeedTime();
        EnrouteUI.writeApplySpeed(speedValues);

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
        ENROUTE_CALCULATOR.currentMode = $("#enr_current_mode").val();
        ENROUTE_CALCULATOR.groundSpeed = parseInt($("#enr_in_groundspeed").val());
        ENROUTE_CALCULATOR.flightLevel = parseInt($("#enr_in_flight_level").val());
        ENROUTE_CALCULATOR.distanceToFix = parseInt($("#enr_in_dis_to_fix").val());
        ENROUTE_CALCULATOR.dataPoint = parseInt($("#enr_in_data_point").val());
        let reportedMach = parseFloat($("#enr_in_reported_mach").val());

        if (isNaN(reportedMach)) {
            ENROUTE_CALCULATOR.reportedMach = 0;
        } else {
            ENROUTE_CALCULATOR.reportedMach = reportedMach;
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