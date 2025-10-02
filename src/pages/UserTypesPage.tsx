import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  BusinessUser,
  IndividualUser,
  Role,
  UsersResponse,
  getUsersByRole,
} from "../api/deliveryService";
import UsersTable, { BaseUser } from "../components/users/UsersTable";
import * as XLSX from "xlsx";

type AnyUser = BusinessUser | IndividualUser;

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

const UserTypesPage: React.FC = () => {
  const [role, setRole] = useState<Role>("individual");
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [users, setUsers] = useState<AnyUser[]>([]);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [err, setErr] = useState<string>("");

  const queryKey = useMemo(() => ({ role, page, limit }), [role, page, limit]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setErr("");
    try {
      const res: UsersResponse<AnyUser> = await getUsersByRole<AnyUser>(
        queryKey.role,
        queryKey.limit,
        queryKey.page
      );
      const list = Array.isArray(res?.data?.users)
        ? (res.data!.users as AnyUser[])
        : [];
      setUsers(list);
      setTotalPages(Number(res?.totalPages || 1));
    } catch (e: any) {
      setErr(e?.message || "Failed to load users");
      setUsers([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [queryKey]);

  // NEW function:
  const exportAllToXlsx = async () => {
    try {
      const all: AnyUser[] = [];
      let pg = 1;
      const pageSize = 200; // fetch in chunks

      while (true) {
        const res = await getUsersByRole<AnyUser>(role, pageSize, pg);
        const batch = (res?.data?.users ?? []) as AnyUser[];
        all.push(...batch);
        if (!res?.totalPages || pg >= res.totalPages || batch.length === 0)
          break;
        pg += 1;
      }

      // include ALL fields from the API, plus a few normalized helpers
      const rows = all.map((u) => ({
        id: u._id || u.id || "",
        role,
        name:
          role === "business"
            ? (u as any).contactPerson || (u as any).businessName || ""
            : (u as any).fullName || "",
        ...u, // keep every API field
      }));

      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, `${role}-users`);
      XLSX.writeFile(wb, `users_${role}_all.xlsx`);
    } catch (e) {
      console.error(e);
      alert("Export failed");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Reset page when role/limit changes
  useEffect(() => {
    setPage(1);
  }, [role, limit]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Users</h1>
          <SegmentedToggle value={role} onChange={setRole} />
        </div>
      </div>

      {/* Table */}
      <UsersTable
        role={role}
        rows={users as BaseUser[]}
        loading={loading}
        error={err}
        page={page}
        totalPages={totalPages}
        limit={limit}
        onLimitChange={(n) => setLimit(n)}
        onPrev={() => setPage((p) => Math.max(1, p - 1))}
        onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
        onExportAll={exportAllToXlsx} 
      />
    </div>
  );
};

export default UserTypesPage;
