import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye } from "react-icons/fa";
import { AiFillStar } from "react-icons/ai";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";
import { getDrivers } from "../../api/deliveryService";
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
  isVerified?: boolean;
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

/* =============== Small helpers =============== */
const formatDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString("en-GB") : "-";

const clamp = (n: number, min = 0, max = 5) => Math.max(min, Math.min(max, n));

// Cache signed avatar URLs within the session
const avatarSignedCache = new Map<string, string>();

/* =============== Skeletons =============== */
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
const DriversTable: React.FC = React.memo(() => {
  const navigate = useNavigate();

  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [err, setErr] = useState<string>("");
  const [signedMap, setSignedMap] = useState<Record<string, string>>({});

  const fetchDrivers = useCallback(
    async (pg: number, lm: number, signal?: AbortSignal) => {
      setIsLoading(true);
      setErr("");
      try {
        // your API already paginates: getDrivers(limit, page)
        const res: DriversApiResponse = await getDrivers(lm, pg);
        setDrivers(res?.data?.users ?? []);
        setTotalPages(Number(res?.totalPages ?? 1));
        setPage(res?.page ?? pg);
      } catch (e: any) {
        if (e?.name === "CanceledError" || e?.name === "AbortError") return;
        setDrivers([]);
        setTotalPages(1);
        setErr("Failed to fetch drivers");
        toast.error(e?.response?.data?.message || "Failed to fetch drivers");
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

  // Resolve signed URLs when needed: S3 HTTP URLs or raw keys (not API-relative)
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
        if (cached) {
          return { original: v, url: cached } as const;
        }
        try {
          const url = await getSignedUrl(key, 300);
          if (aborted) return null;
          avatarSignedCache.set(key, url);
          return { original: v, url } as const;
        } catch {
          return null;
        }
      });

    Promise.all(work).then((pairs) => {
      if (aborted) return;
      const next: Record<string, string> = {};
      for (const p of pairs) {
        if (p && p.url) next[p.original] = p.url;
      }
      if (Object.keys(next).length) setSignedMap((prev) => ({ ...prev, ...next }));
    });

    return () => {
      aborted = true;
    };
  }, [drivers]);

  const onPrev = useCallback(() => {
    setPage((p) => Math.max(1, p - 1));
  }, []);
  const onNext = useCallback(() => {
    setPage((p) => Math.min(totalPages || 1, p + 1));
  }, [totalPages]);

  const handleExport = useCallback(() => {
    try {
      const headers = [
        "Driver ID",
        "Full Name",
        "Email",
        "Phone",
        "Verified",
        "Joining Date",
      ];
      const rows = drivers.map((d) => {
        const id = (d._id || "").slice(-6).toUpperCase();
        const fullName =
          `${d.firstName ?? ""} ${d.lastName ?? ""}`.trim() || "-";
        const verified = d.isVerified ? "Yes" : "No";
        const joined = formatDate(d.createdAt);
        return [id, fullName, d.email || "-", d.phone || "-", verified, joined];
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

      const blob = new Blob(["\uFEFF" + csv], {
        type: "text/csv;charset=utf-8;",
      });
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
  }, [drivers, page]);

  const rows = useMemo(() => {
    if (isLoading) {
      return (
        <>
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonRow key={i} />
          ))}
        </>
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

    return drivers.map((d) => {
      const displayId = d._id?.slice(-6).toUpperCase() || "-";
      const fullName = `${d.firstName ?? ""} ${d.lastName ?? ""}`.trim() || "-";
      const created = formatDate(d.createdAt);
      const imgSrc = (() => {
        const value = d.profilePicture || "";
        if (!value) return undefined;
        const signed = signedMap[value];
        if (signed) return signed;
        const isHttp = /^https?:/i.test(value);
        const isS3Http = isHttp && /amazonaws\.com/.test(value);
        if (isS3Http) {
          // wait for signed URL; avoid initial broken load
          return undefined;
        }
        if (!isHttp && !value.startsWith("/")) {
          // raw key; wait for signing
          return undefined;
        }
        // API-relative path or other http(s)
        return getImageUrl(value);
      })();
      const stars = clamp(Number(d.rating || 0));

      return (
        <tr key={d._id} className="hover:bg-gray-50">
          {/* Avatar / Name cell */}
          <td className="px-4 py-4 text-center whitespace-nowrap">
            <div className="flex items-center justify-center gap-3">
              <AvatarCell fullName={fullName} src={imgSrc} size={40} />
              {/* Show full name next to avatar on md+ for better usability */}
              <span className="hidden md:inline text-sm text-[#1e1e38]">
                {fullName}
              </span>
            </div>
          </td>

          <td className="px-4 py-4 text-sm text-center text-[#1e1e38]">
            <Link to={`driver/${d._id}/profile/overview`}>
              {displayId}
            </Link>
          </td>

          {/* On small screens we still need the name column visible */}
          <td className="px-4 py-4 text-sm text-center text-[#1e1e38] md:hidden">
            {fullName}
          </td>
          <td className="px-4 py-4 text-sm text-center text-[#1e1e38] hidden md:table-cell">
            {fullName}
          </td>

          <td className="px-4 py-4 text-sm text-center">
            {stars > 0 ? (
              <div className="flex justify-center items-center gap-1 text-yellow-400">
                {Array.from({ length: stars }, (_, i) => (
                  <AiFillStar key={i} />
                ))}
              </div>
            ) : (
              <span className="text-gray-400 italic">Not rated yet</span>
            )}
          </td>

          <td className="px-4 py-4 text-sm text-center">
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${d.isVerified
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
                }`}
            >
              {d.isVerified ? "Verified" : "Not Verified"}
            </span>
          </td>

          <td className="px-4 py-4 text-sm text-center text-[#1e1e38]">
            {created}
          </td>

          <td className="px-4 py-4 text-sm text-center">
            <button
              onClick={() => navigate(`/tracking/driver/${d._id}/profile/overview`)}
              className="p-2 rounded-lg hover:bg-gray-100"
              aria-label="View driver details"
            >
              <FaEye className="text-[#22c55e] w-5 h-5" />
            </button>
          </td>
        </tr>
      );
    });
  }, [drivers, err, isLoading, navigate]);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900">Drivers</h2>

        <div className="flex items-center gap-3">
          {/* Rows per page */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Rows:</label>
            <select
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
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
                <th className="px-4 py-3 text-xs text-[#22c55e] uppercase text-center">
                  Profile
                </th>
                <th className="px-4 py-3 text-xs text-[#22c55e] uppercase text-center">
                  Driver ID
                </th>
                <th className="px-4 py-3 text-xs text-[#22c55e] uppercase text-center">
                  Full Name
                </th>
                <th className="px-4 py-3 text-xs text-[#22c55e] uppercase text-center">
                  Rating
                </th>
                <th className="px-4 py-3 text-xs text-[#22c55e] uppercase text-center">
                  Verified
                </th>
                <th className="px-4 py-3 text-xs text-[#22c55e] uppercase text-center">
                  Created At
                </th>
                <th className="px-4 py-3 text-xs text-[#22c55e] uppercase text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">{rows}</tbody>
          </table>
        </div>

        {/* Footer */}
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
              {limit ? ` • Limit ${limit}` : ""}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default DriversTable;
