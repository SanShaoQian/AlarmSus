export async function searchAddress(query: string) {
  const res = await fetch(
    `https://www.onemap.gov.sg/api/common/elastic/search?searchVal=${encodeURIComponent(
      query
    )}&returnGeom=Y&getAddrDetails=Y&pageNum=1`
  );
  const json = await res.json();
  return json.results || [];
}

export async function fetchAEDs() {
  const res = await fetch('https://www.onemap.gov.sg/api/public/health/aed');
  const json = await res.json();
  return json.value || []; 
}

