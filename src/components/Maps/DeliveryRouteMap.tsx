"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { GoogleMap, MarkerF, PolylineF, InfoWindowF } from "@react-google-maps/api";
import { toLatLngLiteral, formatBreadcrumbTime, decodePolyline, dedupConsecutive } from "./utils/DeliveryRouteMap";
import { MAPS_LOADER_OPTIONS } from "./config/config";
import { useMapsLoader } from "./providers/GoogleMapsProvider";

// Types based on provided payload shape
export type Point = {
  type: "Point";
  coordinates: [number, number]; // [lng, lat]
};

export type RouteStop = {
  location: Point;
  formattedAddress?: string;
  description?: string;
};

export type Route = {
  start: {
    location: Point;
    description?: string;
  };
  stops: RouteStop[];
  polyline?: string;
  timestamps?: {
    updatedAt?: string;
  };
};

export type LocationHistoryPoint = {
  type: "Point";
  coordinates: [number, number]; // [lng, lat]
  at: string;
};

export type LastKnownLocation = {
  type: "Point";
  coordinates: [number, number]; // [lng, lat]
  updatedAt?: string;
};

export type Delivery = {
  lastKnownLocation?: LastKnownLocation;
  locationHistory?: LocationHistoryPoint[];
};

export type DeliveryRouteMapProps = {
  route: Route;
  delivery: Delivery;
  className?: string;
};

// Loader configuration comes from MAPS_LOADER_OPTIONS to avoid mismatch warnings

// Dark map style (concise, high-contrast for readability)
const DARK_STYLE: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#1f1f1f" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#cfcfcf" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#1f1f1f" }] },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#2a2a2a" }],
  },
  {
    featureType: "road.arterial",
    elementType: "geometry",
    stylers: [{ color: "#373737" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#3d3d3d" }],
  },
  {
    featureType: "poi",
    elementType: "geometry",
    stylers: [{ color: "#2b2b2b" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#0b0b0b" }],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#2b2b2b" }],
  },
  {
    featureType: "administrative",
    elementType: "geometry",
    stylers: [{ color: "#3a3a3a" }],
  },
];

// Utilities are imported from ./utils/DeliveryRouteMap

type MapMode = "default" | "dark" | "satellite";

const DeliveryRouteMapComponent: React.FC<DeliveryRouteMapProps> = ({
  route,
  delivery,
  className,
}) => {
  const apiKey = MAPS_LOADER_OPTIONS.googleMapsApiKey || "";

  // Track missing key but keep hooks ordering stable
  const keyMissing = !apiKey;

  // Use the shared provider's loader to avoid duplicate loaders and keep options identical
  const { isLoaded, loadError } = useMapsLoader();

  const mapRef = useRef<google.maps.Map | null>(null);
  const [mapMode, setMapMode] = useState<MapMode>("default");
  const [animationActive, setAnimationActive] = useState<boolean>(true);
  const [dashOffset, setDashOffset] = useState<number>(0);
  const [selectedInfo, setSelectedInfo] = useState<
    | { type: "pickup"; position: google.maps.LatLngLiteral }
    | { type: "stop"; index: number; position: google.maps.LatLngLiteral }
    | { type: "driver"; position: google.maps.LatLngLiteral }
    | null
  >(null);
  const [hoveredHistoryIndex, setHoveredHistoryIndex] = useState<number | null>(
    null
  );

  // Basic points
  const pickup = useMemo(
    () => toLatLngLiteral(route?.start?.location) || undefined,
    [route]
  );
  const stops = useMemo(
    () =>
      (route?.stops || [])
        .map((s) => toLatLngLiteral(s?.location))
        .filter((p): p is google.maps.LatLngLiteral => !!p),
    [route]
  );
  const driver = useMemo(
    () => toLatLngLiteral(delivery?.lastKnownLocation) || undefined,
    [delivery]
  );

  // History path (sorted by time, then deduped)
  const historyPath = useMemo(() => {
    const sorted = [...(delivery?.locationHistory || [])].sort(
      (a, b) => new Date(a.at).getTime() - new Date(b.at).getTime()
    );
    const raw = sorted.map(
      (h) =>
        ({
          lat: h.coordinates[1],
          lng: h.coordinates[0],
        } as google.maps.LatLngLiteral)
    );
    return dedupConsecutive(raw);
  }, [delivery]);

  // Decoded polyline path
  const polylinePath = useMemo(() => decodePolyline(route?.polyline), [route]);

  // Fallback points from pickup + ordered stops
  const fallbackPath = useMemo(() => {
    const pts: google.maps.LatLngLiteral[] = [];
    if (pickup) pts.push(pickup);
    if (stops?.length) pts.push(...stops);
    return pts;
  }, [pickup, stops]);

  // Directions path when no history/polyline available (roads route from Google)
  const [directionsPath, setDirectionsPath] = useState<
    google.maps.LatLngLiteral[]
  >([]);
  // Road-snapped path built from history points (uses Directions with sampled waypoints)
  const [historyRoadPath, setHistoryRoadPath] = useState<
    google.maps.LatLngLiteral[]
  >([]);
  const buildDirections = useCallback(async () => {
    try {
      if (!pickup || stops.length === 0) {
        setDirectionsPath([]);
        return;
      }
      const svc = new google.maps.DirectionsService();
      const origin = pickup;
      const destination = stops[stops.length - 1];
      const waypoints =
        stops.length > 1
          ? stops.slice(0, -1).map((p) => ({ location: p }))
          : undefined;
      const res = await svc.route({
        origin,
        destination,
        waypoints,
        travelMode: google.maps.TravelMode.DRIVING,
        region: "GB",
        optimizeWaypoints: false,
        provideRouteAlternatives: false,
      });
      const first = res.routes[0];
      const path: google.maps.LatLngLiteral[] = first.overview_path.map(
        (ll) => ({ lat: ll.lat(), lng: ll.lng() })
      );
      setDirectionsPath(path);
    } catch {
      setDirectionsPath([]);
    }
  }, [pickup, stops]);

  useEffect(() => {
    // Only build directions if we don't have history or a server-supplied polyline
    if (!isLoaded) return;
    if (
      historyPath.length >= 2 ||
      (route?.polyline && decodePolyline(route.polyline).length >= 2)
    ) {
      setDirectionsPath([]);
      return;
    }
    if (fallbackPath.length >= 2) {
      buildDirections();
    } else {
      setDirectionsPath([]);
    }
  }, [isLoaded, historyPath, route, fallbackPath, buildDirections]);

  // Build a road-following route based on history points using Directions
  useEffect(() => {
    if (!isLoaded) return;
    if (historyPath.length < 2) {
      setHistoryRoadPath([]);
      return;
    }

    const build = async () => {
      try {
        const svc = new google.maps.DirectionsService();
        const origin = historyPath[0];
        const destination = historyPath[historyPath.length - 1];
        // Sample intermediate waypoints to stay under Google limit (max 23 waypoints)
        const maxWaypoints = 23;
        const intermediates = historyPath.slice(1, -1);
        const step = Math.max(
          1,
          Math.ceil(intermediates.length / maxWaypoints)
        );
        const sampled = intermediates.filter((_, idx) => idx % step === 0);
        const waypoints = sampled.map((p) => ({ location: p }));
        const res = await svc.route({
          origin,
          destination,
          waypoints,
          travelMode: google.maps.TravelMode.DRIVING,
          region: "GB",
          optimizeWaypoints: false,
          provideRouteAlternatives: false,
        });
        const first = res.routes[0];
        const path: google.maps.LatLngLiteral[] = first.overview_path.map(
          (ll) => ({ lat: ll.lat(), lng: ll.lng() })
        );
        setHistoryRoadPath(path);
      } catch {
        setHistoryRoadPath([]);
      }
    };
    build();
  }, [isLoaded, historyPath]);

  // Choose effectivePath per priority
  const { effectivePath, pathSource } = useMemo(() => {
    if (historyPath.length >= 2)
      return {
        effectivePath:
          historyRoadPath.length >= 2 ? historyRoadPath : historyPath,
        pathSource: "history" as const,
      };
    if (polylinePath.length >= 2)
      return { effectivePath: polylinePath, pathSource: "polyline" as const };
    if (directionsPath.length >= 2)
      return {
        effectivePath: directionsPath,
        pathSource: "directions" as const,
      };
    if (fallbackPath.length >= 2)
      return { effectivePath: fallbackPath, pathSource: "fallback" as const };
    return {
      effectivePath: [] as google.maps.LatLngLiteral[],
      pathSource: "none" as const,
    };
  }, [
    historyPath,
    historyRoadPath,
    polylinePath,
    directionsPath,
    fallbackPath,
  ]);

  // Center fallback
  const defaultCenter = useMemo<google.maps.LatLngLiteral>(() => {
    if (pickup) return pickup;
    if (effectivePath[0]) return effectivePath[0];
    if (driver) return driver;
    return { lat: 51.5074, lng: -0.1278 }; // London as a safe default
  }, [pickup, effectivePath, driver]);

  // Build bounds points for auto-fit
  const boundsPoints = useMemo(() => {
    const pts: google.maps.LatLngLiteral[] = [];
    if (pickup) pts.push(pickup);
    if (stops?.length) pts.push(...stops);
    if (driver) pts.push(driver);
    if (effectivePath.length) pts.push(...effectivePath);
    return pts;
  }, [pickup, stops, driver, effectivePath]);

  // Fit map to bounds on load and when data changes
  const fitToBounds = useCallback(() => {
    if (!mapRef.current || !isLoaded) return;
    const map = mapRef.current;
    const padding = 56; // px
    if (!boundsPoints.length) {
      map.setCenter(defaultCenter);
      map.setZoom(15);
      return;
    }
    const bounds = new google.maps.LatLngBounds();
    boundsPoints.forEach((p) => bounds.extend(p));
    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();
    if (ne.equals(sw)) {
      const d = 0.0005;
      bounds.extend({ lat: ne.lat() + d, lng: ne.lng() + d });
      bounds.extend({ lat: ne.lat() - d, lng: ne.lng() - d });
    }
    map.fitBounds(bounds, padding);
  }, [boundsPoints, defaultCenter, isLoaded]);

  // Avoid repeated fitBounds by checking bounds signature
  const lastBoundsSigRef = useRef<string>("");
  useEffect(() => {
    if (!isLoaded || !mapRef.current) return;
    const sig = (() => {
      if (!boundsPoints.length)
        return `center:${defaultCenter.lat.toFixed(
          6
        )},${defaultCenter.lng.toFixed(6)}`;
      let minLat = Infinity,
        minLng = Infinity,
        maxLat = -Infinity,
        maxLng = -Infinity;
      for (const p of boundsPoints) {
        if (p.lat < minLat) minLat = p.lat;
        if (p.lng < minLng) minLng = p.lng;
        if (p.lat > maxLat) maxLat = p.lat;
        if (p.lng > maxLng) maxLng = p.lng;
      }
      return `${minLat.toFixed(6)}|${minLng.toFixed(6)}|${maxLat.toFixed(
        6
      )}|${maxLng.toFixed(6)}`;
    })();
    if (sig !== lastBoundsSigRef.current) {
      lastBoundsSigRef.current = sig;
      fitToBounds();
    }
  }, [isLoaded, fitToBounds, boundsPoints, defaultCenter]);

  // Animate the polyline dashes; pause during map interactions for smoother panning
  useEffect(() => {
    if (!isLoaded || effectivePath.length < 2) return;
    if (!animationActive) return;
    const id = window.setInterval(() => {
      setDashOffset((v) => (v + 2) % 200);
    }, 60);
    return () => window.clearInterval(id);
  }, [isLoaded, effectivePath, animationActive]);

  // Marker icons - build once when API is ready
  const icons = useMemo(() => {
    if (!isLoaded) return null;
    const circle = (
      color: string,
      scale = 7,
      stroke = "#ffffff"
    ): google.maps.Symbol => ({
      path: google.maps.SymbolPath.CIRCLE,
      scale,
      fillColor: color,
      fillOpacity: 1,
      strokeColor: stroke,
      strokeWeight: 2,
    });
    return {
      pickupIcon: circle("#10B981", 8), // green
      stopIcon: circle("#EF4444", 7), // red
      driverIcon: circle("#3B82F6", 9), // blue
      hoverIcon: circle("#F59E0B", 6, "#000000"), // amber for hover
      breadcrumbIcon: circle("#60A5FA", 3, "#ffffff"), // light blue small dots
    };
  }, [isLoaded]);

  // Map options
  const mapOptions = useMemo<google.maps.MapOptions>(() => {
    const isDark = mapMode === "dark";
    return {
      disableDefaultUI: false,
      zoomControl: true,
      streetViewControl: false,
      mapTypeControl: false,
      fullscreenControl: false,
      clickableIcons: false,
      gestureHandling: "greedy",
      mapTypeId: mapMode === "satellite" ? "hybrid" : "roadmap",
      styles: isDark ? DARK_STYLE : undefined,
      backgroundColor: isDark ? "#1f1f1f" : undefined,
    };
  }, [mapMode]);

  // Breadcrumbs list derived from locationHistory (deduped positions but preserving original timestamps for display)
  const breadcrumbs = useMemo(() => {
    const raw = delivery?.locationHistory || [];
    // Convert to lat/lng + keep timestamp
    const entries = raw.map((h) => ({
      at: h.at,
      pos: {
        lat: h.coordinates[1],
        lng: h.coordinates[0],
      } as google.maps.LatLngLiteral,
    }));
    // De-dup consecutive by position
    const cleaned: typeof entries = [];
    for (let i = 0; i < entries.length; i++) {
      const curr = entries[i];
      const prev = cleaned[cleaned.length - 1];
      if (
        prev &&
        Math.abs(prev.pos.lat - curr.pos.lat) <= 1e-5 &&
        Math.abs(prev.pos.lng - curr.pos.lng) <= 1e-5
      ) {
        continue;
      }
      cleaned.push(curr);
    }
    return cleaned;
  }, [delivery]);

  // Render states
  if (keyMissing) {
    return (
      <div
        className={`relative w-full ${className || ""}`}
        style={{ height: "100%" }}
      >
        <div style={{ padding: 12, color: "#b91c1c", fontSize: 14 }}>
          Google Maps API key is missing. Please set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div
        className={`relative w-full ${className || ""}`}
        style={{ height: "100%" }}
      >
        <div style={{ padding: 12, color: "#b91c1c", fontSize: 14 }}>
          Failed to load Google Maps.
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div
        className={`relative w-full ${className || ""}`}
        style={{ height: "100%" }}
      >
        <div style={{ padding: 12, color: "#4b5563", fontSize: 14 }}>
          Loading map…
        </div>
      </div>
    );
  }

  // Warn if no valid path
  if (pathSource === "none") {
    // eslint-disable-next-line no-console
    console.warn("DeliveryRouteMap: No valid path to render");
  }

  const strokeColor = useMemo(
    () => (pathSource === "history" ? "#00D4FF" : "#1e88e5"),
    [pathSource]
  );
  const hoveredPoint =
    hoveredHistoryIndex != null
      ? breadcrumbs[hoveredHistoryIndex]?.pos
      : undefined;

  // Stable map event handlers
  const handleMapLoad = useCallback(
    (map: google.maps.Map) => {
      mapRef.current = map;
      fitToBounds();
    },
    [fitToBounds]
  );

  const handleMapUnmount = useCallback(() => {
    mapRef.current = null;
  }, []);
  const handleDragStart = useCallback(() => setAnimationActive(false), []);
  const handleZoomChanged = useCallback(() => setAnimationActive(false), []);
  const handleIdle = useCallback(() => setAnimationActive(true), []);

  return (
    <div
      className={`relative w-full ${className || ""}`}
      style={{ height: "100%" }}
    >
      <GoogleMap
        onLoad={handleMapLoad}
        onDragStart={handleDragStart}
        onZoomChanged={handleZoomChanged}
        onIdle={handleIdle}
        onUnmount={handleMapUnmount}
        center={defaultCenter}
        options={mapOptions}
        mapContainerStyle={{ width: "100%", height: "100%" }}
      >
        {/* Effective path polyline */}
        {effectivePath.length >= 2 && (
          <PolylineF
            path={effectivePath}
            options={{
              strokeColor,
              strokeOpacity: 1,
              strokeWeight: 6,
              zIndex: 2,
              icons: [
                {
                  icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 2.6,
                    strokeOpacity: 0,
                    fillOpacity: 0.85,
                    fillColor: strokeColor,
                  },
                  repeat: "28px",
                  offset: `${dashOffset}px`,
                },
              ],
            }}
          />
        )}

        {/* Pickup marker */}
        {pickup && (
          <MarkerF
            position={pickup}
            icon={icons?.pickupIcon}
            options={{ optimized: true }}
            animation={google.maps.Animation.DROP}
            onClick={() =>
              setSelectedInfo({ type: "pickup", position: pickup })
            }
            title="Pickup"
          />
        )}
        {selectedInfo?.type === "pickup" && (
          <InfoWindowF
            position={selectedInfo.position}
            onCloseClick={() => setSelectedInfo(null)}
          >
            <div style={{ fontSize: 12 }}>
              <div>
                <strong>Pickup</strong>
              </div>
              {route?.start?.description && (
                <div style={{ color: "#4b5563", marginTop: 4 }}>
                  {route.start.description}
                </div>
              )}
            </div>
          </InfoWindowF>
        )}

        {/* Stop markers */}
        {stops.map((s, idx) => (
          <MarkerF
            key={`stop-${idx}-${s.lat}-${s.lng}`}
            position={s}
            icon={icons?.stopIcon}
            options={{ optimized: true }}
            animation={google.maps.Animation.DROP}
            onClick={() =>
              setSelectedInfo({ type: "stop", index: idx, position: s })
            }
            title={`Stop #${idx + 1}`}
          />
        ))}
        {selectedInfo?.type === "stop" &&
          typeof selectedInfo.index === "number" && (
            <InfoWindowF
              position={selectedInfo.position}
              onCloseClick={() => setSelectedInfo(null)}
            >
              <div style={{ fontSize: 12 }}>
                <div>
                  <strong>{`Stop #${selectedInfo.index + 1}`}</strong>
                </div>
                {route?.stops?.[selectedInfo.index]?.formattedAddress && (
                  <div style={{ color: "#4b5563", marginTop: 4 }}>
                    {route.stops[selectedInfo.index].formattedAddress}
                  </div>
                )}
                {route?.stops?.[selectedInfo.index]?.description && (
                  <div style={{ color: "#4b5563", marginTop: 4 }}>
                    {route.stops[selectedInfo.index].description}
                  </div>
                )}
              </div>
            </InfoWindowF>
          )}

        {/* Driver marker */}
        {driver && (
          <MarkerF
            position={driver}
            icon={icons?.driverIcon}
            options={{ optimized: true }}
            animation={google.maps.Animation.BOUNCE}
            onClick={() =>
              setSelectedInfo({ type: "driver", position: driver })
            }
            title="Driver (Last known)"
          />
        )}
        {selectedInfo?.type === "driver" && (
          <InfoWindowF
            position={selectedInfo.position}
            onCloseClick={() => setSelectedInfo(null)}
          >
            <div style={{ fontSize: 12 }}>
              <div>
                <strong>Driver (Last known)</strong>
              </div>
              <div style={{ color: "#4b5563", marginTop: 4 }}>
                {delivery?.lastKnownLocation?.updatedAt
                  ? `Updated: ${new Date(
                      delivery.lastKnownLocation.updatedAt
                    ).toLocaleString("en-GB")}`
                  : ""}
              </div>
            </div>
          </InfoWindowF>
        )}

        {/* History dots with hover for time */}
        {breadcrumbs.map((b, i) => (
          <MarkerF
            key={`crumb-${i}-${b.pos.lat}-${b.pos.lng}`}
            position={b.pos}
            icon={
              i === hoveredHistoryIndex
                ? icons?.hoverIcon
                : icons?.breadcrumbIcon
            }
            onMouseOver={() => setHoveredHistoryIndex(i)}
            onMouseOut={() => setHoveredHistoryIndex(null)}
          />
        ))}
        {hoveredPoint && (
          <InfoWindowF
            position={hoveredPoint}
            onCloseClick={() => setHoveredHistoryIndex(null)}
          >
            <div style={{ fontSize: 12 }}>
              {formatBreadcrumbTime(breadcrumbs[hoveredHistoryIndex!]?.at)}
            </div>
          </InfoWindowF>
        )}
      </GoogleMap>

      {/* Map mode toggle */}
      <div
        style={{
          position: "absolute",
          top: 8,
          left: 8,
          display: "flex",
          gap: 6,
        }}
      >
        {["default", "dark", "satellite"].map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMapMode(m as MapMode)}
            style={{
              padding: "6px 10px",
              fontSize: 12,
              borderRadius: 6,
              border: "1px solid #d1d5db",
              background: mapMode === m ? "#2563eb" : "#ffffff",
              color: mapMode === m ? "#ffffff" : "#111827",
              boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
              cursor: "pointer",
            }}
          >
            {m === "default" ? "Default" : m === "dark" ? "Dark" : "Satellite"}
          </button>
        ))}
      </div>

      {/* Legend */}
      <div
        style={{
          position: "absolute",
          left: 8,
          top: 48,
          background: "rgba(255,255,255,0.95)",
          border: "1px solid #e5e7eb",
          borderRadius: 8,
          padding: 8,
          fontSize: 12,
          lineHeight: 1.2,
          minWidth: 140,
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: 6 }}>Legend</div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 4,
          }}
        >
          <span
            style={{
              display: "inline-block",
              width: 10,
              height: 10,
              borderRadius: 9999,
              background: "#10B981",
            }}
          />
          <span>Pickup</span>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 4,
          }}
        >
          <span
            style={{
              display: "inline-block",
              width: 10,
              height: 10,
              borderRadius: 9999,
              background: "#EF4444",
            }}
          />
          <span>Stop</span>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 4,
          }}
        >
          <span
            style={{
              display: "inline-block",
              width: 10,
              height: 10,
              borderRadius: 9999,
              background: "#3B82F6",
            }}
          />
          <span>Driver</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              display: "inline-block",
              width: 24,
              height: 2,
              background: "#00D4FF",
            }}
          />
          <span>History path</span>
        </div>
      </div>

      {/* History breadcrumbs list */}
      {breadcrumbs.length > 0 && (
        <div
          style={{
            position: "absolute",
            right: 8,
            top: 8,
            maxHeight: 220,
            overflowY: "auto",
            background: "rgba(255,255,255,0.95)",
            border: "1px solid #e5e7eb",
            borderRadius: 8,
            padding: 8,
            minWidth: 160,
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
            History
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {breadcrumbs.map((b, i) => (
              <div
                key={`crumb-${i}`}
                onMouseEnter={() => {
                  setHoveredHistoryIndex(i);
                  if (mapRef.current) mapRef.current.panTo(b.pos);
                }}
                onMouseLeave={() => setHoveredHistoryIndex(null)}
                style={{
                  fontSize: 12,
                  padding: "4px 6px",
                  borderRadius: 6,
                  background:
                    i === hoveredHistoryIndex ? "#dbeafe" : "transparent",
                  cursor: "default",
                  color: "#111827",
                }}
                title={`${b.pos.lat.toFixed(5)}, ${b.pos.lng.toFixed(5)}`}
              >
                {formatBreadcrumbTime(b.at)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Memoize to avoid re-renders when props are referentially stable
const DeliveryRouteMap = React.memo(DeliveryRouteMapComponent);
export default DeliveryRouteMap;
