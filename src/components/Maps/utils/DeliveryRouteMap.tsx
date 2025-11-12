// Utility helpers for DeliveryRouteMap. Pure functions only.

export type LngLatTuple = [number, number];

// Convert GeoJSON Point (lng, lat) to Google LatLngLiteral
export function toLatLngLiteral(point?: { type: "Point"; coordinates: LngLatTuple } | null): google.maps.LatLngLiteral | undefined {
  if (!point || point.type !== "Point" || !Array.isArray(point.coordinates)) return undefined;
  const [lng, lat] = point.coordinates;
  if (typeof lat !== "number" || typeof lng !== "number") return undefined;
  return { lat, lng };
}

// Format an ISO string into HH:mm, DD MMM (en-GB)
export function formatBreadcrumbTime(iso?: string): string {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    const time = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });
    const date = d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
    return `${time}, ${date}`;
  } catch {
    return iso;
  }
}

// Decode Google-encoded polyline (precision = 5)
export function decodePolyline(encoded?: string): google.maps.LatLngLiteral[] {
  if (!encoded) return [];
  let index = 0;
  const len = encoded.length;
  let lat = 0;
  let lng = 0;
  const coordinates: google.maps.LatLngLiteral[] = [];

  while (index < len) {
    let b = 0;
    let shift = 0;
    let result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = (result & 1) ? ~(result >> 1) : (result >> 1);
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = (result & 1) ? ~(result >> 1) : (result >> 1);
    lng += dlng;

    coordinates.push({ lat: lat / 1e5, lng: lng / 1e5 });
  }
  return coordinates;
}

// De-duplicate consecutive lat/lng within tolerance
export function dedupConsecutive(points: google.maps.LatLngLiteral[], eps = 1e-5): google.maps.LatLngLiteral[] {
  if (points.length === 0) return [];
  const out: google.maps.LatLngLiteral[] = [points[0]];
  for (let i = 1; i < points.length; i++) {
    const prev = out[out.length - 1];
    const curr = points[i];
    if (Math.abs(prev.lat - curr.lat) <= eps && Math.abs(prev.lng - curr.lng) <= eps) continue;
    out.push(curr);
  }
  return out;
}

