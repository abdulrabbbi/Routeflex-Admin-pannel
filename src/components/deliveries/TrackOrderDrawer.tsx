import React, { useEffect, useMemo, useRef, useState } from "react";
import { getTrackOrder } from "../../api/deliveryService";
import { TrackOrderResponse } from "../../types/deliveries";
import { IoClose } from "react-icons/io5";
import ParcelMap from "../../components/Maps/ParcelMap"; 
import { toast } from "react-hot-toast";
import { getSignedUrl, s3UrlToKey } from "../../utils/s3";
import { getImageUrl } from "../../utils/getImageUrl";

// Small helper: signed image with skeleton while resolving/loading
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
  const [resolving, setResolving] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [inView, setInView] = useState(true); // default true to avoid never-loading edge cases
  const holderRef = useRef<HTMLDivElement | null>(null);

  // Lazy-resolve only when visible to reduce work/memory
  useEffect(() => {
    const el = holderRef.current;
    if (!el) return;
    // Fallback if IntersectionObserver is unavailable
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setInView(true);
            break;
          }
        }
      },
      { root: null, rootMargin: "100px", threshold: 0.01 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    let cancelled = false;
    const v = value || "";
    const work = async () => {
      if (!inView) return; // skip until visible
      setResolving(true);
      setLoaded(false);
      try {
        if (!v) {
          if (!cancelled) {
            setSrc(null);
            setLoaded(true);
          }
          return;
        }
        const isHttp = /^https?:/i.test(v);
        const isS3Http = isHttp && /amazonaws\.com/.test(v);
        const isKeyLikely = !isHttp && !v.startsWith("/");
        if (isS3Http || isKeyLikely) {
          const key = s3UrlToKey(v);
          const cached = signedPhotoCache.get(key);
          if (cached) {
            if (!cancelled) setSrc(cached);
          } else {
            const signed = await getSignedUrl(key, 300);
            if (!cancelled) {
              const finalUrl = signed || v;
              signedPhotoCache.set(key, finalUrl);
              setSrc(finalUrl);
            }
          }
        } else {
          if (!cancelled) setSrc(getImageUrl(v) || v);
        }
        // Preload and decode to ensure on-screen swap with no flashes
        if (!cancelled) {
          const testImg = new Image();
          testImg.referrerPolicy = "no-referrer";
          testImg.decoding = "async" as any;
          testImg.src = (isS3Http || isKeyLikely) ? (signedPhotoCache.get(s3UrlToKey(v)) || v) : (getImageUrl(v) || v);
          const done = () => {
            if (!cancelled) setLoaded(true);
          };
          if (typeof (testImg as any).decode === "function") {
            (testImg as any)
              .decode()
              .then(done)
              .catch(done);
          } else {
            testImg.onload = done;
            testImg.onerror = done;
          }
        }
      } catch {
        // Fallback to original URL if signing fails (image may be public)
        if (!cancelled) setSrc(v || null);
      } finally {
        if (!cancelled) setResolving(false);
      }
    };
    void work();
    return () => {
      cancelled = true;
    };
  }, [value, inView]);

  return (
    <div ref={holderRef} className="relative">
      {/* Skeleton overlay */}
      {(!loaded || resolving || !src) && (
        <div className={`${skeletonClassName} absolute inset-0`} aria-busy="true" aria-live="polite" />
      )}
      {/* Image */}
      {src && (
        <img
          key={src}
          src={src}
          alt={alt}
          className={`${className} transition-opacity duration-200 ${loaded && !resolving ? "opacity-100" : "opacity-0"}`}
          onLoad={() => setLoaded(true)}
          onError={() => {
            setLoaded(false);
            setSrc(null);
          }}
          loading="lazy"
          decoding="async"
          fetchPriority="low"
          referrerPolicy="no-referrer"
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
  const [payload, setPayload] = useState<TrackOrderResponse["data"] | null>(
    null
  );

  useEffect(() => {
    let active = true;
    async function run() {
      if (!open) return;
      setLoading(true);
      try {
        const data = await getTrackOrder(deliveryId);
        if (active) setPayload(data);
      } catch (e: any) {
        toast.error(e?.response?.data?.message || "Failed to load delivery");
        if (active) setPayload(null);
      } finally {
        if (active) setLoading(false);
      }
    }
    run();
    return () => {
      active = false;
    };
  }, [open, deliveryId]);

  const cars = useMemo(() => {
    if (!payload?.route) return [];
    const pts: Array<{ lat: number; lng: number }> = [];

    const start = payload.route.start?.location?.coordinates;
    if (Array.isArray(start) && start.length === 2) {
      pts.push({ lng: start[0], lat: start[1] } as any);
    }
    for (const s of payload.route.stops || []) {
      const c = s.location?.coordinates;
      if (Array.isArray(c) && c.length === 2) {
        pts.push({ lng: c[0], lat: c[1] } as any);
      }
    }
    // adapt to ParcelMap prop shape:
    return pts.map((p) => ({ lat: p.lat, lng: p.lng }));
  }, [payload]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1200] flex">
      <div className="flex-1 bg-black/40" onClick={onClose} />
      <div className="w-full max-w-[720px] h-full bg-white shadow-xl overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">Parcel Details</h3>
          <button onClick={onClose} className="p-2 rounded hover:bg-gray-100">
            <IoClose size={22} />
          </button>
        </div>

        {loading ? (
          <div className="p-6">Loading…</div>
        ) : !payload ? (
          <div className="p-6 text-red-600">Failed to load data.</div>
        ) : (
          <div className="p-4 space-y-6">
            {/* Summary */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="bg-white p-4 rounded-xl border">
                <p className="text-xs font-semibold text-gray-500">Order #</p>
                <p className="text-base font-bold">{payload.orderNumber}</p>
                <div className="mt-3">
                  <p className="text-xs font-semibold text-gray-500">
                    Picked by
                  </p>
                  <p className="text-base">{payload.parcelPickedBy}</p>
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl border">
                <p className="text-xs font-semibold text-gray-500">Status</p>
                <p className="inline-block mt-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                  {payload.delivery.status}
                </p>
                <div className="mt-3 flex gap-3 text-sm">
                  <span className="px-2 py-1 rounded bg-gray-100">
                    Payment: {payload.delivery.paymentStatus}
                  </span>
                  <span className="px-2 py-1 rounded bg-gray-100">
                    Distance: {payload.route.distance?.toFixed(1)} km
                  </span>
                </div>
              </div>
            </div>

            {/* Addresses & times */}
            <div className="bg-white p-4 rounded-xl border">
              <h4 className="font-semibold mb-3">Current Task</h4>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
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

            {/* Map */}
            <div>
              <h4 className="font-semibold mb-3">Route Map</h4>
              <ParcelMap cars={cars} encodedPolyline={payload.route.polyline || undefined} />
            </div>

            {/* Photos (if present) */}
            {payload.delivery.photos && (
              <div className="bg-white p-4 rounded-xl border">
                <h4 className="font-semibold mb-3">Photos</h4>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(payload.delivery.photos).map(([k, v]) =>
                    v ? (
                      <div key={k}>
                        <p className="text-xs text-gray-500 mb-1">{k}</p>
                        <SignedPhoto value={v as string} alt={k} />
                      </div>
                    ) : null
                  )}
                </div>
              </div>
            )}

            {/* Prices */}
            <div className="grid gap-4 md:grid-cols-3">
              <div className="bg-white p-4 rounded-xl border">
                <p className="text-xs text-gray-500">Listed Price</p>
                <p className="text-xl font-bold">
                  £{payload.prices.routeListPrice ?? 0}
                </p>
              </div>
              <div className="bg-white p-4 rounded-xl border">
                <p className="text-xs text-gray-500">Driver Earnings</p>
                <p className="text-xl font-bold">
                  {payload.prices.driverEarnings != null
                    ? `£${payload.prices.driverEarnings}`
                    : "—"}
                </p>
              </div>
              <div className="bg-white p-4 rounded-xl border">
                <p className="text-xs text-gray-500">Platform Fee</p>
                <p className="text-xl font-bold">
                  {payload.prices.platformFee != null
                    ? `£${payload.prices.platformFee}`
                    : "—"}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
