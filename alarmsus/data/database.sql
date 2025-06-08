create table aed (
    id serial primary key,
    postal_code varchar(255) not null,
    building_name varchar(255) not null,
    location_description varchar(255) not null,
    latitude float not null,
    longitude float not null
);

-- Function to calculate distance between two points using Haversine formula
CREATE OR REPLACE FUNCTION calculate_distance(lat1 float, lon1 float, lat2 float, lon2 float)
RETURNS float AS $$
DECLARE
    R float := 6371; -- Earth's radius in kilometers
    dlat float;
    dlon float;
    a float;
    c float;
BEGIN
    dlat := radians(lat2 - lat1);
    dlon := radians(lon2 - lon1);
    a := sin(dlat/2) * sin(dlat/2) +
         cos(radians(lat1)) * cos(radians(lat2)) *
         sin(dlon/2) * sin(dlon/2);
    c := 2 * asin(sqrt(a));
    RETURN R * c;
END;
$$ LANGUAGE plpgsql;

-- Function to fetch nearby AEDs within a given radius
CREATE OR REPLACE FUNCTION fetch_nearby_aeds(search_lat float, search_lon float, radius_km float)
RETURNS TABLE (
    id integer,
    postal_code varchar(255),
    building_name varchar(255),
    location_description varchar(255),
    latitude float,
    longitude float,
    distance_km float
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id,
        a.postal_code,
        a.building_name,
        a.location_description,
        a.latitude,
        a.longitude,
        calculate_distance(search_lat, search_lon, a.latitude, a.longitude) as distance_km
    FROM aed a
    WHERE calculate_distance(search_lat, search_lon, a.latitude, a.longitude) <= radius_km
    ORDER BY distance_km ASC;
END;
$$ LANGUAGE plpgsql;