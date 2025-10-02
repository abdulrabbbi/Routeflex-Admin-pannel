import { Delivery, RangeFilter } from "../../types/deliveries";

export function exportDeliveriesCsv(opts: {
  deliveries: Delivery[];
  filter: RangeFilter;
  page: number;
}) {
  const { deliveries, filter, page } = opts;

  const headers = [
    "Parcel ID",
    "Driver ID",
    "Driver Name",
    "Pickup Address",
    "Delivery Address",
    "Distance (km)",
    "Package Category",
    "Delivery Status",
    "Payment Status",
  ];

  const rows = deliveries.map((d) => [
    d.deliveryId || "-",
    (d.driverId || "").slice(-6).toUpperCase(),
    d.driverFullName || "-",
    d.pickupAddress || "-",
    d.deliveryAddress || "-",
    typeof d.distance === "number" ? d.distance.toFixed(2) : "-",
    d.packageCategory || "-",
    d.deliveryStatus || "-",
    d.paymentStatus || "-",
  ]);

  const csv = [headers, ...rows]
    .map((r) =>
      r
        .map((cell) => {
          const s = String(cell ?? "");
          const escaped = s.replace(/"/g, '""');
          return /[",\n]/.test(escaped) ? `"${escaped}"` : escaped;
        })
        .join(",")
    )
    .join("\n");

  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const ts = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
  a.href = url;
  a.download = `deliveries-${filter}-page${page}-${ts}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
