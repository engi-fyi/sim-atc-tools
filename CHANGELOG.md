# Change Log

### v0.3.7-beta.1 (February 14, 2021)

 - (Web) Updated apply speed to show separation gained (+Separation).

### v0.3.6-beta.1 (February 14, 2021)

 - (Web) Added backend functions for degree/minute calculations.
 - (Web) Changed cookies to secure (same-site settings).
 - (Web) Made reported mach number not required in Enroute Calculator.

### v0.3.5-beta.1 (February 13, 2021)

 - (Web) Info Pane and Tools now remember their state between sessions.

### v0.3.4-beta.1 (February 13, 2021)

 - (Web) Apply Speed now working with Enroute Calculator.
 - (Code) Refactored Enroute JavaScript into classes for UI
   and Calculator (i.e. View, Controller/Model);
   
### v0.3.3-beta.1 (February 12, 2021)

 - (Code) Added `CHANGELOG.md` and `VERSION`.
 - (Web) Updated footer to support `VERSION`.
 - (Web) Implementation and calculation for speeds (not yet working 
   correctly, outputs are incorrect).
 - (Web) Inputs/outputs clear/update correctly when mode is changed.
 - (Web) Styling corrections to for Enroute Calculator.

### v0.3.2-alpha.2 (February 11, 2021)

 - (Code) Fixed bugs with prefixes not working.
 - (Web) Initial implementation of calculations (not yet working 
   correctly, outputs are incorrect).

### v0.3.1-alpha.2 (February 11, 2021)

 - (Web) Added all labels, IDs, and classes to inputs/outputs.
 - (Code) Updated jinja to jinja2 due to deployment issues.
 - (Code) Updated build process to use jinja for everything.
 - (Code) Fixed bugs with prefixes not working.

### v0.3.0-alpha.1 (February 10, 2021)

Initial Enroute Calculator implementation:
 - (Web) Added styling for Enroute Calculator.
 - (Code) Added jinja to allow for better templating.

### v0.2.4 (February 10, 2021)

 - (Data) Custom Virtual Airline additions.

### v0.2.3 (February 10, 2021)

 - (Web) Fixed bug causing `vatSys` mode to not be responsive.

### v0.2.2 (February 10, 2021)

 - (Web) Added Menu to allow enable/disable each tools individually.
 - (Web) Made design responsive.
 - (Code) Streamlined imports and structure.

### v0.2.1 (February 9, 2021)

 - (Web) Re-styled buttons to be more consistent with oneSky.
 - (Data) Added many custom aircraft for popular models.

### v0.2.0 (February 8, 2021)

 - (Web) Added Wake Turbulence Timer feature.
 - (Web) Added `vatSys` mode which removes sidebar/footer 
   when `?vatsys=true` is appended to the URL.
 - (Web) UI Bugs and added content encoding details to HTML.  


### v0.1.1 (February 7, 2021)

Infrastructure maintenance release.
 - (Infrastructure) Updated deployment method away from Cloudflare Workers.

### v0.1.0 (February 6, 2021)

This is the initial release of `sim-atc-tools`. Basic functionality
includes the following features:
 - (Data) Data Generators for:
    - Airline/Callsign ICAO Codes.
    - Aircraft ICAO Codes.
    - Airport ICAO Codes.
 - (Data) Functionality to allow custom Airlines and Aircraft.
 - (Web) Added initial interface that allows lookups.
 - (Web) Initial styling includes base layout, sidebar and footer.