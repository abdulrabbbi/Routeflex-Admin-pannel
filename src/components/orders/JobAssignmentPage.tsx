import React, { useEffect, useMemo, useState } from "react";
import apiClient from "../../api/api"; // ← path as in your project
import { Button } from "../../components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/Dialog";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getImageUrl } from "../../utils/getImageUrl";
import {
  FiPackage,
  FiMapPin,
  FiClock,
  FiSearch,
  FiUser,
  FiPhone,
  FiX,
} from "react-icons/fi";
import { EmptyStateRow } from "../../components/ui/shared/EmptyStateRow";

type Job = {
  _id: string;
  status: string;
  route: {
    pickupTime: string;
    deliveryTime: string;
    startDescription: string;
    startAddress: {
      street: string;
      city: string;
      postCode: string;
      country: string;
    };
    endLocations: { formattedAddress: string; description: string }[];
    packageType: string;
    packageCategory: string;
    packageWeight: number;
    packageSize: string;
  };
};

type Driver = {
  _id: string;
  firstName: string;
  lastName: string;
  phone: string;
  profilePicture?: string;
  vehicle?: { make?: string; model?: string };
};

type JobsResponse = {
  status: string;
  results: number;
  page: number;
  totalPages: number;
  totalJobs?: number;
  data: { jobs: Job[] };
};

type DriversResponse = {
  status: string;
  results: number;
  page: number;
  totalPages: number;
  data: { drivers: Driver[] };
};

const TablePager: React.FC<{
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
  disabled?: boolean;
}> = ({ page, totalPages, onPrev, onNext, disabled }) => (
  <div className="flex items-center gap-3">
    <Button
      disabled={disabled || page <= 1}
      onClick={onPrev}
      className={`px-3 py-1.5 rounded-lg border text-sm font-medium ${
        page <= 1 || disabled
          ? "bg-gray-200 text-gray-500"
          : "bg-white hover:bg-gray-50"
      }`}
    >
      ← Previous
    </Button>
    <span className="text-sm text-gray-600">
      Page <strong>{Math.max(page, 1)}</strong> of{" "}
      <strong>{Math.max(totalPages || 1, 1)}</strong>
    </span>
    <Button
      disabled={disabled || page >= (totalPages || 1)}
      onClick={onNext}
      className={`px-3 py-1.5 rounded-lg border text-sm font-medium ${
        page >= (totalPages || 1) || disabled
          ? "bg-gray-200 text-gray-500"
          : "bg-white hover:bg-gray-50"
      }`}
    >
      Next →
    </Button>
  </div>
);

const Avatar: React.FC<{ src?: string | null; name: string }> = ({
  src,
  name,
}) => {
  const initials = useMemo(
    () =>
      name
        .split(" ")
        .map((n) => n.charAt(0))
        .slice(0, 2)
        .join("")
        .toUpperCase() || "NA",
    [name]
  );

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className="w-9 h-9 rounded-full object-cover mx-auto"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).style.display = "none";
        }}
      />
    );
  }

  return (
    <div className="w-9 h-9 rounded-full bg-gray-200 text-gray-700 grid place-items-center mx-auto text-xs font-semibold">
      {initials}
    </div>
  );
};

const formatDT = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });

const JobAssignmentPage: React.FC = () => {
  // Jobs list state
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobsPage, setJobsPage] = useState(1);
  const [jobsLimit, setJobsLimit] = useState(10);
  const [jobsTotalPages, setJobsTotalPages] = useState(1);
  const [jobsTotal, setJobsTotal] = useState<number | undefined>(undefined);
  const [jobsLoading, setJobsLoading] = useState(false);

  // Drivers modal state
  const [open, setOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [driversPage, setDriversPage] = useState(1);
  const [driversLimit, setDriversLimit] = useState(10);
  const [driversTotalPages, setDriversTotalPages] = useState(1);
  const [driverQuery, setDriverQuery] = useState("");
  const [driversLoading, setDriversLoading] = useState(false);
  const [assigningId, setAssigningId] = useState<string | null>(null);

  // ---- Data Fetchers ----
  const loadJobs = async (page = jobsPage, limit = jobsLimit) => {
    setJobsLoading(true);
    try {
      // Only jobs that are assignable: available + approved
      const res = await apiClient.get<JobsResponse>("/jobs/admin/jobs/available", {
        params: {
          page,
          limit,
          status: "available",
          approvalStatus: "approved",
        },
      });
      setJobs(res.data?.data?.jobs || []);
      setJobsPage(res.data?.page || page);
      setJobsTotalPages(res.data?.totalPages || 1);
      if (typeof res.data?.totalJobs === "number")
        setJobsTotal(res.data.totalJobs);
    } catch {
      toast.error("Failed to load jobs");
      setJobs([]);
      setJobsTotalPages(1);
    } finally {
      setJobsLoading(false);
    }
  };

  const loadDrivers = async (page = driversPage, limit = driversLimit) => {
    setDriversLoading(true);
    try {
      const res = await apiClient.get<DriversResponse>(
        `/users/drivers/active?page=${page}&limit=${limit}`
      );
      setDrivers(res.data?.data?.drivers || []);
      setDriversPage(res.data?.page || page);
      setDriversTotalPages(res.data?.totalPages || 1);
    } catch {
      toast.error("Failed to load drivers");
      setDrivers([]);
      setDriversTotalPages(1);
    } finally {
      setDriversLoading(false);
    }
  };

  // ---- Effects ----
  useEffect(() => {
    loadJobs(1, jobsLimit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobsLimit]);

  useEffect(() => {
    loadJobs(jobsPage, jobsLimit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobsPage]);

  useEffect(() => {
    if (open) {
      loadDrivers(1, driversLimit);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, driversLimit]);

  useEffect(() => {
    if (open) loadDrivers(driversPage, driversLimit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [driversPage]);

  // ---- Assign ----
  const assignJob = async (driverId: string) => {
    if (!selectedJob) return;
    try {
      setAssigningId(driverId);
      await apiClient.post(`/jobs/admin/jobs/${selectedJob._id}/assign`, {
        driverId,
      });
      toast.success("Job assigned successfully");
      setOpen(false);
      setSelectedJob(null);
      // Refresh jobs; if last item on page, keep page but allow empty-state
      loadJobs(jobsPage, jobsLimit);
    } catch {
      toast.error("Failed to assign job");
    } finally {
      setAssigningId(null);
    }
  };

  // ---- Derived / helpers ----
  const filteredDrivers = useMemo(() => {
    const q = driverQuery.trim().toLowerCase();
    if (!q) return drivers;
    return drivers.filter((d) => {
      const name = `${d.firstName || ""} ${d.lastName || ""}`.toLowerCase();
      return name.includes(q) || (d.phone || "").toLowerCase().includes(q);
    });
  }, [driverQuery, drivers]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#22c55e]">
            📦 Available Orders
          </h1>
          <p className="text-sm text-gray-500">
            Assign open jobs to active drivers in a couple of clicks.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Rows:</label>
            <select
              value={jobsLimit}
              onChange={(e) => {
                setJobsLimit(Number(e.target.value));
                setJobsPage(1);
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
          <TablePager
            page={jobsPage}
            totalPages={jobsTotalPages}
            onPrev={() => setJobsPage((p) => Math.max(1, p - 1))}
            onNext={() => setJobsPage((p) => p + 1)}
            disabled={jobsLoading}
          />
        </div>
      </div>

      {/* Jobs Table */}
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead>
              <tr className="bg-[#f0fdf4]">
                {["Job", "Route", "Package", "Schedule", "Action"].map((h) => (
                  <th
                    key={h}
                    className={`px-4 py-3 text-[#22c55e] uppercase text-xs ${
                      h === "Action" ? "text-center" : "text-left"
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {jobsLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={`sk-${i}`} className="animate-pulse">
                    <td className="px-4 py-4">
                      <div className="h-4 w-28 bg-gray-200 rounded" />
                      <div className="h-3 w-40 bg-gray-100 rounded mt-2" />
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-4 w-56 bg-gray-200 rounded" />
                      <div className="h-3 w-64 bg-gray-100 rounded mt-2" />
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-4 w-40 bg-gray-200 rounded" />
                      <div className="h-3 w-28 bg-gray-100 rounded mt-2" />
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-4 w-48 bg-gray-200 rounded" />
                      <div className="h-3 w-40 bg-gray-100 rounded mt-2" />
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="h-9 w-24 bg-gray-200 rounded-lg inline-block" />
                    </td>
                  </tr>
                ))
              ) : jobs.length === 0 ? (
                <EmptyStateRow
                  colSpan={5}
                  title="No available jobs at the moment"
                  hint="Check back later or refresh to see new jobs."
                />
              ) : (
                jobs.map((job) => {
                  const idShort = `#${job._id.slice(-6).toUpperCase()}`;
                  const pickup =
                    `${job.route.startDescription}, ${job.route.startAddress.city}`.trim();
                  const delivery = job.route.endLocations
                    .map((l) => l.formattedAddress)
                    .join(", ");

                  return (
                    <tr key={job._id} className="hover:bg-gray-50">
                      {/* Job */}
                      <td className="px-4 py-4 align-top">
                        <div className="font-semibold text-gray-800">
                          {idShort}
                        </div>
                        <div className="mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
                          {job.status || "available"}
                        </div>
                      </td>

                      {/* Route */}
                      <td className="px-4 py-4">
                        <div className="flex items-start gap-2">
                          <FiMapPin className="mt-1 shrink-0 text-gray-400" />
                          <div className="space-y-1">
                            <div className="text-gray-800">
                              <span className="font-medium">Pickup:</span>{" "}
                              {pickup}
                            </div>
                            <div className="text-gray-800">
                              <span className="font-medium">Delivery:</span>{" "}
                              {delivery}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Package */}
                      <td className="px-4 py-4">
                        <div className="flex items-start gap-2">
                          <FiPackage className="mt-1 shrink-0 text-gray-400" />
                          <div className="space-y-1">
                            <div>
                              <span className="font-medium">Type:</span>{" "}
                              {job.route.packageType}
                            </div>
                            <div>
                              <span className="font-medium">Category:</span>{" "}
                              {job.route.packageCategory}
                            </div>
                            <div>
                              <span className="font-medium">Size:</span>{" "}
                              {job.route.packageSize}
                            </div>
                            <div>
                              <span className="font-medium">Weight:</span>{" "}
                              {job.route.packageWeight} kg
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Schedule */}
                      <td className="px-4 py-4">
                        <div className="flex items-start gap-2">
                          <FiClock className="mt-1 shrink-0 text-gray-400" />
                          <div className="space-y-1">
                            <div>
                              <span className="font-medium">Pickup:</span>{" "}
                              {formatDT(job.route.pickupTime)}
                            </div>
                            <div>
                              <span className="font-medium">Delivery:</span>{" "}
                              {formatDT(job.route.deliveryTime)}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Action */}
                      <td className="px-4 py-4 text-center">
                        <Button
                          onClick={() => {
                            setSelectedJob(job);
                            setOpen(true);
                          }}
                          className="bg-[#22c55e] text-white px-4 py-2 text-sm hover:bg-[#16a34a] rounded-lg"
                        >
                          Assign
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer summary */}
        <div className="px-4 py-3 flex items-center justify-between text-xs text-gray-500">
          <span>
            Showing <strong>{jobs.length}</strong>
            {typeof jobsTotal === "number" ? (
              <>
                {" "}
                of <strong>{jobsTotal}</strong>
              </>
            ) : null}{" "}
            jobs
          </span>
        </div>
      </div>

      {/* Assign Dialog */}
      <Dialog
        open={open}
        onOpenChange={(o) => {
          setOpen(o);
          if (!o) {
            setSelectedJob(null);
            setDriverQuery("");
            setDriversPage(1);
          }
        }}
      >
        <DialogContent className="max-w-3xl bg-white rounded-2xl p-0 shadow-2xl">
          <DialogHeader className="px-6 pt-5 pb-4 border-b">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <DialogTitle className="text-lg font-semibold text-gray-900">
                  Select Driver
                </DialogTitle>

                {selectedJob && (
                  <div className="mt-2 text-sm text-gray-600">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 text-gray-700">
                        <FiPackage /> {selectedJob.route.packageCategory} (
                        {selectedJob.route.packageType})
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 text-gray-700">
                        <FiMapPin /> {selectedJob.route.startAddress.city}
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 text-gray-700">
                        <FiClock /> {formatDT(selectedJob.route.pickupTime)} →{" "}
                        {formatDT(selectedJob.route.deliveryTime)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* right: close button */}
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                  value={driverQuery}
                  onChange={(e) => setDriverQuery(e.target.value)}
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
                <TablePager
                  page={driversPage}
                  totalPages={driversTotalPages}
                  onPrev={() => setDriversPage((p) => Math.max(1, p - 1))}
                  onNext={() => setDriversPage((p) => p + 1)}
                  disabled={driversLoading}
                />
              </div>
            </div>

            {/* Drivers Table */}
            <div className="bg-white rounded-xl border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead>
                    <tr className="bg-[#f0fdf4]">
                      {[
                        "Profile",
                        "Driver ID",
                        "Full Name",
                        "Phone",
                        "Vehicle",
                        "Actions",
                      ].map((h, i) => (
                        <th
                          key={i}
                          className={`px-4 py-2 text-[#22c55e] uppercase text-xs ${
                            h === "Actions" ? "text-center" : "text-left"
                          }`}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {driversLoading ? (
                      Array.from({ length: 4 }).map((_, i) => (
                        <tr key={`ds-${i}`} className="animate-pulse">
                          <td className="px-4 py-3">
                            <div className="w-9 h-9 rounded-full bg-gray-200" />
                          </td>
                          <td className="px-4 py-3">
                            <div className="h-4 w-20 bg-gray-200 rounded" />
                          </td>
                          <td className="px-4 py-3">
                            <div className="h-4 w-32 bg-gray-200 rounded" />
                          </td>
                          <td className="px-4 py-3">
                            <div className="h-4 w-28 bg-gray-200 rounded" />
                          </td>
                          <td className="px-4 py-3">
                            <div className="h-4 w-28 bg-gray-200 rounded" />
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="h-9 w-24 bg-gray-200 rounded-lg inline-block" />
                          </td>
                        </tr>
                      ))
                    ) : filteredDrivers.length === 0 ? (
                      <EmptyStateRow
                        colSpan={6}
                        title="No active drivers found"
                        hint="Adjust your search or try again later."
                      />
                    ) : (
                      filteredDrivers.map((driver) => {
                        const name =
                          `${driver.firstName} ${driver.lastName}`.trim();
                        const img = getImageUrl(driver.profilePicture || "");
                        const idShort = driver._id.slice(-6).toUpperCase();

                        return (
                          <tr key={driver._id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-center">
                              <Avatar src={img} name={name || "Driver"} />
                            </td>
                            <td className="px-4 py-3 text-gray-700">
                              {idShort}
                            </td>
                            <td className="px-4 py-3 text-gray-800">
                              <span className="inline-flex items-center gap-1.5">
                                <FiUser className="text-gray-400" />
                                {name || "—"}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-gray-700">
                              <span className="inline-flex items-center gap-1.5">
                                <FiPhone className="text-gray-400" />
                                {driver.phone || "—"}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-gray-700">
                              {driver.vehicle?.make || driver.vehicle?.model ? (
                                <>
                                  {driver.vehicle?.make} {driver.vehicle?.model}
                                </>
                              ) : (
                                "—"
                              )}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <Button
                                onClick={() => assignJob(driver._id)}
                                disabled={assigningId === driver._id}
                                className="bg-[#22c55e] text-white px-4 py-2 text-sm hover:bg-[#16a34a] rounded-lg"
                              >
                                {assigningId === driver._id
                                  ? "Assigning…"
                                  : "Assign"}
                              </Button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Drivers footer summary */}
              <div className="px-4 py-3 text-xs text-gray-500 flex items-center justify-between">
                <span>
                  Showing <strong>{filteredDrivers.length}</strong>{" "}
                  {driverQuery ? "(filtered)" : ""} driver(s)
                </span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default JobAssignmentPage;
