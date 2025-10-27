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

interface Props {
  role: Role;
  title?: string;
}

const UserTypesPage: React.FC<Props> = ({ role, title }) => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [users, setUsers] = useState<AnyUser[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");


  
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

  const exportAllToXlsx = async () => {
    try {
      const all: AnyUser[] = [];
      let pg = 1;
      const pageSize = 200;

      while (true) {
        const res = await getUsersByRole<AnyUser>(role, pageSize, pg);
        const batch = (res?.data?.users ?? []) as AnyUser[];
        all.push(...batch);
        if (!res?.totalPages || pg >= res.totalPages || batch.length === 0)
          break;
        pg += 1;
      }

      const rows = all.map((u) => ({
        id: u._id || (u as any).id || "",
        role,
        name:
          role === "business"
            ? (u as any).contactPerson || (u as any).businessName || ""
            : (u as any).fullName || "",
        ...u,
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

  useEffect(() => {
    setPage(1);
  }, [role, limit]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">
          {title || (role === "business" ? "Business Users" : "Individual Users")}
        </h1>
      </div>

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
