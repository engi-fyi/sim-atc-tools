var ADD_TIME = 0;
var ADD_DIST=1;
var CROSS_TIME=2;

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
                return add_time();
            } else if (this.currentMode == ADD_DIST) {
                return add_distance();
            } else if (this.currentMode == CROSS_TIME) {
                return cross_time();
            } else {
                return -1;
            }
        }
    }

    add_time() {

    }

    add_distance() {

    }

    cross_time() {

    }
}