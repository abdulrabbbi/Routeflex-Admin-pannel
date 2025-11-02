import React, { useEffect, useState, useCallback, useMemo } from "react";
import { toast } from "react-hot-toast";
import { AiFillStar } from "react-icons/ai";
import { approveDriver, rejectDriver, getPendingDrivers } from "../../api/deliveryService";
import { getImageUrl } from "../../utils/getImageUrl";
import { getSignedUrl, s3UrlToKey } from "../../utils/s3";
import { TableSkeleton } from "../../components/ui/shared/Skeleton";
import { EmptyStateRow } from "../../components/ui/shared/EmptyStateRow";
import TablePager from "../../components/ui/shared/TablePager";
import AvatarCell from "./AvatarCell";

interface Driver {
  _id: string;
  firstName: string;
  lastName: string;
  rating?: number;
  email?: string;
  phone?: string;
  createdAt?: string;
  profilePicture?: string | null;
}

const MIN_ROWS = 10;

const formatDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString("en-GB") : "—";

const clamp = (n: number, min = 0, max = 5) => Math.max(min, Math.min(max, n));

const PendingDriversTable: React.FC = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [err, setErr] = useState<string>("");

  const [signedMap, setSignedMap] = useState<Record<string, string>>({});

  const fetchPendingDrivers = useCallback(async () => {
    setIsLoading(true);
    setErr("");
    try {
      const res = await getPendingDrivers(page, limit);
      setDrivers(res?.data?.users || []);
      setTotalPages(res?.totalPages || 1);
    } catch (e: any) {
      setErr("Failed to fetch pending drivers");
      toast.error(e?.response?.data?.message || "Failed to load pending drivers");
      setDrivers([]);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    fetchPendingDrivers();
  }, [fetchPendingDrivers]);

  // S3 Signed URLs
  useEffect(() => {
    let aborted = false;
    const values = Array.from(
      new Set(
        (drivers || [])
          .map((d) => d.profilePicture)
          .filter((v): v is string => typeof v === "string" && v.length > 0)
      )
    );

    Promise.all(
      values.map(async (v) => {
        try {
          const key = s3UrlToKey(v);
          const url = await getSignedUrl(key, 300);
          return { original: v, url };
        } catch {
          return null;
        }
      })
    ).then((pairs) => {
      if (aborted) return;
      const next: Record<string, string> = {};
      for (const p of pairs) if (p) next[p.original] = p.url;
      if (Object.keys(next).length) setSignedMap(next);
    });

    return () => {
      aborted = true;
    };
  }, [drivers]);

  const onApprove = async (id: string) => {
    const t = toast.loading("Approving driver...");
    try {
      await approveDriver(id);
      toast.success("Driver approved");
      setDrivers((prev) => prev.filter((d) => d._id !== id));
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Approval failed");
    } finally {
      toast.dismiss(t);
    }
  };

  const onReject = async (id: string) => {
    const reason = window.prompt("Reason for rejection (optional):") || undefined;
    const t = toast.loading("Rejecting driver...");
    try {
      await rejectDriver(id, reason);
      toast.success("Driver rejected");
      setDrivers((prev) => prev.filter((d) => d._id !== id));
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Rejection failed");
    } finally {
      toast.dismiss(t);
    }
  };

  const displayRows = useMemo(() => {
    if (isLoading) return [];
    const pad = Math.max(MIN_ROWS - drivers.length, 0);
    return [...drivers, ...Array.from({ length: pad }).map(() => ({} as Driver))];
  }, [drivers, isLoading]);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4 text-gray-900">Pending Drivers</h2>

      <div className="overflow-x-auto w-full bg-white rounded-2xl border shadow-sm">
        <table className="min-w-[860px] w-full text-sm border-collapse">
          <thead>
            <tr className="bg-[#f0fdf4] text-[#22c55e] text-xs uppercase">
              <th className="px-3 py-3 text-center">Profile</th>
              <th className="px-3 py-3 text-center">Name</th>
              <th className="px-3 py-3 text-center">Email</th>
              <th className="px-3 py-3 text-center">Phone</th>
              <th className="px-3 py-3 text-center">Joined</th>
              <th className="px-3 py-3 text-center">Rating</th>
              <th className="px-3 py-3 text-center">Actions</th>
            </tr>
          </thead>

          {isLoading ? (
            <TableSkeleton rows={MIN_ROWS} columns={7} />
          ) : err ? (
            <tbody>
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-red-600">
                  {err}
                </td>
              </tr>
            </tbody>
          ) : drivers.length === 0 ? (
            <tbody>
              <tr>
                <td colSpan={7} className="py-16">
                  <div className="flex items-center justify-center">
                    <EmptyStateRow
                      colSpan={7}
                      title="No Pending Drivers Found"
                      hint="Try changing filters or refreshing."
                    />
                  </div>
                </td>
              </tr>
            </tbody>
          ) : (
            <tbody className="divide-y divide-gray-100">
              {displayRows.map((d, idx) => {
                if (!d || !d._id) {
                  return (
                    <tr key={`pad-${idx}`}>
                      {Array.from({ length: 7 }).map((_, c) => (
                        <td key={c} className="px-3 py-4">
                          <div className="h-4 w-24 bg-gray-50 rounded" />
                        </td>
                      ))}
                    </tr>
                  );
                }

                const fullName = `${d.firstName ?? ""} ${d.lastName ?? ""}`.trim() || "-";
                const imgSrc =
                  signedMap[d.profilePicture || ""] || getImageUrl(d.profilePicture || "");
                const stars = clamp(Number(d.rating || 0));
                const joined = formatDate(d.createdAt);

                return (
                  <tr key={d._id} className="hover:bg-gray-50 text-center">
                    <td className="px-3 py-3">
                      <AvatarCell fullName={fullName} src={imgSrc} size={40} />
                    </td>
                    <td className="px-3 py-3 text-gray-800">{fullName}</td>
                    <td className="px-3 py-3 text-gray-800">{d.email || "—"}</td>
                    <td className="px-3 py-3 text-gray-800">{d.phone || "—"}</td>
                    <td className="px-3 py-3 text-gray-700">{joined}</td>
                    <td className="px-3 py-3 text-gray-800">
                      {stars > 0 ? (
                        <div className="flex justify-center gap-1 text-yellow-400">
                          {Array.from({ length: stars }, (_, i) => (
                            <AiFillStar key={i} />
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">Not rated yet</span>
                      )}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => onApprove(d._id)}
                          className="h-8 w-8 flex items-center justify-center rounded-full bg-green-100 text-green-600 hover:bg-green-200"
                          title="Approve"
                        >
                          ✓
                        </button>
                        <button
                          onClick={() => onReject(d._id)}
                          className="h-8 w-8 flex items-center justify-center rounded-full bg-red-100 text-red-600 hover:bg-red-200"
                          title="Reject"
                        >
                          ✕
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          )}
        </table>

        <div className="px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 border-t text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Rows:</label>
            <select
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="border rounded-lg px-2 py-1.5 text-sm"
            >
              {[10, 20, 50].map((n) => (
                <option key={n} value={n}>
                  {n} / page
                </option>
              ))}
            </select>
          </div>

          <TablePager
            page={page}
            totalPages={totalPages}
            onPrev={() => setPage((p) => Math.max(1, p - 1))}
            onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={isLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default PendingDriversTable;
