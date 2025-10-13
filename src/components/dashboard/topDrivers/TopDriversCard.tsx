import React, { useEffect, useMemo, useState } from "react";
import { AiFillStar } from "react-icons/ai";
import { BsShieldCheck, BsClockHistory } from "react-icons/bs";
import { toast } from "react-hot-toast";
import { getTopDrivers, GetTopDriversParams, TopDriver } from "../../../api/adminService";
import { getImageUrl } from "../../../utils/getImageUrl";
import { getSignedUrl, s3UrlToKey } from "../../../utils/s3";

type Props = {
  className?: string;
  initialQuery?: GetTopDriversParams; 
};

const VerifiedBadge = ({ ok }: { ok: boolean }) =>
  ok ? (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-full bg-orange-100 text-orange-800">
      <BsShieldCheck /> Verified
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-full bg-indigo-100 text-indigo-700">
      <BsClockHistory /> Pending
    </span>
  );

const Avatar: React.FC<{ name: string; src?: string | null }> = ({ name, src }) => {
  const [url, setUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!src) return setUrl(undefined);
      const isHttp = /^https?:/i.test(src);
      const isS3Http = isHttp && /amazonaws\.com/.test(src);
      const isKeyLikely = !isHttp && !src.startsWith("/");
      try {
        if (isS3Http || isKeyLikely) {
          const key = s3UrlToKey(src);
          const signed = await getSignedUrl(key, 300);
          if (!cancelled) setUrl(signed);
        } else {
          setUrl(getImageUrl(src));
        }
      } catch {
        setUrl(undefined);
      }
    })();
    return () => { cancelled = true; };
  }, [src]);

  // initials fallback
  const initials = useMemo(() => {
    const parts = name.split(" ").filter(Boolean);
    return (parts[0]?.[0] || "?") + (parts[1]?.[0] || "");
  }, [name]);

  return url ? (
    <img
      src={url}
      alt={name}
      className="w-12 h-12 rounded-full object-cover bg-gray-100"
      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
    />
  ) : (
    <div className="w-12 h-12 rounded-full bg-gray-200 text-gray-700 grid place-items-center font-semibold">
      {initials.toUpperCase()}
    </div>
  );
};

export default function TopDriversCard({
  className = "",
  initialQuery = { limit: 5, sort: "rating" },
}: Props) {
  const [query, setQuery] = useState<GetTopDriversParams>(initialQuery);
  const [rows, setRows] = useState<TopDriver[]>([]);
  const [meta, setMeta] = useState({ page: 1, limit: initialQuery.limit ?? 5, totalPages: 1 });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const load = async (overrides: Partial<GetTopDriversParams> = {}) => {
    setLoading(true);
    setErr(null);
    try {
      const q = { ...query, ...overrides };
      const res = await getTopDrivers(q);
      // replace on page change; append only when page increases by 1
      if ((q.page || 1) > meta.page) {
        setRows((prev) => [...prev, ...res.drivers]);
      } else {
        setRows(res.drivers);
      }
      setMeta({
        page: res.meta.page,
        limit: res.meta.limit,
        totalPages: res.meta.totalPages,
      });
      setQuery(q);
    } catch (e: any) {
      const msg = e?.response?.data?.message || "Failed to load drivers";
      setErr(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load({ page: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const canLoadMore = meta.page < meta.totalPages;

  return (
    <div className={`bg-white rounded-2xl border shadow-sm p-5 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Top Drivers</h3>
        <div className="flex items-center gap-2">
          <input
            placeholder="Search name…"
            className="border rounded-lg px-2 py-1 text-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter") load({ page: 1, search: (e.target as HTMLInputElement).value });
            }}
          />
          <select
            defaultValue={query.sort || "rating"}
            className="border rounded-lg px-2 py-1 text-sm"
            onChange={(e) => load({ page: 1, sort: e.target.value as any })}
          >
            <option value="rating">Top Rated</option>
            <option value="count">Most Reviewed</option>
            <option value="recent">Most Recent</option>
          </select>
        </div>
      </div>

      {err && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 text-red-700 px-4 py-3">
          {err}
        </div>
      )}

      <div className="space-y-3">
        {rows.map((d) => (
          <div
            key={d.id}
            className="flex items-center gap-4 p-3 rounded-xl border border-gray-100 hover:bg-gray-50"
          >
            <Avatar name={d.name} src={d.profilePicture ?? undefined} />
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-gray-900 truncate">{d.name}</div>
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <AiFillStar className="text-yellow-400" />
                <span>{d.rating.toFixed(1)}</span>
                <span className="text-gray-400">·</span>
                <span>{d.ratingCount} review{d.ratingCount === 1 ? "" : "s"}</span>
              </div>
            </div>
            <VerifiedBadge ok={d.verified} />
          </div>
        ))}

        {loading && rows.length === 0 && (
          <div className="p-6 text-center text-gray-500">Loading…</div>
        )}

        {!loading && rows.length === 0 && !err && (
          <div className="p-6 text-center text-gray-500">No drivers found.</div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="text-xs text-gray-500">
          Page <b>{meta.page}</b> of <b>{meta.totalPages}</b>
        </div>
        <div className="flex items-center gap-2">
          <button
            disabled={loading || meta.page <= 1}
            onClick={() => load({ page: Math.max(1, meta.page - 1) })}
            className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-50"
          >
            ← Prev
          </button>
          {canLoadMore ? (
            <button
              disabled={loading}
              onClick={() => load({ page: meta.page + 1 })}
              className="px-3 py-1.5 rounded-lg bg-[#22c55e] text-white text-sm hover:bg-green-500 disabled:opacity-60"
            >
              Load more →
            </button>
          ) : (
            <button
              disabled
              className="px-3 py-1.5 rounded-lg border text-sm opacity-50"
            >
              End
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
