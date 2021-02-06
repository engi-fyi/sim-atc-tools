# sim-atc.com

This is the repository for the website located at [sim-atc.com](https://sim-atc.com).

The following tools have been made to make communication between ATC and Pilots more professional.
We've all had the moment where we don't know a callsign and say "United Alpha Lima 654" or we don't
recognise an airport and clear a pilot to their "destination". There may be a few odd ones out there
still, but hopefully this makes your life a bit easier!

The data for this application is sourced from ICAO information from Wikipedia.

## Dependencies

```
pipenv install
```

## Instructions

__Generate the Datasets__
```
pipenv run python generator.py
```

__Test the Website Locally__
```
pipenv run python build.py local
```

__Build the Website__
```
pipenv run python build.py build
```

## Licensing

All files you generate and are stored under `data/` must be licensed using the 
[Attribution-ShareAlike 3.0 Unported (CC BY-SA 3.0)](https://creativecommons.org/licenses/by-sa/3.0/) 
as license these are generated from wikipedia.

The favicon files (under `web/assets` are NOT licensed for redistribution and if you copy the repository, they must be deleted.

All other files are licensed under the GNU General Public License v3.0.
