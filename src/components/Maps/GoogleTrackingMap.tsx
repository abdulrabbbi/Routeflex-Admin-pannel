import { useEffect, useMemo, useRef } from "react";
import useGoogleMaps from "../../hooks/useGoogleMaps";

type LatLng = [number, number];

interface MapProps {
  route: LatLng[];
  currentLocation: { lat: number; lng: number };
}

const GoogleTrackingMap = ({ route, currentLocation }: MapProps) => {
  const apiKey = (import.meta as any)?.env?.VITE_GOOGLE_MAPS_API_KEY as
    | string
    | undefined;
  const { ready, error } = useGoogleMaps(apiKey || null);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const gmapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const polyRef = useRef<any>(null);

  const center = useMemo<LatLng>(() => {
    return [currentLocation.lat, currentLocation.lng];
  }, [currentLocation.lat, currentLocation.lng]);

  // initialize map once
  useEffect(() => {
    if (!ready || !mapRef.current || gmapRef.current) return;
    const [lat, lng] = center;
    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat, lng },
      zoom: 15,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    });
    gmapRef.current = map;

    // marker
    const marker = new window.google.maps.Marker({
      position: { lat, lng },
      map,
      // You can customize the icon here if desired
    });
    markerRef.current = marker;

    // polyline
    const path = route.map(([la, ln]) => ({ lat: la, lng: ln }));
    const poly = new window.google.maps.Polyline({
      path,
      geodesic: true,
      strokeColor: "#22c55e",
      strokeOpacity: 1.0,
      strokeWeight: 4,
      map,
    });
    polyRef.current = poly;
  }, [ready]);

  // update center/marker when current location changes
  useEffect(() => {
    if (!gmapRef.current || !markerRef.current) return;
    const [lat, lng] = center;
    const pos = new window.google.maps.LatLng(lat, lng);
    markerRef.current.setPosition(pos);
    gmapRef.current.panTo(pos);
  }, [center[0], center[1]]);

  // update polyline when route updates
  useEffect(() => {
    if (!polyRef.current || !gmapRef.current) return;
    const path = route.map(([la, ln]) => ({ lat: la, lng: ln }));
    polyRef.current.setPath(path);
  }, [route]);

  if (!apiKey) {
    return (
      <div className="p-4 border rounded-lg text-sm text-gray-600">
        Missing VITE_GOOGLE_MAPS_API_KEY. Falling back to Leaflet map.
      </div>
    );
  }
  if (error) {
    return (
      <div className="p-4 border rounded-lg text-sm text-red-600">
        Failed to load Google Maps: {String(error.message || error)}
      </div>
    );
  }

  return (
    <div className="relative rounded-xl overflow-hidden shadow-sm border border-gray-200">
      <div ref={mapRef} className="h-[500px] w-full" />
    </div>
  );
};

export default GoogleTrackingMap;

