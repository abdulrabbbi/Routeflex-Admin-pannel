"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import MapLeaflet from "../components/Maps/TrackingMap";
import GoogleTrackingMap from "../components/Maps/GoogleTrackingMap";
import DriverTracking from "../components/DriverTracking";
import DriversTable from "../components/drivers/DriversTable";
import { getDriverTracking, reverseGeocode } from "../api/deliveryService";
import { useSocket } from "../realtime/SocketProvider";

interface CurrentLocation {
  lat: number;
  lng: number;
  address: string;
}

interface DriverData {
  currentLocation: string;
  currentTask: string;
  totalOrders: number;
  doneDeliveries: number;
  stopsLeft: number;
  currentTaskDetails: {
    pickup: { location: string; time: string };
    delivery: { location: string; time: string };
  };
}

const TrackingPage = () => {
  const [driverTrackingId, setdriverTrackingId] = useState("");
  const [driverData, setDriverData] = useState<DriverData | null>(null);
  const [route, setRoute] = useState<[number, number][]>([]);
  const [currentLocation, setCurrentLocation] = useState<CurrentLocation | null>(null);
  const [subscribedDriverId, setSubscribedDriverId] = useState<string | null>(null);
  const [live, setLive] = useState<{ speedKph?: number; headingDeg?: number; at?: string }>({});
  const socket = useSocket();
  const lastAtRef = useRef<string | null>(null);

  const normalizedTrackingId = useMemo(
    () => driverTrackingId.trim().toUpperCase(),
    [driverTrackingId]
  );

  const handleTrackDriver = useCallback(async () => {
    const tid = normalizedTrackingId;
    if (!tid) return;
    try {
      lastAtRef.current = null;
      setRoute([]);

      const data = await getDriverTracking(tid);
      const address = await reverseGeocode(
        data.currentLocation.coordinates[1],
        data.currentLocation.coordinates[0]
      );

      setDriverData({
        currentLocation: address,
        currentTask: data.currentTask,
        totalOrders: data.totalOrders,
        doneDeliveries: data.doneDeliveries,
        stopsLeft: data.stopsLeft,
        currentTaskDetails: {
          pickup: {
            location: data.currentTaskDetails?.pickupLocation || "N/A",
            time: data.currentTaskDetails?.pickupTime || "N/A",
          },
          delivery: {
            location: data.currentTaskDetails?.deliveryLocation || "N/A",
            time: data.currentTaskDetails?.deliveryTime || "N/A",
          },
        },
      });

      setRoute([[data.currentLocation.coordinates[1], data.currentLocation.coordinates[0]]]);
      setCurrentLocation({
        lat: data.currentLocation.coordinates[1],
        lng: data.currentLocation.coordinates[0],
        address,
      });

      if (socket) {
        socket.emit("tracking:subscribe", { driverTrackingId: tid }, (res: any) => {
          if (res?.ok && res.latest?.driverId) {
            setSubscribedDriverId(res.latest.driverId);
          } else if (socket) {
            socket.emit("tracking:latest", { driverTrackingId: tid }, (lr: any) => {
              if (lr?.ok && lr.latest?.driverId) setSubscribedDriverId(lr.latest.driverId);
            });
          }
        });
      }
    } catch (error) {
      console.error("Failed to fetch driver tracking", error);
    }
  }, [normalizedTrackingId, socket]);

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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Map with overlay */}
        {currentLocation && (
          <div className="relative rounded-2xl overflow-hidden shadow-lg h-[70vh]">
            {(import.meta as any)?.env?.VITE_GOOGLE_MAPS_API_KEY ? (
              <GoogleTrackingMap route={route} currentLocation={currentLocation} />
            ) : (
              <MapLeaflet route={route} currentLocation={currentLocation} />
            )}

            {/* Overlay cards */}
            <div className="absolute bottom-4 left-4 flex flex-wrap gap-3 z-[999]">
              <div className="bg-white/90 backdrop-blur-sm p-3 rounded-xl shadow shadow-green-900 text-center min-w-[120px]">
                <div className="text-xs text-gray-500">Speed</div>
                <div className="text-lg font-semibold text-[#1e1e38]">
                  {live.speedKph ? `${live.speedKph} km/h` : "—"}
                </div>
              </div>

              <div className="bg-white/90 backdrop-blur-sm p-3 rounded-xl shadow shadow-green-900 text-center min-w-[120px]">
                <div className="text-xs text-gray-500">Heading</div>
                <div className="text-lg font-semibold text-[#1e1e38]">
                  {live.headingDeg ? `${live.headingDeg}°` : "—"}
                </div>
              </div>

              <div className="bg-white/90 backdrop-blur-sm p-3 rounded-xl shadow shadow-green-900 text-center min-w-[120px]">
                <div className="text-xs text-gray-500">Last Update</div>
                <div className="text-lg font-semibold text-[#1e1e38]">
                  {live.at ? new Date(live.at).toLocaleTimeString() : "—"}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Driver Input + Info + Table */}
        <DriverTracking
          driverId={driverTrackingId}
          setDriverId={setdriverTrackingId}
          driverData={driverData}
          onTrackDriver={handleTrackDriver}
        />
        <DriversTable />
      </div>
    </div>
  );
};

export default TrackingPage;
