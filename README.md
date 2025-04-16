### A NodeJS Express App that exposes a REST API for Accela and web tool at http://www.mapwnc.org

Buncombe County Property and City Jurisdiction GIS tables are copied nightly using Bedrock to a Postgres database.

Elevation contours generated from Lidar data for Buncombe County are also stored on the Postgres database.

The application calculates the "natural average slope" for a parcel or parcels of land (see the [Section 7-12-4 of the City of Asheville's Unified Development Ordinance](https://codelibrary.amlegal.com/codes/ashevillenc/latest/asheville_nc/0-0-0-8028) )

The slope calculation is costly and cannot be pre-calculated for the entire county (I think it takes like 24hrs to run once).
So a sloperesults table is maintained on the Postgres database which contains the calculated slope, the parcel (or parcels) geometry, and some attribute data.
At runtime, the application checks if a matching geometry exist in the sloperesults table for the input parcel or parcels geometry (this is fast with PostGIS); if a matching geometry exist then the existing calculated slope and attribute data is returned, if not, the slope is calculated and returned from the API, and a new record is added to the sloperesults table.


Runs as a Lambda function that wraps an Express App using serverless-express.

### Usage
First run ```npm install```

```package.json``` has these scripts:
- Test Locally: 
  - ```npm start``` (or for a Python program: ```npm run startpy```)
- Deploy: 
  - ```npm run deploy```
- Destroy: (removes all objects from AWS)
  - ```npm run destroy```
- Clean: 
  - ```npm run clean``` (removes local temp files)

The Deploy/Destroy commands use the name of the active GitHub branch when creating AWS resources.
For example, if the active GitHub branch is "feature" and the name of the resource is "template", the resource is named "template_feature". For API gateway domains, it's "feature-template.ashevillenc.gov". Production (or main) branches do not get a prefix/suffix.
    