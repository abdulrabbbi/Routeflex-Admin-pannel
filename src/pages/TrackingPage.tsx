"use client";

import { useState, useCallback } from "react";
import Map from "../components/Maps/TrackingMap";
import DriverTracking from "../components/DriverTracking";
import DriversTable from "../components/DriversTable";
import { getDriverTracking, reverseGeocode } from "../api/deliveryService";

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

  const handleTrackDriver = useCallback(async () => {
    if (!driverTrackingId) return;
    try {
      const data = await getDriverTracking(driverTrackingId);
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

      setRoute([
        [
          data.currentLocation.coordinates[1],
          data.currentLocation.coordinates[0],
        ],
      ]);
      setCurrentLocation({
        lat: data.currentLocation.coordinates[1],
        lng: data.currentLocation.coordinates[0],
        address,
      });
    } catch (error) {
      console.error("Failed to fetch driver tracking", error);
    }
  }, [driverTrackingId]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {currentLocation && (
          <Map route={route} currentLocation={currentLocation} />
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
