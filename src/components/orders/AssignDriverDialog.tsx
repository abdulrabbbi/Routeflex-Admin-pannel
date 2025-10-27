import React, { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/Dialog";
import { Button } from "../../components/ui/Button";
import { toast } from "react-hot-toast";
import apiClient from "../../api/api";
import { FiSearch, FiUser, FiPhone, FiX } from "react-icons/fi";
import { MdCheck } from "react-icons/md";
import { EmptyStateRow } from "../../components/ui/shared/EmptyStateRow";
import type { Job } from "../../types/job";

type Driver = {
  _id: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  vehicle?: { make?: string; model?: string };
  profilePicture?: string;
};
type DriversResponse = {
  data?: { drivers: Driver[] };
  page?: number;
  totalPages?: number;
  status: string;
};

export default function AssignDriverDialog({
  job,
  open,
  onOpenChange,
  onAssigned,
}: {
  job: Job | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onAssigned: () => void;
}) {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [driversPage, setDriversPage] = useState(1);
  const [driversLimit, setDriversLimit] = useState(10);
  const [driversTotalPages, setDriversTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [q, setQ] = useState("");

  const loadDrivers = async (page = driversPage, limit = driversLimit) => {
    setLoading(true);
    try {
      const res = await apiClient.get<DriversResponse>(
        `/users/drivers/active`,
        { params: { page, limit } }
      );
      setDrivers(res.data?.data?.drivers || []);
      setDriversPage(res.data?.page || page);
      setDriversTotalPages(res.data?.totalPages || 1);
    } catch {
      setDrivers([]);
      setDriversTotalPages(1);
      toast.error("Failed to load drivers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) loadDrivers(1, driversLimit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, driversLimit]);

  useEffect(() => {
    if (open) loadDrivers(driversPage, driversLimit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [driversPage]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return drivers;
    return drivers.filter((d) => {
      const name = `${d.firstName || ""} ${d.lastName || ""}`.toLowerCase();
      return name.includes(s) || (d.phone || "").toLowerCase().includes(s);
    });
  }, [q, drivers]);

  const assign = async (driverId: string) => {
    if (!job) return;
    try {
      setAssigningId(driverId);
      await apiClient.post(`/jobs/admin/jobs/${job._id}/assign`, { driverId });
      toast.success("Job assigned");
      onOpenChange(false);
      onAssigned();
    } catch {
      toast.error("Failed to assign job");
    } finally {
      setAssigningId(null);
    }
  };

  // Format a phone string like
  // "PhoneNumber(countryISOCode: GB, countryCode: +44, number: 07543410710)"
  // into "+44 07543410710 (GB)"

  function formatPhone(phoneStr: string | null | undefined): string {
    if (!phoneStr) return "—";

    const regex =
      /countryISOCode:\s*([A-Z]{2}),\s*countryCode:\s*([+\d]+),\s*number:\s*(\d+)/;

    const match = phoneStr.match(regex);
    if (!match) return phoneStr; // fallback if it doesn't match pattern

    const [, countryISO, countryCode, number] = match;
    return `${countryCode} ${number} (${countryISO})`;
  }




  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) {
          setQ("");
          setDriversPage(1);
        }
      }}
    >
      <DialogContent className="max-w-3xl bg-white rounded-2xl p-0 shadow-2xl">
        <DialogHeader className="px-6 pt-5 pb-4 border-b">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <DialogTitle className="text-lg font-semibold text-gray-900">
                Assign to Driver
              </DialogTitle>
              {job && (
                <div className="mt-1 text-sm text-gray-500">
                  Order #{job._id.slice(-6)} •{" "}
                  {job.route?.pickupTime
                    ? new Date(job.route!.pickupTime).toLocaleString()
                    : "—"}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              aria-label="Close dialog"
            >
              <FiX className="h-5 w-5" />
            </button>
          </div>
        </DialogHeader>

        <div className="px-6 py-5">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div className="relative w-full sm:max-w-xs">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                placeholder="Search driver name or phone…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Rows:</label>
                <select
                  value={driversLimit}
                  onChange={(e) => {
                    setDriversLimit(Number(e.target.value));
                    setDriversPage(1);
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
              <div className="flex items-center gap-2 text-sm">
                <button
                  className="px-3 py-1.5 rounded-lg border hover:bg-gray-50 disabled:opacity-50"
                  onClick={() => setDriversPage((p) => Math.max(1, p - 1))}
                  disabled={loading || driversPage <= 1}
                >
                  ← Prev
                </button>
                <span>
                  Page <b>{driversPage}</b> of <b>{driversTotalPages}</b>
                </span>
                <button
                  className="px-3 py-1.5 rounded-lg border hover:bg-gray-50 disabled:opacity-50"
                  onClick={() => setDriversPage((p) => p + 1)}
                  disabled={loading || driversPage >= driversTotalPages}
                >
                  Next →
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <colgroup>
                  <col className="w-[120px]" /> {/* Driver ID */}
                  <col /> {/* Full Name */}
                  <col className="w-[180px]" /> {/* Phone */}
                  <col /> {/* Vehicle */}
                  <col className="w-[140px]" /> {/* Actions */}
                </colgroup>

                <thead>
                  <tr className="bg-[#f0fdf4]">
                    {[
                      { h: "Driver ID", align: "text-center" },
                      { h: "Full Name", align: "text-left" },
                      { h: "Phone", align: "text-left" },
                      { h: "Vehicle", align: "text-left" },
                      { h: "Actions", align: "text-center" },
                    ].map(({ h, align }) => (
                      <th
                        key={h}
                        className={`px-4 py-2 uppercase text-xs text-[#22c55e] ${align}`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-8 text-center text-gray-500"
                      >
                        Loading…
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <EmptyStateRow
                      colSpan={5}
                      title="No active drivers"
                      hint="Adjust search or try later."
                    />
                  ) : (
                    filtered.map((d) => {
                      const idShort = d._id.slice(-6).toUpperCase();
                      const name =
                        `${d.firstName || ""} ${d.lastName || ""}`.trim() ||
                        "—";
                      const vehicle =
                        d.vehicle?.make || d.vehicle?.model
                          ? `${d.vehicle?.make || ""} ${d.vehicle?.model || ""
                            }`.trim()
                          : "—";

                      return (
                        <tr key={d._id} className="hover:bg-gray-50">
                          {/* Driver ID (center) */}
                          <td className="px-4 py-3 text-gray-700 text-center whitespace-nowrap font-mono">
                            {idShort}
                          </td>

                          {/* Full Name (left) */}
                          <td className="px-4 py-3 text-gray-800">
                            <span className="inline-flex items-center gap-1.5">
                              <FiUser className="text-gray-400" />
                              <span className="truncate">{name}</span>
                            </span>
                          </td>

                          {/* Phone (left, no wrap) */}
                          <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1.5">
                              <FiPhone className="text-gray-400" />
                              <span>{formatPhone(d.phone) || "—"}</span>
                            </span>
                          </td>

                          {/* Vehicle (left) */}
                          <td className="px-4 py-3 text-gray-700">
                            <span className="truncate block">{vehicle}</span>
                          </td>

                          {/* Actions (center) */}
                          <td className="px-4 py-3 text-center">
                            <Button
                              onClick={() => assign(d._id)}
                              disabled={assigningId === d._id}
                              title="Assign job to this driver"
                              className="bg-green-600 text-white px-4 py-2 text-sm hover:bg-emerald-700 rounded-lg disabled:opacity-60"
                            >
                              {assigningId === d._id ? "Assigning…" : <MdCheck className="font-bold text-md"/>}
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
