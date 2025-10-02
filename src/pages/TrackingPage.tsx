"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import MapLeaflet from "../components/Maps/TrackingMap";
import GoogleTrackingMap from "../components/Maps/GoogleTrackingMap";
import DriverTracking from "../components/DriverTracking";
import DriversTable from "../components/DriversTable";
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
    pickup: {
      location: string;
      time: string;
    };
    delivery: {
      location: string;
      time: string;
    };
  };
}

const TrackingPage = () => {
  const [driverTrackingId, setdriverTrackingId] = useState<string>("");
  const [driverData, setDriverData] = useState<DriverData | null>(null);
  const [route, setRoute] = useState<[number, number][]>([]);
  const [currentLocation, setCurrentLocation] =
    useState<CurrentLocation | null>(null);
  const [subscribedDriverId, setSubscribedDriverId] = useState<string | null>(
    null
  );
  const [live, setLive] = useState<{
    speedKph?: number;
    headingDeg?: number;
    at?: string;
  }>({});

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
      // reset incremental state for a fresh track
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

      setRoute((prev) => [
        [data.currentLocation.coordinates[1], data.currentLocation.coordinates[0]],
      ]);
      setCurrentLocation({
        lat: data.currentLocation.coordinates[1],
        lng: data.currentLocation.coordinates[0],
        address,
      });

      // subscribe to live tracking updates over socket
      if (socket) {
        socket.emit(
          "tracking:subscribe",
          { driverTrackingId: tid },
          (res: any) => {
            console.log("[tracking:subscribe] ack", res);
            if (res?.ok) {
              if (res.latest?.driverId) setSubscribedDriverId(res.latest.driverId);
              // resolve id if not in subscribe ack
              if (!res.latest?.driverId) {
                socket.emit(
                  "tracking:latest",
                  { driverTrackingId: tid },
                  (lr: any) => {
                    console.log("[tracking:latest] ack", lr);
                    if (lr?.ok && lr.latest?.driverId)
                      setSubscribedDriverId(lr.latest.driverId);
                  }
                );
              }
            } else {
              console.warn("[tracking:subscribe] failed", res);
            }
          }
        );
      }
    } catch (error) {
      console.error("Failed to fetch driver tracking", error);
    }
  }, [normalizedTrackingId, socket]);

  // Live socket listeners for this page
  useEffect(() => {
    if (!socket) return;
    const pickCoords = (p: any): [number, number] | undefined => {
      const c =
        p?.coordinates ||
        p?.location?.coordinates ||
        p?.currentLocation?.coordinates ||
        p?.coords;
      if (
        Array.isArray(c) &&
        c.length === 2 &&
        typeof c[0] === "number" &&
        typeof c[1] === "number"
      )
        return c as [number, number];
      return undefined;
    };

    const handlePacket = async (p: any) => {
      // Only process live updates after a successful subscribe when we know the driverId
      if (!subscribedDriverId) return;
      if (p?.driverId && p.driverId !== subscribedDriverId) return;
      const coords = pickCoords(p);
      if (Array.isArray(coords) && coords.length === 2) {
        const [lng, lat] = coords as [number, number];
        const atStr = (p?.at && new Date(p.at).toISOString()) || `${lat},${lng}`;
        if (lastAtRef.current === atStr) return;
        lastAtRef.current = atStr;

        setRoute((prev) => [...prev, [lat, lng]]);
        // update marker immediately; fill address asynchronously
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
          // keep last known address if reverse geocode fails
          setCurrentLocation((prev) => ({ lat, lng, address: prev?.address || "Unknown" }));
        }
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
        {currentLocation && (
          (import.meta as any)?.env?.VITE_GOOGLE_MAPS_API_KEY ? (
            <GoogleTrackingMap
              route={route}
              currentLocation={currentLocation}
            />
          ) : (
            <MapLeaflet route={route} currentLocation={currentLocation} />
          )
        )}
        {currentLocation && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl shadow">
              <div className="text-sm text-gray-500">Speed</div>
              <div className="text-2xl font-semibold text-[#1e1e38]">
                {typeof live.speedKph === "number" ? `${live.speedKph} km/h` : "—"}
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow">
              <div className="text-sm text-gray-500">Heading</div>
              <div className="text-2xl font-semibold text-[#1e1e38]">
                {typeof live.headingDeg === "number" ? `${live.headingDeg}°` : "—"}
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow">
              <div className="text-sm text-gray-500">Last Update</div>
              <div className="text-2xl font-semibold text-[#1e1e38]">
                {live.at ? new Date(live.at).toLocaleTimeString() : "—"}
              </div>
            </div>
          </div>
        )}
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
