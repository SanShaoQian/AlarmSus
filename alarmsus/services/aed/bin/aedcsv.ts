import { parse } from 'papaparse';
import { getDistance } from 'geolib';
import { geocodePostalCode } from '../../onemap';

interface AEDEntry {
  postalCode: string;
  buildingName: string;
  locationDescription: string;
  latitude?: number;
  longitude?: number;
}

interface Coordinates {
  latitude: number;
  longitude: number;
}

export async function fetchNearbyAEDs(latitude: number, longitude: number, radiusInMeters: number): Promise<AEDEntry[]> {
  const csvUrl = 'https://data.gov.sg/datasets/d_e8934d28896a1eceecfe86f42dd3c077/view';

  try {
    const response = await fetch(csvUrl);
    const csvText = await response.text();

    const parsed = parse(csvText, {
      header: true,
      skipEmptyLines: true,
    });

    const aedEntries: AEDEntry[] = parsed.data.map((row: any) => ({
      postalCode: row['Postal Code'],
      buildingName: row['Building Name'],
      locationDescription: row['Location Description'],
    }));

    const nearbyAEDs: AEDEntry[] = [];

    for (const entry of aedEntries) {
      const coords = await geocodePostalCode(entry.postalCode);
      if (coords) {
        const distance = getDistance({ latitude, longitude }, coords);
        if (distance <= radiusInMeters) {
          nearbyAEDs.push({ ...entry, ...coords });
        }
      }
    }

    return nearbyAEDs;
  } catch (error) {
    console.error('Error fetching or processing AED data:', error);
    return [];
  }
}
