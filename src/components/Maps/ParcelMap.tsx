import "leaflet/dist/leaflet.css";
import { useEffect, useMemo } from "react";
import React from "react";
import { MapContainer, TileLayer, CircleMarker, Polyline, useMap } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import polyline from "@mapbox/polyline";

type Point = { lat: number; lng: number };

type Props = {
  cars: Point[];
  polyline?: LatLngExpression[]; // optional pre-decoded path
  encodedPolyline?: string; // optional encoded polyline
  height?: number; // px
  className?: string;
};

function FitTo({ points, path }: { points: Point[]; path: LatLngExpression[] }) {
  const map = useMap();
  useEffect(() => {
    const list: [number, number][] = [];
    if (points?.length) list.push(...points.map((p) => [p.lat, p.lng] as [number, number]));
    if (path?.length) {
      for (const v of path as any[]) {
        const a = Array.isArray(v) ? v : null;
        if (a && a.length >= 2) list.push([a[0], a[1]]);
      }
    }
    if (!list.length) return;
    const run = () => {
      try {
        map.fitBounds(list as any, { padding: [24, 24] });
        // Only invalidate after map pane exists
        const safeInvalidate = () => {
          const anyMap = map as any;
          if (anyMap && anyMap._mapPane) map.invalidateSize();
        };
        setTimeout(safeInvalidate, 60);
      } catch {}
    };
    const anyMap = map as any;
    if (anyMap && anyMap._loaded) run();
    else anyMap?.whenReady?.(run);
  }, [map, points, path]);
  return null;
}

function InvalidateOnMount() {
  const map = useMap();
  useEffect(() => {
    const safeInvalidate = () => {
      const anyMap = map as any;
      if (anyMap && anyMap._mapPane) map.invalidateSize();
    };
    const anyMap = map as any;
    if (anyMap && anyMap._loaded) setTimeout(safeInvalidate, 0);
    else anyMap?.whenReady?.(() => setTimeout(safeInvalidate, 0));
  }, [map]);
  return null;
}

export default function ParcelMap({ cars, polyline: givenPath, encodedPolyline, height = 280, className = "" }: Props) {
  const points = cars || [];

  const path = useMemo<LatLngExpression[]>(() => {
    if (givenPath && givenPath.length) return givenPath;
    try {
      if (encodedPolyline && typeof encodedPolyline === "string" && encodedPolyline.length > 0) {
        return polyline.decode(encodedPolyline).map((p) => [p[0], p[1]] as LatLngExpression);
      }
    } catch {}
    return [];
  }, [givenPath, encodedPolyline]);

  const center: LatLngExpression = useMemo(() => {
    if (points.length) return [points[0].lat, points[0].lng] as LatLngExpression;
    if (path.length) return path[0];
    return [51.5074, -0.1278];
  }, [points, path]);

  return (
    <div className={className} style={{ height }}>
      <MapContainer
        center={center}
        zoom={12}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%", borderRadius: 12, overflow: "hidden" }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {path.length > 1 && (
          <Polyline positions={path} pathOptions={{ color: "#3b82f6", weight: 4, opacity: 0.7 }} />
        )}

        {points.map((p, i) => (
          <CircleMarker
            key={`${p.lat},${p.lng},${i}`}
            center={[p.lat, p.lng] as LatLngExpression}
            radius={6}
            pathOptions={{ color: "#3b82f6", fillColor: "#3b82f6", fillOpacity: 1, weight: 0 }}
          />
        ))}

        <FitTo points={points} path={path} />
        <InvalidateOnMount />
      </MapContainer>
    </div>
  );
}
