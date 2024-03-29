### A NodeJS Express App that exposes a REST API for Accela and web tool at http://www.mapwnc.org

This is currently hosted on an EC2 instance.

Buncombe County Property and City Jurisdiction GIS tables are copied nightly using Bedrock to a Postgres database.

Elevation contours generated from Lidar data for Buncombe County are also stored on the Postgres database.

The application calculates the "natural average slope" for a parcel or parcels of land (see the [Section 7-12-4 of the City of Asheville's Unified Development Ordinance](https://www.municode.com/library/nc/asheville/codes/code_of_ordinances?nodeId=PTIICOOR_CH7DE_ARTXIIENPRST_S7-12-4STSLRIDE] ) )

The slope calculation is costly and cannot be pre-calculated for the entire county (I think it takes like 24hrs to run once).
So a sloperesults table is maintained on the Postgres database which contains the calculated slope, the parcel (or parcels) geometry, and some attribute data.
At runtime, the application checks if a matching geometry exist in the sloperesults table for the input parcel or parcels geometry (this is fast with PostGIS); if a matching geometry exist then the existing calculated slope and attribute data is returned, if not, the slope is calculated and returned from the API, and a new record is added to the sloperesults table.


To run local test:
    
    node bin/www

    