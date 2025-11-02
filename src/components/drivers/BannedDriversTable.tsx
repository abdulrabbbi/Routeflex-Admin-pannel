import React, { useEffect, useState, useCallback, useMemo } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { FaUndo } from "react-icons/fa";
import { getBannedDrivers } from "../../api/deliveryService";
import TablePager from "../../components/ui/shared/TablePager";
import AvatarCell from "./AvatarCell";
import { getImageUrl } from "../../utils/getImageUrl";
import { getSignedUrl, s3UrlToKey } from "../../utils/s3";

/* =============== Types =============== */
interface Driver {
  _id: string;
  firstName: string;
  lastName: string;
  rating?: number;
  createdAt?: string;
  profilePicture?: string | null;
  email?: string;
  phone?: string;
}
interface DriversApiResponse {
  page: number;
  totalPages: number;
  data: { users: Driver[] };
  status?: string;
  results?: number;
}

/* =============== Helpers =============== */
const formatDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString("en-GB") : "-";

const clamp = (n: number, min = 0, max = 5) => Math.max(min, Math.min(max, n));

const avatarSignedCache = new Map<string, string>();

/* =============== Skeleton =============== */
const SkeletonRow: React.FC = () => (
  <tr className="animate-pulse">
    {Array.from({ length: 7 }).map((_, i) => (
      <td key={i} className="px-4 py-4">
        <div className="h-4 rounded bg-gray-200 w-full" />
      </td>
    ))}
  </tr>
);

/* =============== Component =============== */
const BannedDriversTable: React.FC = React.memo(() => {
  const navigate = useNavigate();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [err, setErr] = useState("");
  const [signedMap, setSignedMap] = useState<Record<string, string>>({});

  const fetchDrivers = useCallback(
    async (pg: number, lm: number, signal?: AbortSignal) => {
      setIsLoading(true);
      setErr("");
      try {
        const res: DriversApiResponse = await getBannedDrivers(pg, lm);
        setDrivers(res?.data?.users ?? []);
        setTotalPages(Number(res?.totalPages ?? 1));
        setPage(res?.page ?? pg);
      } catch (e: any) {
        if (e?.name === "CanceledError" || e?.name === "AbortError") return;
        setDrivers([]);
        setTotalPages(1);
        setErr("Failed to fetch banned drivers");
        toast.error(e?.response?.data?.message || "Failed to fetch banned drivers");
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    const ctrl = new AbortController();
    fetchDrivers(page, limit, ctrl.signal);
    return () => ctrl.abort();
  }, [fetchDrivers, page, limit]);

  // Sign profile pics (same logic)
  useEffect(() => {
    let aborted = false;
    const values = Array.from(
      new Set(
        (drivers || [])
          .map((d) => d.profilePicture)
          .filter((v): v is string => typeof v === "string" && v.length > 0)
      )
    );
    const needsSigning = (v: string) => {
      const isHttp = /^https?:/i.test(v);
      const isS3Http = isHttp && /amazonaws\.com/.test(v);
      const isKeyLikely = !isHttp && !v.startsWith("/");
      return isS3Http || isKeyLikely;
    };
    const work = values
      .filter((v) => needsSigning(v))
      .map(async (v) => {
        const key = s3UrlToKey(v);
        const cached = avatarSignedCache.get(key);
        if (cached) return { original: v, url: cached };
        try {
          const url = await getSignedUrl(key, 300);
          if (aborted) return null;
          avatarSignedCache.set(key, url);
          return { original: v, url };
        } catch {
          return null;
        }
      });
    Promise.all(work).then((pairs) => {
      if (aborted) return;
      const next: Record<string, string> = {};
      for (const p of pairs) if (p && p.url) next[p.original] = p.url;
      if (Object.keys(next).length) setSignedMap((prev) => ({ ...prev, ...next }));
    });
    return () => {
      aborted = true;
    };
  }, [drivers]);

  const onPrev = () => setPage((p) => Math.max(1, p - 1));
  const onNext = () => setPage((p) => Math.min(totalPages || 1, p + 1));

  const rows = useMemo(() => {
    if (isLoading) return Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />);
    if (err)
      return (
        <tr>
          <td colSpan={7} className="px-4 py-6 text-center text-red-600">
            {err}
          </td>
        </tr>
      );
    if (!drivers.length)
      return (
        <tr>
          <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
            No banned drivers found
          </td>
        </tr>
      );

    return drivers.map((d) => {
      const fullName = `${d.firstName ?? ""} ${d.lastName ?? ""}`.trim() || "-";
      const created = formatDate(d.createdAt);
      const imgSrc =
        signedMap[d.profilePicture || ""] || getImageUrl(d.profilePicture || "");
      return (
        <tr key={d._id} className="hover:bg-gray-50">
          <td className="px-4 py-4 text-center">
            <div className="flex items-center justify-center gap-3">
              <AvatarCell fullName={fullName} src={imgSrc} size={40} />
              <span className="hidden md:inline text-sm text-[#1e1e38]">
                {fullName}
              </span>
            </div>
          </td>
          <td className="px-4 py-4 text-sm text-center text-[#1e1e38]">
            {d.email || "-"}
          </td>
          <td className="px-4 py-4 text-sm text-center text-[#1e1e38]">
            {d.phone || "-"}
          </td>
          <td className="px-4 py-4 text-sm text-center text-[#1e1e38]">
            {created}
          </td>
          <td className="px-4 py-4 text-sm text-center">
            <button
              onClick={() => toast.success("Restore logic here")}
              className="p-2 rounded-lg hover:bg-gray-100"
              aria-label="Restore driver"
            >
              <FaUndo className="text-blue-600 w-5 h-5" />
            </button>
          </td>
        </tr>
      );
    });
  }, [drivers, err, isLoading, signedMap]);

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900">
          Banned Drivers
        </h2>
      </div>

      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-[#f0fdf4]">
                <th className="px-4 py-3 text-xs text-[#22c55e] uppercase text-center">
                  Profile
                </th>
                <th className="px-4 py-3 text-xs text-[#22c55e] uppercase text-center">
                  Email
                </th>
                <th className="px-4 py-3 text-xs text-[#22c55e] uppercase text-center">
                  Phone
                </th>
                <th className="px-4 py-3 text-xs text-[#22c55e] uppercase text-center">
                  Banned At
                </th>
                <th className="px-4 py-3 text-xs text-[#22c55e] uppercase text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">{rows}</tbody>
          </table>
        </div>

        <div className="px-4 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <TablePager
              page={page}
              totalPages={totalPages}
              onPrev={onPrev}
              onNext={onNext}
              disabled={isLoading}
            />
            <div className="text-xs text-gray-500">
              Showing <strong>{drivers.length}</strong> item(s)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default BannedDriversTable;
