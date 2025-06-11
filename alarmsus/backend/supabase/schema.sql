create type emergency_type_enum as enum ('police', 'ambulance', 'fire', 'others');

create table if not exists incident_reports (
  id serial primary key,
  caption text not null,
  emergency_type emergency_type_enum,
  is_in_danger boolean not null default false,
  location text,
  report_anonymously boolean not null default false,
  image_url text,
  user_id varchar(255),
  created_at timestamp with time zone default current_timestamp,
  updated_at timestamp with time zone default current_timestamp,
  isVerified boolean not null default false,
  isResolved boolean not null default false,
  longitude DOUBLE PRECISION,
  latitude DOUBLE PRECISION,
  geom geography(POINT, 4326),
  alert_count integer default 0,
  comment_count integer default 0,
  share_count integer default 0
);

-- Enable PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create AED table
CREATE TABLE aeds (
  id SERIAL PRIMARY KEY,
  postal_code numeric,
  building_name text,
  location_description text,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  geom geography(POINT, 4326)
);

-- Create comments table
CREATE TABLE comments (
  id SERIAL PRIMARY KEY,
  incident_report_id INTEGER REFERENCES incident_reports(id),
  user_id varchar(255),
  username text not null,
  text text not null,
  thumbs_up integer default 0,
  thumbs_down integer default 0,
  created_at timestamp with time zone default current_timestamp
);

-- Create replies table
CREATE TABLE replies (
  id SERIAL PRIMARY KEY,
  comment_id INTEGER REFERENCES comments(id),
  user_id varchar(255),
  username text not null,
  text text not null,
  created_at timestamp with time zone default current_timestamp
);

-- Create user interactions table
CREATE TABLE user_interactions (
  id SERIAL PRIMARY KEY,
  user_id varchar(255),
  incident_report_id INTEGER REFERENCES incident_reports(id),
  comment_id INTEGER REFERENCES comments(id),
  interaction_type text CHECK (interaction_type IN ('alert', 'like', 'dislike', 'share')),
  created_at timestamp with time zone default current_timestamp,
  UNIQUE(user_id, incident_report_id, comment_id, interaction_type)
);

-- Function to get nearby entities
CREATE OR REPLACE FUNCTION get_nearby_entities(
  user_lon DOUBLE PRECISION,
  user_lat DOUBLE PRECISION,
  search_distance_meters DOUBLE PRECISION
)
RETURNS TABLE (
  id INTEGER,
  title TEXT,
  type TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  distance DOUBLE PRECISION
) AS $$
BEGIN
  RETURN QUERY
  (
    SELECT 
      r.id,
      r.title,
      'report'::TEXT as type,
      r.latitude,
      r.longitude,
      ST_Distance(r.geom, ST_MakePoint(user_lon, user_lat)::geography) as distance
    FROM incident_reports r
    WHERE ST_DWithin(r.geom, ST_MakePoint(user_lon, user_lat)::geography, search_distance_meters)
  )
  UNION ALL
  (
    SELECT 
      a.id,
      a.building_name as title,
      'aed'::TEXT as type,
      a.latitude,
      a.longitude,
      ST_Distance(a.geom, ST_MakePoint(user_lon, user_lat)::geography) as distance
    FROM aeds a
    WHERE ST_DWithin(a.geom, ST_MakePoint(user_lon, user_lat)::geography, search_distance_meters)
  )
  ORDER BY distance;
END;
$$ LANGUAGE plpgsql;
