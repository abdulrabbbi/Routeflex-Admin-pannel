"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { IoClose } from "react-icons/io5";
import { toast } from "react-hot-toast";
import ParcelMap from "../../components/Maps/ParcelMap";
import { getTrackOrder } from "../../api/deliveryService";
import { TrackOrderResponse } from "../../types/deliveries";
import { getSignedUrl, s3UrlToKey } from "../../utils/s3";
import { getImageUrl } from "../../utils/getImageUrl";
import OrderDetail from "../orders/OrderDetail";

// Cache for signed S3 images
const signedPhotoCache = new Map<string, string>();

// Signed photo renderer with skeleton fallback
function SignedPhoto({
  value,
  alt,
  className = "w-full h-40 object-cover rounded border",
  skeletonClassName = "w-full h-40 rounded bg-gray-200 animate-pulse border",
}: {
  value?: string;
  alt: string;
  className?: string;
  skeletonClassName?: string;
}) {
  const [src, setSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    const loadImage = async () => {
      const v = value || "";
      if (!v) {
        setLoading(false);
        return;
      }
      try {
        const isHttp = /^https?:/i.test(v);
        const isS3Http = isHttp && /amazonaws\.com/.test(v);
        const isKey = !isHttp && !v.startsWith("/");

        if (isS3Http || isKey) {
          const key = s3UrlToKey(v);
          const cached = signedPhotoCache.get(key);
          if (cached) {
            setSrc(cached);
          } else {
            const signed = await getSignedUrl(key, 300);
            if (!cancelled && signed) {
              signedPhotoCache.set(key, signed);
              setSrc(signed);
            }
          }
        } else {
          setSrc(getImageUrl(v) || v);
        }
      } catch {
        setSrc(value || null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    loadImage();
    return () => {
      cancelled = true;
    };
  }, [value]);

  return (
    <div ref={ref} className="relative">
      {loading && <div className={skeletonClassName} />}
      {!loading && src && (
        <img
          src={src}
          alt={alt}
          className={`${className} ${loading ? "opacity-0" : "opacity-100"}`}
          onLoad={() => setLoading(false)}
          onError={() => setSrc(null)}
        />
      )}
    </div>
  );
}

export const TrackOrderDrawer: React.FC<{
  open: boolean;
  onClose: () => void;
  deliveryId: string;
}> = ({ open, onClose, deliveryId }) => {
  const [loading, setLoading] = useState(false);
  const [payload, setPayload] = useState<TrackOrderResponse["data"] | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const openDrawer = (orderId: string) => {
    setSelectedOrderId(orderId);
    setDrawerOpen(true);
  };
  // Fetch order details
  useEffect(() => {
    let active = true;
    async function fetchOrder() {
      if (!open) return;
      setLoading(true);
      try {
        const data = await getTrackOrder(deliveryId);
        if (active) setPayload(data);
      } catch (err: any) {
        toast.error(err?.response?.data?.message || "Failed to load delivery");
        if (active) setPayload(null);
      } finally {
        if (active) setLoading(false);
      }
    }
    fetchOrder();
    return () => {
      active = false;
    };
  }, [open, deliveryId]);


  function formatPhone(phoneStr: string | null | undefined): string {
    if (!phoneStr) return "—";

    const regex =
      /countryISOCode:\s*([A-Z]{2}),\s*countryCode:\s*([+\d]+),\s*number:\s*(\d+)/;

    const match = phoneStr.match(regex);
    if (!match) return phoneStr; // fallback if it doesn't match pattern

    const [, countryISO, countryCode, number] = match;
    return `${countryCode} ${number} (${countryISO})`;
  }






  // Map route points
  const cars = useMemo(() => {
    if (!payload?.route) return [];
    const points: Array<{ lat: number; lng: number }> = [];

    const start = payload.route.start?.location?.coordinates;
    if (Array.isArray(start) && start.length === 2) {
      points.push({ lng: start[0], lat: start[1] });
    }

    for (const stop of payload.route.stops || []) {
      const coords = stop.location?.coordinates;
      if (Array.isArray(coords) && coords.length === 2) {
        points.push({ lng: coords[0], lat: coords[1] });
      }
    }

    return points.map((p) => ({ lat: p.lat, lng: p.lng }));
  }, [payload]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1200] flex">
      {/* Overlay */}
      <div className="flex-1 bg-black/40" onClick={onClose} />

      {/* Drawer */}
      <div className="w-full max-w-[720px] h-full bg-white shadow-xl overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">Parcel Details</h3>
          <button onClick={onClose} className="p-2 rounded hover:bg-gray-100">
            <IoClose size={22} />
          </button>
        </div>

        {/* Body */}
        {loading ? (
          <div className="p-6 text-gray-500">Loading…</div>
        ) : !payload ? (
          <div className="p-6 text-red-600">Failed to load data.</div>
        ) : (
          <div className="p-4 sm:p-6 space-y-6">
            {/* Driver Profile */}
            <div className="flex flex-col items-center text-center">
              <SignedPhoto
                value={payload.driver?.profilePicture}
                alt={`${payload.driver?.firstName || ""} ${payload.driver?.lastName || ""}`}
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover border shadow-sm"
                skeletonClassName="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gray-200 animate-pulse"
              />
              <p className="mt-3 text-lg font-semibold">
                {payload.driver?.firstName} {payload.driver?.lastName}
              </p>
              <p className="text-gray-600 text-sm">{payload.driver?.email}</p>
              <p className="text-gray-500 text-sm">{formatPhone(payload.driver?.phone)}</p>
              <Link className="bg-indigo-100 px-2 py-1 mt-2 font-semibold rounded-full text-sm text-indigo-500  " to={`/tracking/driver/${payload.driver?._id}/profile/overview`}>View Detail</Link>


            </div>

            {/* Delivery Info */}
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Order + QR */}
              <div className="p-4 rounded-xl border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-col">
                  <div className="flex justify-center sm:justify-end">
                    {payload.route?.qrCode ? (
                      <img
                        src={payload.route.qrCode}
                        alt="QR Code"
                        className="w-24 h-24 sm:w-32 sm:h-32 object-contain border rounded-md"
                      />
                    ) : (
                      <p className="text-gray-500 text-xs">No QR code</p>
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Order #</p>
                    <p onClick={() => openDrawer(payload.delivery?.job)} className="text-base font-bold">{payload.delivery?.job}</p>
                    <p className="mt-2 text-sm text-gray-600">
                      Picked by: <strong>{payload.parcelPickedBy}</strong>
                    </p>
                    <p className="text-xs text-gray-500 mt-2">Tracking ID</p>
                    <p className="font-semibold tracking-wide">{payload.driver?.trackingId}</p>
                  </div>
                </div>


              </div>

              {/* Status + Payment */}
              <div className="p-4 rounded-xl border shadow-sm flex flex-col justify-between gap-4">
                <div>
                  <p className="text-xs text-gray-500">Status</p>
                  <span className="inline-block mt-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                    {payload.delivery.status}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Completed At</p>
                  <span className="inline-block mt-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                    {payload.delivery.completedAt
                      ? new Date(payload.delivery.completedAt as string).toLocaleString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })
                      : "—"}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Payment</p>
                  <span className="inline-block mt-1 px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                    {payload.delivery.paymentStatus}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Distance</p>
                  <span className="inline-block mt-1 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                    {payload.route.distance?.toFixed(1)} km
                  </span>
                </div>
              </div>
            </div>

            {/* Current Task */}
            <div className="p-4 rounded-xl border shadow-sm">
              <h4 className="font-semibold mb-3">Current Task</h4>
              <div className="grid gap-4 sm:grid-cols-2 text-sm">
                <div>
                  <p className="text-gray-500">Pickup</p>
                  <p className="font-medium">{payload.currentTaskDetails.pickupLocation || "—"}</p>
                  <p className="text-gray-500 mt-1">Time</p>
                  <p className="font-medium">{payload.currentTaskDetails.pickupTime || "—"}</p>
                </div>
                <div>
                  <p className="text-gray-500">Delivery</p>
                  <p className="font-medium">{payload.currentTaskDetails.deliveryLocation || "—"}</p>
                  <p className="text-gray-500 mt-1">Time</p>
                  <p className="font-medium">{payload.currentTaskDetails.deliveryTime || "—"}</p>
                </div>
              </div>
            </div>

            {/* Route Map */}
            <div>
              <h4 className="font-semibold mb-3">Route Map</h4>
              <div className="rounded-lg overflow-hidden border">
                <ParcelMap cars={cars} encodedPolyline={payload.route.polyline || undefined} />
              </div>

              <div className="flex flex-wrap sm:flex-nowrap justify-between gap-4 mt-4 rounded-md border p-3 text-sm">
                <div>
                  <p className="text-xs text-gray-500">Distance</p>
                  <p>{payload.route?.distance} km</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Pickup Time</p>
                  <p>
                    {payload.route.pickupTime
                      ? new Date(payload.route.pickupTime as string).toLocaleString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })
                      : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Delivery Time</p>
                  <p>
                    {payload.route.deliveryTime
                      ? new Date(payload.route.deliveryTime as string).toLocaleString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })
                      : "—"}
                  </p>
                </div>
              </div>
            </div>

            {/* Photos */}
            {payload.delivery.photos && (
              <div className="p-4 rounded-xl border shadow-sm">
                <h4 className="font-semibold mb-3">Photos</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {Object.entries(payload.delivery.photos).map(([label, url]) =>
                    url ? (
                      <div key={label}>
                        <p className="text-xs text-gray-500 mb-1">{label}</p>
                        <SignedPhoto value={url as string} alt={label} />
                      </div>
                    ) : null
                  )}
                </div>
              </div>
            )}

            {/* Pricing */}
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { label: "Listed Price", value: payload.prices.routeListPrice },
                { label: "Driver Earnings", value: payload.prices.driverEarnings },
                { label: "Platform Fee", value: payload.prices.platformFee },
              ].map(({ label, value }) => (
                <div key={label} className="p-4 rounded-xl border shadow-sm text-center">
                  <p className="text-xs text-gray-500">{label}</p>
                  <p className="text-xl font-bold">{value != null ? `£${value}` : "—"}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      {/* Drawer (like TrackOrderDrawer) */}
      {selectedOrderId && (
        <OrderDetail
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          orderId={selectedOrderId}
        />
      )}
    </div>
  );
};
