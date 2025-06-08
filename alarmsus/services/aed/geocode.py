import csv
import requests
import time

ONEMAP_TOKEN = "Bearer ****************"

ONEMAP_URL = "https://www.onemap.gov.sg/api/common/elastic/search"

HEADERS = {
    "Authorization": ONEMAP_TOKEN
}

def geocode(postal_code, retries=3):
    params = {
        "searchVal": postal_code,
        "returnGeom": "Y",
        "getAddrDetails": "Y",
        "pageNum": 1
    }

    for attempt in range(retries):
        try:
            response = requests.get(ONEMAP_URL, headers=HEADERS, params=params, timeout=5)
            response.raise_for_status()
            data = response.json()
            if data.get("results"):
                lat = data["results"][0]["LATITUDE"]
                lng = data["results"][0]["LONGITUDE"]
                return lat, lng
            break
        except requests.RequestException as e:
            print(f"[Attempt {attempt + 1}] Failed for {postal_code}: {e}")
            time.sleep(1)
    return None, None

# === Main process ===

input_file = "AEDLocations.csv"          # Replace with your file
output_file = "aed_geocoded.csv"

with open(input_file, "r") as infile, open(output_file, "w", newline='') as outfile:
    reader = csv.DictReader(infile)
    fieldnames = ["postal_code", "building_name", "location_description", "latitude", "longitude"]
    writer = csv.DictWriter(outfile, fieldnames=fieldnames)
    writer.writeheader()

    for row in reader:
        postal_code = row["Postal_Code"]
        building_name = row["Building_Name"]
        location_description = row["Location_Description"]
        lat, lng = geocode(postal_code)
        if lat and lng:
            writer.writerow({
                "postal_code": postal_code,
                "building_name": building_name,
                "location_description": location_description,
                "latitude": lat,
                "longitude": lng
            })
            print(f"✓ {postal_code}: {lat}, {lng}")
        else:
            print(f"✗ {postal_code}: Not found")
