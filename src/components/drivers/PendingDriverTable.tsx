import React, { useEffect, useState, useCallback, useMemo } from "react";
import { toast } from "react-hot-toast";
import { FaEye } from "react-icons/fa";
import { AiFillStar } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import { approveDriver, rejectDriver, getPendingDrivers } from "../../api/deliveryService";
import TablePager from "../../components/ui/shared/TablePager";
import AvatarCell from "./AvatarCell";
import { getImageUrl } from "../../utils/getImageUrl";
import { getSignedUrl, s3UrlToKey } from "../../utils/s3";

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

const formatDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString("en-GB") : "-";

const clamp = (n: number, min = 0, max = 5) => Math.max(min, Math.min(max, n));

const PendingDriversTable: React.FC = () => {
  const navigate = useNavigate();

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
      const res = await getPendingDrivers(page, limit); // ✅ your API call
      setDrivers(res?.data?.users || []);
      setTotalPages(res?.totalPages || 1);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to load pending drivers");
      setErr("Failed to fetch pending drivers");
      setDrivers([]);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    fetchPendingDrivers();
  }, [fetchPendingDrivers]);

  // Sign S3 URLs
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

  const rows = useMemo(() => {
    if (isLoading) {
      return (
        <tr>
          <td colSpan={8} className="px-4 py-6 text-center text-gray-500">
            Loading pending drivers...
          </td>
        </tr>
      );
    }

    if (err) {
      return (
        <tr>
          <td colSpan={8} className="px-4 py-6 text-center text-red-600">
            {err}
          </td>
        </tr>
      );
    }

    if (!drivers.length) {
      return (
        <tr>
          <td colSpan={8} className="px-4 py-6 text-center text-gray-500">
            No pending drivers found
          </td>
        </tr>
      );
    }

    return drivers.map((d) => {
      const fullName = `${d.firstName ?? ""} ${d.lastName ?? ""}`.trim() || "-";
      const imgSrc =
        signedMap[d.profilePicture || ""] || getImageUrl(d.profilePicture || "");
      const stars = clamp(Number(d.rating || 0));
      const joined = formatDate(d.createdAt);

      return (
        <tr key={d._id} className="hover:bg-gray-50">
          <td className="px-4 py-4 text-center">
            <AvatarCell fullName={fullName} src={imgSrc} size={40} />
          </td>
          <td className="px-4 py-4 text-center text-sm">{fullName}</td>
          <td className="px-4 py-4 text-center text-sm">{d.email || "-"}</td>
          <td className="px-4 py-4 text-center text-sm">{d.phone || "-"}</td>
          <td className="px-4 py-4 text-center text-sm">{joined}</td>
          <td className="px-4 py-4 text-center text-sm">
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
          <td className="px-4 py-4 text-center">
            <button
              onClick={() => onApprove(d._id)}
              className="px-3 py-1 rounded-lg bg-green-100 text-green-700 text-sm hover:bg-green-200 mr-2"
            >
              Approve
            </button>
            <button
              onClick={() => onReject(d._id)}
              className="px-3 py-1 rounded-lg bg-red-100 text-red-700 text-sm hover:bg-red-200"
            >
              Reject
            </button>
          </td>
        </tr>
      );
    });
  }, [drivers, isLoading, err, signedMap]);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4 text-gray-900">Pending Drivers</h2>

      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-[#f0fdf4]">
                <th className="px-4 py-3 text-xs text-[#22c55e] uppercase">Profile</th>
                <th className="px-4 py-3 text-xs text-[#22c55e] uppercase">Name</th>
                <th className="px-4 py-3 text-xs text-[#22c55e] uppercase">Email</th>
                <th className="px-4 py-3 text-xs text-[#22c55e] uppercase">Phone</th>
                <th className="px-4 py-3 text-xs text-[#22c55e] uppercase">Joined</th>
                <th className="px-4 py-3 text-xs text-[#22c55e] uppercase">Rating</th>
                <th className="px-4 py-3 text-xs text-[#22c55e] uppercase text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>{rows}</tbody>
          </table>
        </div>

        <div className="p-4 flex justify-between items-center">
          <TablePager
            page={page}
            totalPages={totalPages}
            onPrev={() => setPage((p) => Math.max(1, p - 1))}
            onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={isLoading}
          />
          <span className="text-xs text-gray-500">
            Showing {drivers.length} pending driver(s)
          </span>
        </div>
      </div>
    </div>
  );
};

export default PendingDriversTable;
