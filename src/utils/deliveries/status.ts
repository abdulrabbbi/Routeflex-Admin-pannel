export function statusPillClasses(status: string) {
  const s = status?.toLowerCase();
  if (s === "completed" || s === "delivered") return "bg-green-100 text-green-700";
  if (s === "in-progress" || s === "processing") return "bg-blue-100 text-blue-700";
  if (s === "pending") return "bg-yellow-100 text-yellow-700";
  if (s === "failed" || s === "cancelled") return "bg-red-100 text-red-700";
  return "bg-gray-100 text-gray-700";
}
