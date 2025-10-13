import { DeliveryRowApi, RangeFilter } from "../../types/deliveries";

export function exportDeliveriesCsv({
  deliveries,
  filter,
  page,
}: {
  deliveries: DeliveryRowApi[];
  filter: RangeFilter;
  page: number;
}) {
  const headers = [
    "Parcel ID",
    "Driver ID",
    "Driver Name",
    "Status",
    "Payment",
    "Distance (km)",
    "Package",
    "Pickup Address",
    "Delivery Address",
  ];
  const rows = deliveries.map((d) => [
    String(d.parcelId).slice(-6).toUpperCase(),
    d.driverId ?? "",
    d.driverName,
    d.status,
    d.payment,
    typeof d.distance === "number" ? d.distance.toFixed(1) : "",
    d.package,
    d.pickupAddress ?? "",
    d.deliveryAddress ?? "",
  ]);

  const csv = [headers, ...rows]
    .map((r) => r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(","))
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
