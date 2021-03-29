-- slopetool_getsloperecfrompins
drop FUNCTION public.slopetool_getsloperecfrompins;
CREATE OR REPLACE FUNCTION public.slopetool_getsloperecfrompins(pins varchar[])
-- checks to see if slope already calculated
-- and adds to table if not. Returns slope record.
-- returns id of 0 if property not found.
	 RETURNS table (
	 	id int,
	 	jurisdiction varchar(150),
	 	"maxElevation" int4,
	 	acres numeric(15,5),
	 	"percentSlope" numeric(10,5)
	 )
    LANGUAGE plpgsql
    AS $function$
    declare geom geometry;
    DECLARE ifExists BIGINT;
begin												
	SELECT st_union(p.shape) into geom
	FROM bc_property p
	WHERE  p.pinnum = any(pins);
--
	if geom is null then -- record not found in County property table
		return query(
        SELECT 0::int, null::varchar, null::int4, null::numeric, null::numeric);
	else
	    SELECT count(*) INTO ifExists FROM sloperesults2 s where ST_Equals(s.rungeom,geom) ;
	    IF ifExists < 1 then
	        -- insert new record
	        INSERT INTO "sloperesults2"
	        (jurisdiction, maxcontour, acres, avgslope, length, rundate, rungeom)
	        (SELECT
	        slopetool_getjurisdictionG(geom),
	        max(b."contour"),
	        slopetool_getareaG(geom),
	        round((round(sum(ST_Length(st_intersection(b.shape, geom)))::numeric,2)/(slopetool_getareaG(geom))*0.0115)::numeric,2),
	        sum(st_length(st_intersection(b.shape, geom))),
	        LOCALTIMESTAMP,
	        st_multi(geom)
	        FROM "lidar_contours" b
	        WHERE st_intersects(b.shape,geom));
	    End IF;
	-- 
		return query(
	        SELECT s.insertid as id ,s.jurisdiction,
	        s.maxcontour as "maxElevation",
	        round(s.acres,2) as acres,
	        round(s.avgslope,2) as "percentSlope"
	        FROM sloperesults2 s
	        WHERE ST_Equals(s.rungeom,geom) 
	    );
	end if;
END
$function$
;