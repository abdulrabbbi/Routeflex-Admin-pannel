"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import ParcelMap from "../components/Maps/ParcelMap";
import ParcelTracking from "../components/ParcelTracking";
import { getParcelTracking } from "../api/deliveryService";
import DeliveriesTable from "../components/deliveries/DeliveriesTable";

const cars = [
  { lat: 33.5973, lng: 73.0479 },
  { lat: 33.5955, lng: 73.0498 },
  { lat: 33.5987, lng: 73.0505 },
  { lat: 33.5962, lng: 73.0451 },
  { lat: 33.5991, lng: 73.048 },
];

const ParcelTrackingPage = () => {
  const [OrderId, setOrderId] = useState("");
  const [OrderData, setOrderData] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchOrderTracking = useCallback(async () => {
    if (!OrderId) return;
    try {
      setIsSubmitting(true);
      const data = await getParcelTracking(OrderId);
      setOrderData({
        orderNumber: data.orderNumber,
        orderPickedby: data.parcelPickedBy,
        currentTaskDetails: {
          pickup: {
            location: data.currentTaskDetails.pickupLocation,
            time: data.currentTaskDetails.pickupTime,
          },
          delivery: {
            location: data.currentTaskDetails.deliveryLocation,
            time: data.currentTaskDetails.deliveryTime,
          },
        },
      });
    } catch (err) {
      console.error(err);
      setOrderData(null);
    } finally {
      setIsSubmitting(false);
    }
  }, [OrderId]);

  const MemoizedOrderData = useMemo(() => OrderData, [OrderData]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <ParcelMap cars={cars} />
        <ParcelTracking
          OrderId={OrderId}
          setOrderId={setOrderId}
          OrderData={MemoizedOrderData}
          onTrackOrder={fetchOrderTracking}
          isSubmitting={isSubmitting}
        />
        <DeliveriesTable />
      </div>
    </div>
  );
};

export default ParcelTrackingPage;
