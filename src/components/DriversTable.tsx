import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye } from "react-icons/fa";
import { AiFillStar } from "react-icons/ai";
import { toast } from "react-hot-toast";
import { getImageUrl } from "../utils/getImageUrl";
import { getDrivers } from "../api/deliveryService";

interface Driver {
  _id: string;
  firstName: string;
  lastName: string;
  rating: number;
  isVerified: boolean;
  createdAt: string;
  profilePicture: string;
  // optional fields if your API sends them:
  id?: string;
}

interface DriversApiResponse {
  status?: string;
  results?: number;
  page: number;
  totalPages: number;
  data: {
    users: Driver[];
  };
}

const PLACEHOLDER_AVATAR =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'><circle cx='40' cy='40' r='40' fill='#e5e7eb'/></svg>`
  );

const DriversTable: React.FC = React.memo(() => {
  const navigate = useNavigate();

  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [err, setErr] = useState<string>("");

  const fetchDrivers = useCallback(
    async (pg: number = 1, lm: number = limit) => {
      try {
        setIsLoading(true);
        setErr("");
        const res: DriversApiResponse = await getDrivers(lm, pg);
        setDrivers(res?.data?.users ?? []);
        setTotalPages(Number(res?.totalPages ?? 1));
        setPage(res?.page ?? pg);
      } catch (error) {
        setDrivers([]);
        setTotalPages(1);
        setErr("Failed to fetch drivers");
        toast.error("Failed to fetch drivers");
      } finally {
        setIsLoading(false);
      }
    },
    [limit]
  );

  useEffect(() => {
    fetchDrivers(1, limit);
  }, [fetchDrivers, limit]);

  const onPrev = () => page > 1 && fetchDrivers(page - 1);
  const onNext = () => page < totalPages && fetchDrivers(page + 1);

  // CSV export (Excel-friendly)
  const handleExport = () => {
    try {
      const headers = ["Driver ID", "Full Name", "Email", "Phone", "Verified", "Joining Date"];
      const rows = drivers.map((d) => {
        const id = (d._id || "").slice(-6).toUpperCase();
        const fullName = `${d.firstName ?? ""} ${d.lastName ?? ""}`.trim();
        const verified = d.isVerified ? "Yes" : "No";
        const joined = d.createdAt ? new Date(d.createdAt).toLocaleDateString() : "-";
        // You didn't specify email/phone in Driver interface above; add if your API returns them:
        const email = (d as any)?.email ?? "-";
        const phone = (d as any)?.phone ?? "-";
        return [id, fullName || "-", email, phone, verified, joined];
      });

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
      a.download = `drivers-page${page}-${ts}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Export failed");
    }
  };

  const tableBody = useMemo(() => {
    if (isLoading) {
      return (
        <tr>
          <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
            Loading...
          </td>
        </tr>
      );
    }

    if (err) {
      return (
        <tr>
          <td colSpan={7} className="px-4 py-6 text-center text-red-600">
            {err}
          </td>
        </tr>
      );
    }

    if (!drivers.length) {
      return (
        <tr>
          <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
            No drivers found
          </td>
        </tr>
      );
    }

    return drivers.map((driver) => {
      const displayId = driver._id?.slice(-6).toUpperCase() || "-";
      const fullName = `${driver.firstName ?? ""} ${driver.lastName ?? ""}`.trim() || "-";
      const created = driver.createdAt ? new Date(driver.createdAt).toLocaleDateString() : "-";
      const img = getImageUrl(driver.profilePicture) || PLACEHOLDER_AVATAR;

      return (
        <tr key={driver._id} className="hover:bg-gray-50">
          <td className="px-4 py-4 whitespace-nowrap text-center">
            <img
              src={img}
              alt={fullName}
              className="w-10 h-10 rounded-full object-cover inline-block bg-gray-200"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = PLACEHOLDER_AVATAR;
              }}
            />
          </td>
          <td className="px-4 py-4 text-sm text-center text-[#1e1e38]">{displayId}</td>
          <td className="px-4 py-4 text-sm text-center text-[#1e1e38]">{fullName}</td>
          <td className="px-4 py-4 text-sm text-center">
            {driver.rating ? (
              <div className="flex justify-center items-center gap-1 text-yellow-400">
                {Array.from({ length: driver.rating }, (_, i) => (
                  <AiFillStar key={i} />
                ))}
              </div>
            ) : (
              <span className="text-gray-400 italic">Not rated yet</span>
            )}
          </td>
          <td className="px-4 py-4 text-sm text-center">
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                driver.isVerified ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              }`}
            >
              {driver.isVerified ? "Verified" : "Not Verified"}
            </span>
          </td>
          <td className="px-4 py-4 text-sm text-center text-[#1e1e38]">{created}</td>
          <td className="px-4 py-4 text-sm relative text-center">
            <button
              onClick={() => navigate(`/tracking/driver/${driver._id}`)}
              className="p-2 rounded-lg hover:bg-gray-100"
              aria-label="View driver"
            >
              <FaEye className="text-[#22c55e] w-5 h-5" />
            </button>
          </td>
        </tr>
      );
    });
  }, [isLoading, err, drivers, navigate]);

  return (
    <div className="p-6">
      {/* Header bar (title + controls) */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900">Drivers</h2>

        <div className="flex items-center gap-3">
          {/* Rows per page */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Rows:</label>
            <select
              value={limit}
              onChange={(e) => {
                const newLimit = Number(e.target.value);
                setLimit(newLimit);
                // fetch page 1 with new limit
                fetchDrivers(1, newLimit);
              }}
              className="border rounded-lg px-2 py-1 text-sm"
            >
              {[10, 20, 50].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          {/* Export */}
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border bg-white hover:bg-gray-50 text-sm font-medium"
          >
            ⬇️ Export (.csv)
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-[#f0fdf4]">
                <th className="px-4 py-3 text-xs text-[#22c55e] uppercase text-center">Profile</th>
                <th className="px-4 py-3 text-xs text-[#22c55e] uppercase text-center">Driver ID</th>
                <th className="px-4 py-3 text-xs text-[#22c55e] uppercase text-center">Full Name</th>
                <th className="px-4 py-3 text-xs text-[#22c55e] uppercase text-center">Rating</th>
                <th className="px-4 py-3 text-xs text-[#22c55e] uppercase text-center">Is Verified</th>
                <th className="px-4 py-3 text-xs text-[#22c55e] uppercase text-center">Created At</th>
                <th className="px-4 py-3 text-xs text-[#22c55e] uppercase text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">{tableBody}</tbody>
          </table>
        </div>

        {/* Footer: pagination + summary */}
        <div className="px-4 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center justify-between gap-3">
              <button
                disabled={page <= 1 || isLoading}
                onClick={onPrev}
                className="px-4 py-2 rounded-lg border text-sm font-medium disabled:opacity-50 hover:bg-gray-50"
              >
                ← Previous
              </button>
              <span className="text-sm text-gray-600">
                Page <strong>{page}</strong> of <strong>{Math.max(totalPages, 1)}</strong>
              </span>
              <button
                disabled={page >= totalPages || isLoading}
                onClick={onNext}
                className="px-4 py-2 rounded-lg border text-sm font-medium disabled:opacity-50 hover:bg-gray-50"
              >
                Next →
              </button>
            </div>

            <div className="text-xs text-gray-500">
              Showing <strong>{drivers.length}</strong> item(s)
              {limit ? ` • Limit ${limit}` : ""}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default DriversTable;
