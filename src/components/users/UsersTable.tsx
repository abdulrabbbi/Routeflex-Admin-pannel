import React, { useMemo } from "react";
import { TableSkeleton } from "../../components/ui/shared/Skeleton";
import TablePager from "../../components/ui/shared/TablePager";
import { getImageUrl } from "../../utils/getImageUrl";

/** Keep the types light-weight & flexible */
export type Role = "business" | "individual";
export type BaseUser = {
  _id?: string;
  id?: string;
  email?: string;
  phone?: string;
  profilePicture?: string | null;
  createdAt?: string;
  // business
  businessName?: string;
  contactPerson?: string;
  // individual
  fullName?: string;
  // extra fields ignored
  [k: string]: unknown;
};

const PLACEHOLDER_AVATAR =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'><circle cx='40' cy='40' r='40' fill='#e5e7eb'/></svg>`
  );

const MIN_ROWS = 10;

function formatDate(iso?: string) {
  if (!iso) return "-";
  try {
    return new Date(iso).toLocaleDateString();
  } catch {
    return "-";
  }
}

function getDisplayName(user: BaseUser | undefined, role: Role): string {
  if (!user) return "-";
  if (role === "business") {
    return (
      (user.contactPerson as string) || (user.businessName as string) || "-"
    );
  }
  return (user.fullName as string) || "-";
}

export default function UsersTable({
  role,
  rows,
  loading,
  error,
  page,
  totalPages,
  limit,
  onLimitChange,
  onPrev,
  onNext,
  onExportAll,
}: {
  role: Role;
  rows: BaseUser[];
  loading?: boolean;
  error?: string;
  page: number;
  totalPages: number;
  limit: number;
  onLimitChange: (n: number) => void;
  onPrev: () => void;
  onNext: () => void;
  onExportAll?: () => void;
}) {
  // Normalize rows to fixed height (pad with blanks)
  const displayRows = useMemo(() => {
    if (loading) return [];
    const pad = Math.max(MIN_ROWS - rows.length, 0);
    return [
      ...rows,
      ...Array.from({ length: pad }).map(() => ({} as BaseUser)),
    ];
  }, [rows, loading]);

  return (
    <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
      {/* Header controls (Rows + Pager) */}
      <div className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Rows:</label>
          <select
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            className="border rounded-lg px-2 py-1 text-sm"
          >
            {[10, 20, 50].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
          <button
            type="button"
            onClick={onExportAll}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
          >
            ⬇️ Export (.xlsx)
          </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr className="bg-[#f0fdf4]">
              <th className="px-4 py-3 text-xs text-[#22c55e] uppercase text-center">
                Profile
              </th>
              <th className="px-4 py-3 text-xs text-[#22c55e] uppercase text-center">
                Name
              </th>
              <th className="px-4 py-3 text-xs text-[#22c55e] uppercase text-center">
                Phone
              </th>
              <th className="px-4 py-3 text-xs text-[#22c55e] uppercase text-center">
                Email
              </th>
              <th className="px-4 py-3 text-xs text-[#22c55e] uppercase text-center">
                Joining Date
              </th>
            </tr>
          </thead>

          {/* Loading */}
          {loading ? (
            <TableSkeleton rows={MIN_ROWS} columns={5} />
          ) : error ? (
            <tbody>
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-red-600">
                  {error}
                </td>
              </tr>
            </tbody>
          ) : rows.length === 0 ? (
            <tbody>
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  No users found
                </td>
              </tr>
            </tbody>
          ) : (
            <tbody className="divide-y divide-gray-200">
              {displayRows.map((u, i) => {
                const isPad = !u._id && !u.id && !u.email && !u.phone;
                if (isPad) {
                  return (
                    <tr key={`pad-${i}`}>
                      {Array.from({ length: 5 }).map((_, c) => (
                        <td key={c} className="px-4 py-4">
                          <div className="h-4 w-28 bg-gray-50 rounded" />
                        </td>
                      ))}
                    </tr>
                  );
                }

                const key = u._id || u.id || `row-${i}`;
                const name = getDisplayName(u, role);
                const imgSrc =
                  getImageUrl(u.profilePicture || "") || PLACEHOLDER_AVATAR;

                return (
                  <tr key={key} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <img
                        src={imgSrc}
                        alt={name}
                        className="w-10 h-10 rounded-full object-cover inline-block bg-gray-200"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src =
                            PLACEHOLDER_AVATAR;
                        }}
                      />
                    </td>
                    <td className="px-4 py-4 text-sm text-center text-[#1e1e38]">
                      {name}
                    </td>
                    <td className="px-4 py-4 text-sm text-center text-[#1e1e38]">
                      {u.phone || "-"}
                    </td>
                    <td className="px-4 py-4 text-sm text-center text-[#1e1e38]">
                      {u.email || "-"}
                    </td>
                    <td className="px-4 py-4 text-sm text-center text-[#1e1e38]">
                      {formatDate(u.createdAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          )}
        </table>
      </div>

      {/* Footer summary */}
      <div className="px-4 py-4 text-xs text-gray-500 flex items-center justify-between">
        <span>
          Showing <strong>{rows.length}</strong> item(s) • Role{" "}
          <strong className="capitalize">{role}</strong>
        </span>
        <TablePager
          page={page}
          totalPages={totalPages}
          onPrev={onPrev}
          onNext={onNext}
          disabled={loading}
        />
      </div>
    </div>
  );
}
