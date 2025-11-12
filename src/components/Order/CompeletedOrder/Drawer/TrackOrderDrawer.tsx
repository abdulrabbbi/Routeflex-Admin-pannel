"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { IoClose } from "react-icons/io5";
import { toast } from "react-hot-toast";
import DeliveryRouteMap from "../../../Maps/DeliveryRouteMap";
import { getTrackOrder } from "../../../../api/deliveryService";
import { TrackOrderResponse } from "../../../../types/deliveries";
import { getSignedUrl, s3UrlToKey } from "../../../../utils/s3";
import { getImageUrl } from "../../../../utils/getImageUrl";
import OrderDetail from "../../../orders/OrderDetail";

// ✅ Use YOUR refresh button component (adjust path if different)
import RefreshButton from "../../../ui/shared/RefreshButton";

// -------------------- utils --------------------
function formatDateTime(iso?: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function timeAgo(iso?: string | null) {
  if (!iso) return "—";
  const diffMs = Date.now() - new Date(iso).getTime();
  const s = Math.max(0, Math.floor(diffMs / 1000));
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  const w = Math.floor(d / 7);

  if (m < 1) return "just now";
  if (m === 1) return "1 min ago";
  if (m < 60) return `${m} mins ago`;
  if (h === 1) return "1 hr ago";
  if (h < 24) return `${h} hrs ago`;
  if (d === 1) return "1 day ago";
  if (d < 7) return `${d} days ago`;
  if (w === 1) return "1 week ago";
  if (w < 5) return `${w} weeks ago`;

  // older than ~1 month → show absolute date
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// put this near your other small utils in TrackOrderDrawer.tsx
const money2 = (v: unknown) => {
  if (v === null || v === undefined) return "—";
  const n = Number(v);
  if (Number.isNaN(n)) return "—";
  return `£${n.toFixed(2)}`;
};

// -------------------- signed-photo with skeleton --------------------
const signedPhotoCache = new Map<string, string>();

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

// -------------------- drawer --------------------
export const TrackOrderDrawer: React.FC<{
  open: boolean;
  onClose: () => void;
  deliveryId: string;
}> = ({ open, onClose, deliveryId }) => {
  const [loading, setLoading] = useState(false);
  const [payload, setPayload] = useState<TrackOrderResponse["data"] | null>(
    null
  );
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [lastFetchedAt, setLastFetchedAt] = useState<string | null>(null);

  const openDrawer = (orderId: string) => {
    setSelectedOrderId(orderId);
    setDrawerOpen(true);
  };

  const fetchOrder = async () => {
    if (!open) return;
    setLoading(true);
    try {
      const data = await getTrackOrder(deliveryId);
      setPayload(data);
      setLastFetchedAt(new Date().toISOString());
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to load delivery");
      setPayload(null);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    let active = true;
    (async () => {
      if (!open) return;
      setLoading(true);
      try {
        const data = await getTrackOrder(deliveryId);
        if (active) {
          setPayload(data);
          setLastFetchedAt(new Date().toISOString());
        }
      } catch (err: any) {
        toast.error(err?.response?.data?.message || "Failed to load delivery");
        if (active) setPayload(null);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [open, deliveryId]);

  function formatPhone(phoneStr: string | null | undefined): string {
    if (!phoneStr) return "—";
    const regex =
      /countryISOCode:\s*([A-Z]{2}),\s*countryCode:\s*([+\d]+),\s*number:\s*(\d+)/;
    const match = phoneStr.match(regex);
    if (!match) return phoneStr;
    const [, countryISO, countryCode, number] = match;
    return `${countryCode} ${number} (${countryISO})`;
  }

  // Build base route points [A -> stops] for start/end markers and fallback line
  const cars = useMemo(() => {
    if (!payload?.route) return [];
    const pts: Array<{ lat: number; lng: number }> = [];
    const start = payload.route.start?.location?.coordinates;
    if (Array.isArray(start) && start.length === 2) {
      pts.push({ lat: start[1], lng: start[0] });
    }
    for (const stop of payload.route.stops || []) {
      const c = stop.location?.coordinates;
      if (Array.isArray(c) && c.length === 2) {
        pts.push({ lat: c[1], lng: c[0] });
      }
    }
    return pts;
  }, [payload]);

  // History path for the polyline (with start + first stop anchors)
  const historyPath = useMemo(() => {
    if (!payload?.delivery?.locationHistory) return [];
    const hist = [...payload.delivery.locationHistory].sort(
      (a: any, b: any) => new Date(a.at).getTime() - new Date(b.at).getTime()
    );

    const points: { lat: number; lng: number }[] = [];

    const start = payload.route?.start?.location?.coordinates;
    if (Array.isArray(start) && start.length === 2) {
      points.push({ lat: start[1], lng: start[0] });
    }

    for (const h of hist) {
      const c = (h as any).coordinates || (h as any).location?.coordinates;
      if (Array.isArray(c) && c.length === 2) {
        points.push({ lat: c[1], lng: c[0] });
      }
    }

    const stop0 = payload.route?.stops?.[0]?.location?.coordinates;
    if (Array.isArray(stop0) && stop0.length === 2) {
      points.push({ lat: stop0[1], lng: stop0[0] });
    }

    // de-dup consecutive near-equal points
    const EPS = 1e-6;
    const dedup: { lat: number; lng: number }[] = [];
    for (const p of points) {
      const last = dedup[dedup.length - 1];
      if (
        !last ||
        Math.abs(last.lat - p.lat) > EPS ||
        Math.abs(last.lng - p.lng) > EPS
      ) {
        dedup.push(p);
      }
    }
    return dedup;
  }, [payload]);

  // Same as above but include timestamps for hover tooltips
  const historyPointsWithTime = useMemo(() => {
    if (!payload?.delivery?.locationHistory) return [];
    const hist = [...payload.delivery.locationHistory].sort(
      (a: any, b: any) => new Date(a.at).getTime() - new Date(b.at).getTime()
    );

    const out: Array<{ lat: number; lng: number; at?: string }> = [];

    const start = payload.route?.start?.location?.coordinates;
    if (Array.isArray(start) && start.length === 2) {
      out.push({
        lat: start[1],
        lng: start[0],
        at: (payload.route?.timestamps as any)?.startedAt,
      });
    }

    for (const h of hist) {
      const c = (h as any).coordinates || (h as any).location?.coordinates;
      if (Array.isArray(c) && c.length === 2) {
        out.push({ lat: c[1], lng: c[0], at: (h as any).at });
      }
    }

    const stop0 = payload.route?.stops?.[0]?.location?.coordinates;
    if (Array.isArray(stop0) && stop0.length === 2) {
      out.push({
        lat: stop0[1],
        lng: stop0[0],
        at: (payload.route?.timestamps as any)?.completedAt,
      });
    }

    // de-dup consecutive points
    const EPS = 1e-6;
    const dedup: Array<{ lat: number; lng: number; at?: string }> = [];
    for (const p of out) {
      const last = dedup[dedup.length - 1];
      if (
        !last ||
        Math.abs(last.lat - p.lat) > EPS ||
        Math.abs(last.lng - p.lng) > EPS
      ) {
        dedup.push(p);
      }
    }
    return dedup;
  }, [payload]);

  // optional livePoint
  const livePoint = useMemo(() => {
    const ll = payload?.delivery?.liveLocation?.coordinates as
      | number[]
      | undefined;
    if (Array.isArray(ll) && ll.length === 2) return { lat: ll[1], lng: ll[0] };
    return null;
  }, [payload]);

  // "Last updated" indicators — choose freshest timestamp
  const updatedIso =
    (payload?.delivery?.liveLocation as any)?.updatedAt ||
    (payload?.delivery?.lastKnownLocation as any)?.updatedAt ||
    (payload?.route?.timestamps as any)?.updatedAt ||
    (payload?.delivery as any)?.updatedAt ||
    lastFetchedAt;

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
          <div className="flex items-center gap-3">
            <div className="text-xs text-gray-500">
              Updated {timeAgo(updatedIso)}{" "}
              <span className="text-gray-400">
                ({formatDateTime(updatedIso)})
              </span>
            </div>

            {/* ✅ Your button */}
            <RefreshButton onClick={fetchOrder} disabled={loading} loading={loading} />

            <button
              onClick={onClose}
              className="p-2 rounded hover:bg-gray-100"
              aria-label="Close"
            >
              <IoClose size={22} />
            </button>
          </div>
        </div>

        {/* Body */}
        {loading && !payload ? (
          <div className="p-6 text-gray-500">Loading…</div>
        ) : !payload ? (
          <div className="p-6 text-red-600">Failed to load data.</div>
        ) : (
          <div className="p-4 sm:p-6 space-y-6">
            {/* Driver Profile */}
            <div className="flex flex-col items-center text-center">
              <SignedPhoto
                value={payload.driver?.profilePicture}
                alt={`${payload.driver?.firstName || ""} ${
                  payload.driver?.lastName || ""
                }`}
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover border shadow-sm"
                skeletonClassName="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gray-200 animate-pulse"
              />
              <p className="mt-3 text-lg font-semibold">
                {payload.driver?.firstName} {payload.driver?.lastName}
              </p>
              <p className="text-gray-600 text-sm">{payload.driver?.email}</p>
              <p className="text-gray-500 text-sm">
                {formatPhone(payload.driver?.phone)}
              </p>
              <Link
                className="bg-indigo-100 px-2 py-1 mt-2 font-semibold rounded-full text-sm text-indigo-500"
                to={`/tracking/driver/${payload.driver?._id}/profile/overview`}
              >
                View Detail
              </Link>
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
                  <div className="mt-3">
                    <p className="text-xs text-gray-500">Order #</p>
                    <p
                      onClick={() => openDrawer(payload.delivery?.job)}
                      className="text-base font-bold cursor-pointer"
                    >
                      {payload.delivery?.job}
                    </p>
                    <p className="mt-2 text-sm text-gray-600">
                      Picked by: <strong>{payload.parcelPickedBy}</strong>
                    </p>
                    <p className="text-xs text-gray-500 mt-2">Tracking ID</p>
                    <p className="font-semibold tracking-wide">
                      {payload.driver?.trackingId}
                    </p>
                  </div>
                </div>
              </div>

              {/* Status + Payment + Metrics */}
              <div className="p-4 rounded-xl border shadow-sm grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Status</p>
                  <span className="inline-block mt-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                    {payload.delivery.status}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Payment</p>
                  <span className="inline-block mt-1 px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                    {payload.delivery.paymentStatus}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Completed At</p>
                  <div className="mt-1 text-sm font-medium">
                    {formatDateTime(payload.delivery.completedAt as any)}
                  </div>
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
                  <p className="font-medium">
                    {payload.currentTaskDetails.pickupLocation || "—"}
                  </p>
                  <p className="text-gray-500 mt-1">Time</p>
                  <p className="font-medium">
                    {payload.currentTaskDetails.pickupTime || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Delivery</p>
                  <p className="font-medium">
                    {payload.currentTaskDetails.deliveryLocation || "—"}
                  </p>
                  <p className="text-gray-500 mt-1">Time</p>
                  <p className="font-medium">
                    {payload.currentTaskDetails.deliveryTime || "—"}
                  </p>
                </div>
              </div>
            </div>

            {/* Route Map */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold">Route Map</h4>
                <div className="text-xs text-gray-500">
                  Route updated {timeAgo(payload.route?.timestamps?.updatedAt)}{" "}
                  <span className="text-gray-400">
                    ({formatDateTime(payload.route?.timestamps?.updatedAt)})
                  </span>
                </div>
              </div>


              <div className="rounded-lg overflow-hidden border" style={{ height: 360 }}>
                {payload && (
                  <DeliveryRouteMap
                    route={payload.route as any}
                    delivery={payload.delivery as any}
                    className="w-full h-full"
                  />
                )}
              </div>

              <div className="flex flex-wrap sm:flex-nowrap justify-between gap-4 mt-4 rounded-md border p-3 text-sm">
                <div>
                  <p className="text-xs text-gray-500">Distance</p>
                  <p>{payload.route?.distance} km</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Pickup Time</p>
                  <p>{formatDateTime(payload.route.pickupTime as any)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Delivery Time</p>
                  <p>{formatDateTime(payload.route.deliveryTime as any)}</p>
                </div>
              </div>
            </div>

            {/* Scans */}
            {!!payload.delivery.scans?.length && (
              <div className="p-4 rounded-xl border shadow-sm">
                <h4 className="font-semibold mb-3">Scans</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">
                          Barcode
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">
                          Scanned At
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">
                          Ago
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {payload.delivery.scans.map((s) => (
                        <tr key={s._id}>
                          <td className="px-3 py-2 font-mono">{s.barcode}</td>
                          <td className="px-3 py-2">
                            {formatDateTime(s.scannedAt as any)}
                          </td>
                          <td className="px-3 py-2 text-gray-500">
                            {timeAgo(s.scannedAt as any)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

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
                {
                  label: "Driver Earnings",
                  value: payload.prices.driverEarnings,
                },
                { label: "Platform Fee", value: payload.prices.platformFee },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="p-4 rounded-xl border shadow-sm text-center"
                >
                  <p className="text-xs text-gray-500">{label}</p>
                  <p className="text-xl font-bold">{money2(value)}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Nested Drawer: Order Detail */}
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

export default TrackOrderDrawer;
