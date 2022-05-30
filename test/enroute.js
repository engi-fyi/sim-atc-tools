var assert = require("assert");
var enroute = require("../web/src/js/enroute.js");
var Calculations = enroute.Calculations;
var TimeAddition = enroute.TimeAddition;

describe("Calculation", function () {
    describe("toKnots()", function() {
        it("1 mile is equal to ~0.87 knots", function () {
            assert.equal(Calculations.toKnots(1), 0.868976);
        });
        it("1 knot is equal to ~1.15 knots", function () {
            assert.equal(Calculations.toKnots(1.15), 0.9993223999999999);
        });
    });

    describe("speedOfSoundMiles()", function () {
        it("at sea level the speed of sound is 761 mph", function () {
            assert.equal(Calculations.speedOfSoundMiles(0), 761.4833854267549);
        });
        it("at 10000ft the speed of sound is 734 mph", function () {
            assert.equal(Calculations.speedOfSoundMiles(10000),  734.8822219684521);
        });
        it("at 20000ft the speed of sound is 707 mph", function () {
            assert.equal(Calculations.speedOfSoundMiles(20000), 707.2812835425428);
        });
        it("at 30000ft the speed of sound is 678 mph", function () {
            assert.equal(Calculations.speedOfSoundMiles(30000), 678.5585810627439);
        });
        it("at 40000ft the speed of sound is 660 mph", function () {
            assert.equal(Calculations.speedOfSoundMiles(40000), 660.3365605056983);
        });
        it("at 50000ft the speed of sound is 660 mph", function () {
            assert.equal(Calculations.speedOfSoundMiles(50000), 660.3365605056983);
        });
        it("at 60000ft the speed of sound is 660 mph", function () {
            assert.equal(Calculations.speedOfSoundMiles(60000), 660.3365605056983);
        });
    });

    describe("speedOfSound()", function () {
        it("at sea level the speed of sound is 661 knots", function () {
            assert.equal(Calculations.speedOfSound(0), 661.7107863345998);
        });
        it("at 10000ft the speed of sound is 638 knots", function () {
            assert.equal(Calculations.speedOfSound(10000), 638.5950137172576);
        });
        it("at 20000ft the speed of sound is 614 knots", function () {
            assert.equal(Calculations.speedOfSound(20000), 614.6104606476647);
        });
        it("at 30000ft the speed of sound is 589 knots", function () {
            assert.equal(Calculations.speedOfSound(30000), 589.6511215375789);
        });
        it("at 40000ft the speed of sound is 574 knots", function () {
            assert.equal(Calculations.speedOfSound(40000), 573.8166230019997);
        });
        it("at 50000ft the speed of sound is 574 knots", function () {
            assert.equal(Calculations.speedOfSound(50000), 573.8166230019997);
        });
        it("at 60000ft the speed of sound is 574 knots", function () {
            assert.equal(Calculations.speedOfSound(60000), 573.8166230019997);
        });
    });

    describe("machNumber()", function() {
        it("at sea level, the mach number of 500 mph is 0.657", function() {
            assert.equal(Calculations.machNumber(0, Calculations.toKnots(500)), 0.6566131442510555);
        });
        it("at 10000ft, the mach number of 500 mph is 0.681", function() {
            assert.equal(Calculations.machNumber(10000, Calculations.toKnots(500)), 0.6803811346268553);
        });
        it("at 20000ft, the mach number of 500 mph is 0.708", function() {
            assert.equal(Calculations.machNumber(20000, Calculations.toKnots(500)), 0.7069323218842466);
        });
        it("at 30000ft, the mach number of 500 mph is 0.738", function() {
            assert.equal(Calculations.machNumber(30000, Calculations.toKnots(500)), 0.7368560562846479);
        });
        it("at 40000ft, the mach number of 500 mph is 0.757", function() {
            assert.equal(Calculations.machNumber(40000, Calculations.toKnots(500)), 0.7571896361714252);
        });
        it("at 50000ft, the mach number of 500 mph is 0.757", function() {
            assert.equal(Calculations.machNumber(50000, Calculations.toKnots(500)), 0.7571896361714252);
        });
    });

    describe("trueAirSpeed()", function() {
        it("at sea level, true air speed of mach 0.657 is 434 knots", function() {
            assert.equal(Calculations.trueAirSpeed(0, 0.657), 434.7439866218321);
        });
        it("at 10000ft, true air speed of mach 0.681 is 434 knots", function() {
            assert.equal(Calculations.trueAirSpeed(10000, 0.681), 434.8832043414525);
        });
        it("at 20000ft, true air speed of mach 0.708 is 435 knots", function() {
            assert.equal(Calculations.trueAirSpeed(20000, 0.708), 435.14420613854656);
        });
        it("at 30000ft, true air speed of mach 0.738 is 435 knots", function() {
            assert.equal(Calculations.trueAirSpeed(30000, 0.738), 435.1625276947332);
        });
        it("at 40000ft, true air speed of mach 0.757 is 435 knots", function() {
            assert.equal(Calculations.trueAirSpeed(40000, 0.757), 434.37918361251377);
        });
        it("at 50000ft, true air speed of mach 0.757 is 435 knots", function() {
            assert.equal(Calculations.trueAirSpeed(50000, 0.757), 434.37918361251377);
        });
    });

    describe("headwindComponent()", function() {
        it("if an aircraft has a ground speed of 510 and a true air speed of 426 it has a tailwind of 84 knots", function() {
            assert.equal(Calculations.headwindComponent(510, 426), -84);
        });
        it("if an aircraft has a ground speed of 440 and a true air speed of 450 it has a headwind of 10 knots", function() {
            assert.equal(Calculations.headwindComponent(440, 450), 10);
        });
        it("if an aircraft has a ground speed of 380 and a true air speed of 436 it has a headwind of 10 knots", function() {
            assert.equal(Calculations.headwindComponent(380, 436), 56);
        });
    });
});

describe("TimeAddition", function() {
    describe("applySpeed()", function() {
        it("An aircraft travelling at 500 knots at 38000ft with 400 miles to run travelling at mach 0.78 with 5 minute delay required.", function() {
            let ta = new TimeAddition(500, 38000, 400, 5, 0.78);
            let results = ta.applySpeed();
            assert.equal(results.groundSpeed, 453);
            assert.equal(results.machNumber, 0.70);
            assert.equal(results.changedValue, 38);
        });
        it("An aircraft travelling at 500 knots at 38000ft with 500 miles to run travelling at mach 0.8 with 10 minute delay required.", function() {
            let ta = new TimeAddition(500, 38000, 500, 10, 0.80);
            let results = ta.applySpeed();
            assert.equal(results.groundSpeed, 429);
            assert.equal(results.machNumber, 0.68);
            assert.equal(results.changedValue, 71);
        });
        it("An aircraft travelling at 420 knots at 20000ft with 50 miles to run travelling at mach 0.68 with 1 minute delay required.", function() {
            let ta = new TimeAddition(420, 20000, 50, 1, 0.68);
            let results = ta.applySpeed();
            assert.equal(results.groundSpeed, 368);
            assert.equal(results.machNumber, 0.60);
            assert.equal(results.changedValue, 6);
        });
    });

    describe("vectorThenDirectFix()", function() {
        it("An aircraft travelling at 500 knots at 38000ft with 400 miles to run travelling at mach 0.78 with 5 minute delay required.", function() {
            let ta = new TimeAddition(500, 38000, 400, 5, 0.78);
            let results = ta.vectorThenDirectFix();
            assert.equal(results.heading, 25);
            assert.equal(results.time, 26.50);
        });
        it("An aircraft travelling at 500 knots at 38000ft with 500 miles to run travelling at mach 0.8 with 10 minute delay required.", function() {
            let ta = new TimeAddition(500, 38000, 500, 10, 0.80);
            let results = ta.vectorThenDirectFix();
            assert.equal(results.heading, 31);
            assert.equal(results.time, 35.00);
        });
        it("An aircraft travelling at 420 knots at 20000ft with 50 miles to run travelling at mach 0.68 with 1 minute delay required.", function() {
            let ta = new TimeAddition(420, 20000, 50, 1, 0.68);
            let results = ta.vectorThenDirectFix();
            assert.equal(results.heading, 29);
            assert.equal(results.time, 4.07);
        });
    });
});