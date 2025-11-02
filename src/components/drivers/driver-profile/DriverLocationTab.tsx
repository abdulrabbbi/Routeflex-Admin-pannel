"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import MapLeaflet from "../../../components/Maps/TrackingMap";
import GoogleTrackingMap from "../../../components/Maps/GoogleTrackingMap";
import { getDriverTracking, reverseGeocode } from "../../../api/deliveryService";
import { useSocket } from "../../../realtime/SocketProvider";

interface DriverLocationTabProps {
  driverTrackingId?: string;
}

interface CurrentLocation {
  lat: number;
  lng: number;
  address: string;
}

const DriverLocationTab: React.FC<DriverLocationTabProps> = ({ driverTrackingId }) => {
  const [route, setRoute] = useState<[number, number][]>([]);
  const [currentLocation, setCurrentLocation] = useState<CurrentLocation | null>(null);
  const [live, setLive] = useState<{ speedKph?: number; headingDeg?: number; at?: string }>({});
  const [subscribedDriverId, setSubscribedDriverId] = useState<string | null>(null);

  const socket = useSocket();
  const lastAtRef = useRef<string | null>(null);

  const normalizedTrackingId = useMemo(
    () => driverTrackingId?.trim().toUpperCase() || "",
    [driverTrackingId]
  );

  // Initial fetch for driver's current location
  const fetchInitialLocation = useCallback(async () => {
    if (!normalizedTrackingId) return;

    try {
      lastAtRef.current = null;
      setRoute([]);

      const data = await getDriverTracking(normalizedTrackingId);
      const [lng, lat] = data.currentLocation.coordinates;
      const address = await reverseGeocode(lat, lng);

      setRoute([[lat, lng]]);
      setCurrentLocation({ lat, lng, address });

      if (socket) {
        socket.emit("tracking:subscribe", { driverTrackingId: normalizedTrackingId }, (res: any) => {
          if (res?.ok && res.latest?.driverId) {
            setSubscribedDriverId(res.latest.driverId);
          } else {
            socket.emit("tracking:latest", { driverTrackingId: normalizedTrackingId }, (lr: any) => {
              if (lr?.ok && lr.latest?.driverId) setSubscribedDriverId(lr.latest.driverId);
            });
          }
        });
      }
    } catch (error) {
      console.error("Failed to fetch driver tracking:", error);
    }
  }, [normalizedTrackingId, socket]);

  useEffect(() => {
    if (!normalizedTrackingId) return;
    fetchInitialLocation();
  }, [normalizedTrackingId, fetchInitialLocation]);

  // Listen for live updates
  useEffect(() => {
    if (!socket) return;

    const pickCoords = (p: any): [number, number] | undefined => {
      const c =
        p?.coordinates ||
        p?.location?.coordinates ||
        p?.currentLocation?.coordinates ||
        p?.coords;
      if (Array.isArray(c) && c.length === 2) return c as [number, number];
    };

    const handlePacket = async (p: any) => {
      if (!subscribedDriverId || (p?.driverId && p.driverId !== subscribedDriverId)) return;
      const coords = pickCoords(p);
      if (!coords) return;
      const [lng, lat] = coords;
      const atStr = (p?.at && new Date(p.at).toISOString()) || `${lat},${lng}`;
      if (lastAtRef.current === atStr) return;
      lastAtRef.current = atStr;

      setRoute((prev) => [...prev, [lat, lng]]);
      setCurrentLocation((prev) => ({ lat, lng, address: prev?.address || "Updating..." }));
      setLive({
        speedKph: typeof p?.speedKph === "number" ? p.speedKph : undefined,
        headingDeg: typeof p?.headingDeg === "number" ? p.headingDeg : undefined,
        at: atStr,
      });

      try {
        const addr = await reverseGeocode(lat, lng);
        setCurrentLocation({ lat, lng, address: addr });
      } catch {
        setCurrentLocation((prev) => ({ lat, lng, address: prev?.address || "Unknown" }));
      }
    };

    socket.on("tracking:update", handlePacket);
    socket.on("location:driver", handlePacket);

    return () => {
      socket.off("tracking:update", handlePacket);
      socket.off("location:driver", handlePacket);
    };
  }, [socket, subscribedDriverId]);

  return (
    <div className="w-full bg-white rounded-2xl border shadow-sm p-4">
      <h2 className="text-xl font-semibold mb-4">Live Location</h2>

      {!currentLocation ? (
        <p className="text-gray-600">Fetching live driver location...</p>
      ) : (
        <div className="relative rounded-2xl overflow-hidden shadow-lg h-[70vh]">
          {(import.meta as any)?.env?.VITE_GOOGLE_MAPS_API_KEY ? (
            <GoogleTrackingMap route={route} currentLocation={currentLocation} />
          ) : (
            <MapLeaflet route={route} currentLocation={currentLocation} />
          )}

          {/* Overlay Info */}
          <div className="absolute bottom-4 left-4 flex flex-wrap gap-3 z-[999]">
            <div className="bg-white/90 backdrop-blur-sm p-3 rounded-xl shadow text-center min-w-[120px]">
              <div className="text-xs text-gray-500">Speed</div>
              <div className="text-lg font-semibold text-gray-800">
                {live.speedKph ? `${live.speedKph} km/h` : "—"}
              </div>
            </div>
            <div className="bg-white/90 backdrop-blur-sm p-3 rounded-xl shadow text-center min-w-[120px]">
              <div className="text-xs text-gray-500">Heading</div>
              <div className="text-lg font-semibold text-gray-800">
                {live.headingDeg ? `${live.headingDeg}°` : "—"}
              </div>
            </div>
            <div className="bg-white/90 backdrop-blur-sm p-3 rounded-xl shadow text-center min-w-[120px]">
              <div className="text-xs text-gray-500">Last Update</div>
              <div className="text-lg font-semibold text-gray-800">
                {live.at ? new Date(live.at).toLocaleTimeString() : "—"}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverLocationTab;
