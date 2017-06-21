--DROP FUNCTION daily_arrivals(int);
--DROP TYPE dailyArrivalType;
CREATE type dailyArrivalType as (the_geom_webmercator geometry, dateArrival timestamp, count int);
CREATE OR REPLACE FUNCTION daily_arrivals(steps int) RETURNS setof dailyArrivalType  AS $$
 	DECLARE
 	   fraction float4 := 0;
        maxValue float4;
        fractionStep float4 := 1.0/steps;
        r record;
        row record;
        result dailyArrivalType;
        BEGIN
         maxValue := (SELECT max(count) FROM map2_daily_arrivals).max;
 		FOR r IN SELECT count, date_yyyy_mm_dd, ST_Transform (ST_GeomFromText('LINESTRING(' || long_origin || ' ' || lat_origin || ',' || long_destination || ' ' || lat_destination || ')',4326),3857) as geom FROM map2_daily_arrivals WHERE long_origin is not null and lat_origin is not null and long_destination is not null and lat_destination is not null and date_yyyy_mm_dd is not null order by date_yyyy_mm_dd LOOP
 	      fraction := 0;
           FOR row IN SELECT generate_series(r.date_yyyy_mm_dd::date,r.date_yyyy_mm_dd::date + interval '23:59 hours', (24.0/steps ||' hours')::interval)
              LOOP
               result.the_geom_webmercator := ST_Line_Interpolate_Point(r.geom,fraction);
               result.count := (r.count * 255.0)/maxValue;
               IF r.count!=0 AND result.count=0 THEN
                result.count = 1;
               END IF;
               result.dateArrival := row;
               RETURN next result;
               fraction := fraction + fractionStep;
           END LOOP;
         END LOOP;
        END;
 $$ LANGUAGE plpgsql;
