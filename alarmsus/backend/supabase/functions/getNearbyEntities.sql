-- Enable PostGIS (if not already done)
CREATE EXTENSION IF NOT EXISTS postgis;

-- Add geometry columns to your tables (if not already done)
ALTER TABLE incident_reports
  ADD COLUMN IF NOT EXISTS geom geography(POINT, 4326);

ALTER TABLE aeds
  ADD COLUMN IF NOT EXISTS geom geography(POINT, 4326);

-- Auto-populate geometry from lat/lng on insert
-- (You'll need to store lat/lng in incident_reports too for this to work)

-- Create RPC function to find nearby reports and aeds
create or replace function get_nearby_entities(
  user_lon double precision,
  user_lat double precision,
  search_distance_meters double precision
)
returns jsonb
language plpgsql
as $$
declare
  nearby_reports jsonb;
  nearby_aeds jsonb;
begin
  select jsonb_agg(ir) into nearby_reports
  from (
    select * from incident_reports
    where geom is not null
    and ST_DWithin(geom, ST_MakePoint(user_lon, user_lat)::geography, search_distance_meters)
    order by ST_Distance(geom, ST_MakePoint(user_lon, user_lat)::geography)
  ) as ir;

  select jsonb_agg(a) into nearby_aeds
  from (
    select * from aeds
    where geom is not null
    and ST_DWithin(geom, ST_MakePoint(user_lon, user_lat)::geography, search_distance_meters)
    order by ST_Distance(geom, ST_MakePoint(user_lon, user_lat)::geography)
  ) as a;

  return jsonb_build_object(
    'reports', coalesce(nearby_reports, '[]'::jsonb),
    'aeds', coalesce(nearby_aeds, '[]'::jsonb)
  );
end;
$$;
