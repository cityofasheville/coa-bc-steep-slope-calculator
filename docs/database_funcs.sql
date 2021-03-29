
select * from sloperesults s 
order by rundate desc
limit 100


  SELECT slopetool_checkGeomg( (SELECT st_union(p.shape) as GEOM
  FROM bc_property p
  WHERE  p.pinnum = any ('{962802744900000,964950354000000}') ) )as ID;

----------------------------------  
select st_union(p.shape) as GEOM from bc_property p
WHERE  p.pinnum = any ('{962802744900000,964950354000000}')
limit 100

SELECT CASE WHEN (max(s."insertid")+1) is null THEN 1 ELSE (max(s."insertid")+1) END  from "sloperesults" s;
----------------------------------
 -- 'slopetool_checkgeomg'
 CREATE OR REPLACE FUNCTION public.slopetool_checkgeomg(geom geometry)
 RETURNS bigint
 LANGUAGE plpgsql
AS $function$
DECLARE theInsertID BIGINT;
DECLARE ifExists BIGINT;

BEGIN
  SELECT CASE WHEN (max(s."insertid")+1) is null THEN 1 ELSE (max(s."insertid")+1) END into theInsertID from "sloperesults" s;
  SELECT count(*) INTO ifExists FROM "sloperesults" WHERE ST_Equals(sloperesults.rungeom,geom) ;

  IF ifExists < 1 THEN RETURN 0; End IF;

  INSERT INTO sloperesults
    (jurisdiction, maxcontour, acres, avgslope, length, rundate, insertid, rungeom)
     (SELECT sloperesults.jurisdiction,
            sloperesults.maxcontour,
            sloperesults.acres,
            sloperesults.avgslope,
            sloperesults.length,
            LOCALTIMESTAMP,
            theInsertID,
            sloperesults.rungeom
     FROM sloperesults
     WHERE ST_Equals(sloperesults.rungeom,geom) limit 1);


  RETURN theInsertID;

END;
$function$
;

----------------------------------
-- slopetool_getslopefromgeom
CREATE OR REPLACE FUNCTION public.slopetool_getslopefromgeom(geom geometry)
 RETURNS bigint
 LANGUAGE plpgsql
AS $function$
DECLARE theJuris TEXT;
DECLARE theAvgSlope NUMERIC;
DECLARE theArea NUMERIC;
DECLARE theInsertID BIGINT;
DECLARE theStartTime timestamp without time zone;
DECLARE theEndTime timestamp without time zone;
DECLARE theIntersectGEOM geometry;
DECLARE theMaxC integer;
BEGIN
  SELECT LOCALTIMESTAMP into theStartTime;
  SELECT slopetool_getjurisdictionG(geom) into theJuris;
  SELECT slopetool_getareaG(geom) into theArea;
  SELECT CASE WHEN (max(s."insertid")+1) is null THEN 1 ELSE (max(s."insertid")+1) END into theInsertID from "sloperesults" s;
  INSERT INTO "sloperesults"
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
  select LOCALTIMESTAMP into theEndTime;
  RETURN theInsertID;
END;
$function$
;
----------------------------------
-- slopetool_getsloperecfromgeom
CREATE OR REPLACE FUNCTION public.slopetool_getsloperecfromgeom(pins varchar[])
	 RETURNS table (
	 	id int8,
	 	jurisdiction varchar(150),
	 	"maxElevation" int4,
	 	acres numeric(15,5),
	 	"percentSlope" numeric(10,5)
	 )
	 LANGUAGE plpgsql
	 AS $function$
	 declare a_rec record;
begin
													return query 
	SELECT st_union(p.shape) as GEOM
	FROM bc_property p
	WHERE  p.pinnum in (pins);

	--SELECT count(*) INTO a_rec FROM "sloperesults" WHERE ST_Equals(sloperesults.rungeom,geom) ;

  --IF ifExists < 1 THEN RETURN 0; End IF;	 
	 
	 
END;
$function$
;
 
 
 ----
  ----------------------------------
drop FUNCTION public.testfun();

CREATE OR REPLACE FUNCTION public.testfun()
returns int
language plpgsql
as $$
declare
	pins varchar[] := array['962802744900000'];
begin
	--return query
	return(select objectid from bc_property where pinnum = any(pins));
end $$; 
  ----------------------------------
CREATE OR REPLACE FUNCTION public.testfun()
	 RETURNS table (
	 	res int
	 )
language plpgsql
as $$
declare
	pins varchar[] := array['962802744900000'];
begin
	return query(select objectid from bc_property where pinnum = any(pins));
end $$; 
  ----------------------------------
CREATE OR REPLACE FUNCTION public.testfun(pins varchar[])
	 RETURNS table (
	 	res int
	 )
language plpgsql
as $$
begin
	return query(select objectid from bc_property where pinnum = any(pins));
end $$;  
   ----------------------------------
 select public.testfun(array['962802744900000']);
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
