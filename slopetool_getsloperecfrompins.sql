-- slopetool_getsloperecfrompins
drop FUNCTION public.slopetool_getsloperecfrompins;
CREATE OR REPLACE FUNCTION public.slopetool_getsloperecfrompins(pins varchar[])
-- checks to see if slope already calculated
-- and adds to table if not. Returns slope record.
-- returns id of 0 if property not found.
	 RETURNS table (
	 	id int8,
	 	jurisdiction varchar(150),
	 	"maxElevation" int4,
	 	acres numeric(15,5),
	 	"percentSlope" numeric(10,5)
	 )
    LANGUAGE plpgsql
    AS $function$
    declare geom geometry;
    DECLARE ifExists BIGINT;
	DECLARE theJuris TEXT;
	DECLARE theArea NUMERIC;
	DECLARE theInsertID BIGINT;
begin												
	SELECT st_union(p.shape) into geom
	FROM bc_property p
	WHERE  p.pinnum = any(pins);
    --
	if geom is null then
		return query(
        SELECT 0::int8, null::varchar, null::int4, null::numeric, null::numeric);
	else
	    SELECT count(*) INTO ifExists FROM sloperesults2 s where ST_Equals(s.rungeom,geom) ;
	    IF ifExists < 1 then
	        -- insert new record
	        SELECT slopetool_getjurisdictionG(geom) into theJuris;
	        SELECT slopetool_getareaG(geom) into theArea;
	        SELECT CASE WHEN (max(s."insertid")+1) is null THEN 1 ELSE (max(s."insertid")+1) END into theInsertID from "sloperesults2" s;
	        INSERT INTO "sloperesults2"
	        (jurisdiction, maxcontour, acres, avgslope, length, rundate, insertid, rungeom)
	        (SELECT
	        theJuris,
	        max(b."contour"),
	        theArea,
	        round((round(sum(ST_Length(st_intersection(b.shape, geom)))::numeric,2)/(theArea)*0.0115)::numeric,2),
	        sum(st_length(st_intersection(b.shape, geom))),
	        LOCALTIMESTAMP,
	        theInsertID,
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

 ----------------------------------
 select public.slopetool_getsloperecfrompins(array['964921781200000']) as moo