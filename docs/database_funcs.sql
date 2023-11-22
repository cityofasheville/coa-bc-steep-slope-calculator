





---------------------------------- NEW 2
CREATE OR REPLACE FUNCTION public.slopetool_getsloperecfrompins(pins character varying[])
 RETURNS TABLE(id integer, jurisdiction character varying, "maxElevation" integer, acres numeric, "percentSlope" numeric)
 LANGUAGE plpgsql
AS $function$
    declare geom geometry;
    DECLARE ifExists BIGINT;
begin												
	SELECT st_union(p.shape) into geom
	FROM bc_property p
	WHERE  p.pinnum = any(pins);
--
	if geom is null then
		return query(
        SELECT 0::int, null::varchar, null::int4, null::numeric, null::numeric);
	else
	    SELECT count(*) INTO ifExists FROM sloperesults s where ST_Equals(s.rungeom,geom) ;
	    IF ifExists < 1 then
	        -- insert new record
	        INSERT INTO "sloperesults"
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
	        FROM sloperesults s
	        WHERE ST_Equals(s.rungeom,geom) 
	    );
	end if;
END
$function$
;

-----------------------------------
CREATE OR REPLACE FUNCTION public.slopetool_getareag(geom geometry)
 RETURNS numeric
 LANGUAGE plpgsql
AS $function$
DECLARE theArea NUMERIC;
BEGIN
  SELECT (st_area( st_union(geom) )/43560)::numeric INTO theArea;
  --SELECT round( (st_area( st_union(geom) )/43560)::numeric,2) INTO theArea;
  RETURN theArea;
END;
$function$
;
-----------------------------------
CREATE OR REPLACE FUNCTION public.slopetool_getjurisdictiong(geom geometry)
 RETURNS text
 LANGUAGE plpgsql
AS $function$

DECLARE theJuris text;

BEGIN

SELECT b.description  as Jurisdiction
FROM "bc_incorporated_areas" b
WHERE (st_relate( $1,b.shape,'T*T******')  or st_relate( $1,b.shape,'T*F**F***') )
  UNION
SELECT b.cityname as Jurisdiction into theJuris
FROM "coa_active_jurisdictions" b
WHERE (st_relate( $1,b.shape,'T*T******')  or st_relate( $1,b.shape,'T*F**F***') )
Group by b.cityname;

--IF theJuris is NULL THEN RETURN 'Buncombe County'; End IF;
IF (theJuris <> '') IS NOT true THEN RETURN 'Buncombe County'; End IF; -- if null or empty string

RETURN theJuris;
END;
$function$
;
 ----------------------------------
 select * from public.slopetool_getsloperecfrompins(array['964903212400000'])
 
 ----------------------------------


 DROP TABLE public.sloperesults;

CREATE TABLE public.sloperesults (
	jurisdiction varchar(150) NULL,
	maxcontour int4 NULL,
	acres numeric(15,5) NULL,
	avgslope numeric(10,5) NULL,
	length numeric(20,5) NULL,
	rundate timestamp NULL,
	insertid SERIAL,
	runtime text NULL,
	rungeom geometry(MULTIPOLYGON, 2264) NULL
);

-- Preload table
drop function myFunc;
CREATE FUNCTION myFunc() RETURNS void AS $$ 
declare geom geometry;
declare areag numeric;
declare shapes cursor for 
	SELECT shape --,pin
	FROM bc_property
	where left(pin,1) = '9'
	;
begin
open shapes;
loop
	fetch shapes into geom;
	exit when not found;
	areag := slopetool_getareaG(geom);
	if areag > 0 then
	    INSERT INTO "sloperesults"
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
	  end if;
end loop;
end;
$$ LANGUAGE plpgsql;

select myFunc()
-----------------------------

select slopetool_getareaG(shape), *
from bc_property bp 
where slopetool_getareaG(shape) = 0



select count(*) FROM bc_property p;
select count(*) FROM sloperesults s2 ;
select count(*) FROM lidar_contours s2 ;



     





