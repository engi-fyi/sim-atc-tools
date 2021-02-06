class ModuleManager {
    constructor(my_modules) {
        this.modules = my_modules;
        console.log("Loaded Modules.")
        this.data = {}

        this.modules.forEach(m => this.data[m] = null)
        console.log("Initialised data.")
    }

    loadData() {
        this.modules.forEach(m => this.downloadData(m));
    }

    async downloadData(module_name) {
        console.log("Downloaded data for '" + module_name + "'.")
        this.data[module_name] = await $.ajax({
            url: "data/" + module_name + ".json",
            type: "GET"
        });
    }

    clearDetails() {
        this.modules.forEach(m => ModuleManager.clearDetail(m));
    }

    static clearDetail(module_name) {
        $("#" + module_name + "-details").html("&nbsp;");
        console.log("Cleared '" + module_name + "-details'.");
    }

    clearInputs() {
        this.modules.forEach(m => ModuleManager.clearInput(m));
    }

    static clearInput(module_name) {
        $("#" + module_name + "-input").val("");
        console.log("Cleared '" + module_name + "-input'.");
    }

    getResults(module_name, keys) {
        var resultCount = 0;
        var output = "";

        for (var i = 0; i < keys.length; i++) {
            var results = this.data[module_name][keys[i]];

            for (var j = 0; j < results.length; j++) {
                resultCount++;
                var textFunction = window[module_name + "Text"];
                output += textFunction(results[j]);
            }
        }

        output = "Found " + resultCount + " result(s)." + output;
        return output;
    }

    initializeWindows() {
        this.modules.forEach(m => this.initializeWindow(m));
    }

    initializeWindow(module_name) {
        var me = this;
        $("#" + module_name + "-input").on("input", function() {
            var key = $("#" + module_name + "-input").val().toUpperCase();

            if (key == "") {
                ModuleManager.clearDetail(module_name)
            } else if (key in me.data[module_name]) {
                $("#" + module_name + "-details").html(me.getResults(module_name, [key]));
            } else {
                $("#" + module_name + "-details").html("No results found.")
            }
        });
    }
}

$(document).ready(function() {
    var modules = ["airline", "airport", "aircraft"];
    var mm = new ModuleManager(modules);
    mm.loadData();
    mm.clearDetails();
    mm.clearInputs();
    mm.initializeWindows();
});

function airlineText(airline) {
    output = "<br /><br />ICAO: " + airline.icao_code;
    output += "<br />IATA: " + airline.iata_code;
    output += "<br />Name: " + airline.airline_name;
    output += "<br />Callsign: " + airline.call_sign;
    output += "<br />Country: " + airline.country;
    return output
}

function airportText(airport) {
    output = "<br /><br />ICAO: " + airport.icao_code;
    output += "<br />IATA: " + airport.iata_code;
    output += "<br />Name: " + airport.name;
    output += "<br />Location: " + airport.location;
    return output
}

function aircraftText(aircraft) {
    output = "<br /><br />ICAO: " + aircraft.icao_code;
    output += "<br />IATA: " + aircraft.iata_code;
    output += "<br />Name: " + aircraft.model_name;
    return output
}