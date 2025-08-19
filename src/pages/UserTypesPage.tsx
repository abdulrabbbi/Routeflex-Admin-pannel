import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  BusinessUser,
  IndividualUser,
  Role,
  UsersResponse,
  getUsersByRole,
} from "../api/deliveryService"; 

const BASE_URL = "http://localhost:5000";

const PLACEHOLDER_AVATAR =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'><circle cx='40' cy='40' r='40' fill='#e5e7eb'/></svg>`
  );

const badImageStrings = new Set(["imagesavatar of no image.avif", "null", "undefined"]);

function isBadImage(path?: string | null) {
  if (!path) return true;
  return badImageStrings.has(String(path).trim().toLowerCase());
}

function getImageUrl(path?: string | null) {
  if (!path || isBadImage(path)) return null;
  if (/^https?:\/\//i.test(path)) return path;
  if (path.startsWith("/") && BASE_URL) return `${BASE_URL}${path}`;
  return path; // as-is fallback
}

function formatDate(iso?: string) {
  try {
    return iso ? new Date(iso).toLocaleDateString() : "-";
  } catch {
    return "-";
  }
}

function getDisplayName(
  user: BusinessUser | IndividualUser | undefined,
  role: Role
): string {
  if (!user) return "-";

  if (role === "business" && "businessName" in user) {
    return user.contactPerson || user.businessName || "-";
  }

  return "fullName" in user ? user.fullName || "-" : "-";
}

const SegmentedToggle: React.FC<{
  value: Role;
  onChange: (v: Role) => void;
}> = ({ value, onChange }) => {
  const options: Array<{ id: Role; label: string }> = [
    { id: "individual", label: "Individual" },
    { id: "business", label: "Business" },
  ];
  return (
    <div className="inline-flex rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
      {options.map((opt) => (
        <button
          key={opt.id}
          onClick={() => onChange(opt.id)}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
            value === opt.id
              ? "bg-[#22c55e] text-white shadow"
              : "text-gray-700 hover:bg-gray-50"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
};

const Pagination: React.FC<{
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
}> = ({ page, totalPages, onPrev, onNext }) => (
  <div className="flex items-center justify-between gap-3">
    <button
      onClick={onPrev}
      disabled={page <= 1}
      className="px-4 py-2 rounded-lg border text-sm font-medium disabled:opacity-50 hover:bg-gray-50"
    >
      ← Previous
    </button>
    <span className="text-sm text-gray-600">
      Page <strong>{page}</strong> of <strong>{Math.max(totalPages, 1)}</strong>
    </span>
    <button
      onClick={onNext}
      disabled={page >= totalPages}
      className="px-4 py-2 rounded-lg border text-sm font-medium disabled:opacity-50 hover:bg-gray-50"
    >
      Next →
    </button>
  </div>
);

type AnyUser = BusinessUser | IndividualUser;

const UserTypesPage: React.FC = () => {
  const [role, setRole] = useState<Role>("individual"); // toggle between "individual" and "business"
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [users, setUsers] = useState<AnyUser[]>([]);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [err, setErr] = useState<string>("");

  const queryKey = useMemo(() => ({ role, page, limit }), [role, page, limit]);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setErr("");
    try {
      const res: UsersResponse<AnyUser> = await getUsersByRole<AnyUser>(
        queryKey.role,
        queryKey.limit,
        queryKey.page
      );
      const arr = Array.isArray(res?.data?.users) ? (res.data!.users as AnyUser[]) : [];
      setUsers(arr);
      setTotalPages(Number(res?.totalPages || 1));
    } catch (e: any) {
      setErr(e?.message || "Failed to load users");
      setUsers([]);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  }, [queryKey]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Reset page when role/limit changes
  useEffect(() => {
    setPage(1);
  }, [role, limit]);

  const onPrev = () => setPage((p) => Math.max(1, p - 1));
  const onNext = () => setPage((p) => Math.min(totalPages, p + 1));

  // CSV export
  const handleExport = () => {
    const headers = ["Name", "Email", "Phone", "Joining Date"];
    const rows = users.map((u) => [
      getDisplayName(u, role),
      u?.email ?? "-",
      u?.phone ?? "-",
      formatDate(u?.createdAt),
    ]);

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
    a.download = `users-${role}-page${page}-${ts}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Users</h1>
          <SegmentedToggle value={role} onChange={setRole} />
        </div>

        <div className="flex items-center gap-3">
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

          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border bg-white hover:bg-gray-50 text-sm font-medium"
          >
            ⬇️ Export (.csv)
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-[#f0fdf4]">
                <th className="px-4 py-3 text-xs text-[#22c55e] uppercase text-center">Profile</th>
                <th className="px-4 py-3 text-xs text-[#22c55e] uppercase text-center">Name</th>
                <th className="px-4 py-3 text-xs text-[#22c55e] uppercase text-center">Phone</th>
                <th className="px-4 py-3 text-xs text-[#22c55e] uppercase text-center">Email</th>
                <th className="px-4 py-3 text-xs text-[#22c55e] uppercase text-center">Joining Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : err ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-red-600">
                    {err}
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const key = u._id || u.id || Math.random().toString(36);
                  const name = getDisplayName(u, role);
                  const imgSrc = getImageUrl(u.profilePicture);
                  return (
                    <tr key={key} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap text-center">
                        <img
                          src={imgSrc || PLACEHOLDER_AVATAR}
                          alt={name}
                          className="w-10 h-10 rounded-full object-cover inline-block bg-gray-200"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = PLACEHOLDER_AVATAR;
                          }}
                        />
                      </td>
                      <td className="px-4 py-4 text-sm text-center text-[#1e1e38]">{name}</td>
                      <td className="px-4 py-4 text-sm text-center text-[#1e1e38]">{u.phone || "-"}</td>
                      <td className="px-4 py-4 text-sm text-center text-[#1e1e38]">{u.email || "-"}</td>
                      <td className="px-4 py-4 text-sm text-center text-[#1e1e38]">
                        {formatDate(u.createdAt)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        <div className="px-4 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <Pagination page={page} totalPages={totalPages} onPrev={onPrev} onNext={onNext} />
            <div className="text-xs text-gray-500">
              Showing <strong>{users.length}</strong> item(s)
              {limit ? ` • Limit ${limit}` : ""} • Role:{" "}
              <strong className="capitalize">{role}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserTypesPage;
